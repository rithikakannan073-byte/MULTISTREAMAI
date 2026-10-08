"""
Real-footage data store (SQLite).

Everything in here is produced by the CV pipeline from uploaded video files.
Nothing in this module may read from, or fall back to, the demo DataStore.
"""
import json
import sqlite3
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional

STORAGE_DIR = Path(__file__).resolve().parent.parent.parent / "datasets"
VIDEO_DIR = STORAGE_DIR / "real_cctv"
EVIDENCE_DIR = STORAGE_DIR / "evidence"
DB_PATH = STORAGE_DIR / "real.db"

for d in (STORAGE_DIR, VIDEO_DIR, EVIDENCE_DIR):
    d.mkdir(parents=True, exist_ok=True)

# Fixed camera *slots*. These are configuration (where a camera is mounted),
# not surveillance data. A slot has no footage until a real video is uploaded.
CAMERA_SLOTS: Dict[str, Dict[str, str]] = {
    "CAM-01": {"name": "Camera 01 – Main Gate", "location": "Main Gate"},
    "CAM-02": {"name": "Camera 02 – Corridor", "location": "Corridor"},
    "CAM-03": {"name": "Camera 03 – Reception", "location": "Reception"},
    "CAM-04": {"name": "Camera 04 – Parking Lot", "location": "Parking Lot"},
}

_SCHEMA = """
CREATE TABLE IF NOT EXISTS videos (
    video_id TEXT PRIMARY KEY,
    camera_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    source_path TEXT NOT NULL,
    preview_path TEXT,
    size_bytes INTEGER,
    fps REAL,
    frame_count INTEGER,
    duration REAL,
    width INTEGER,
    height INTEGER,
    start_time TEXT,
    status TEXT NOT NULL,          -- uploaded | processing | done | failed
    progress REAL DEFAULT 0,
    error TEXT,
    stats TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS detections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT NOT NULL,
    frame_idx INTEGER NOT NULL,
    pts REAL NOT NULL,
    class_id INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    conf REAL NOT NULL,
    x1 REAL, y1 REAL, x2 REAL, y2 REAL,
    track_id INTEGER
);
CREATE INDEX IF NOT EXISTS idx_det_video_frame ON detections(video_id, frame_idx);
CREATE TABLE IF NOT EXISTS tracks (
    track_key TEXT PRIMARY KEY,    -- {video_id}:{track_id}
    video_id TEXT NOT NULL,
    camera_id TEXT NOT NULL,
    track_id INTEGER NOT NULL,     -- ByteTrack ID, verbatim
    class_name TEXT NOT NULL,
    first_frame INTEGER, last_frame INTEGER,
    first_pts REAL, last_pts REAL,
    num_detections INTEGER,
    mean_conf REAL,
    upper_color TEXT,
    upper_color_frac REAL,
    embedding TEXT,                -- JSON list, OSNet feature (null if Re-ID unavailable)
    global_person_id TEXT,
    thumbnail_path TEXT
);
CREATE TABLE IF NOT EXISTS global_persons (
    person_id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS possible_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_key_a TEXT NOT NULL,
    track_key_b TEXT NOT NULL,
    similarity REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
    event_id TEXT PRIMARY KEY,
    video_id TEXT NOT NULL,
    camera_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    track_key TEXT,
    related_track_key TEXT,
    frame_idx INTEGER NOT NULL,
    pts REAL NOT NULL,
    end_pts REAL,
    confidence REAL NOT NULL,
    description TEXT NOT NULL,
    evidence_id TEXT
);
CREATE TABLE IF NOT EXISTS evidence (
    evidence_id TEXT PRIMARY KEY,
    video_id TEXT NOT NULL,
    camera_id TEXT NOT NULL,
    frame_idx INTEGER NOT NULL,
    pts REAL NOT NULL,
    track_key TEXT,
    confidence REAL,
    image_path TEXT NOT NULL,
    annotated_image_path TEXT,
    video_clip_path TEXT,
    bbox TEXT
);
CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    title TEXT NOT NULL,
    description TEXT NOT NULL
);
"""

_lock = threading.RLock()


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


_conn = _connect()
_conn.executescript(_SCHEMA)
_conn.commit()


def execute(sql: str, params: tuple = ()) -> None:
    with _lock:
        _conn.execute(sql, params)
        _conn.commit()


def executemany(sql: str, rows: List[tuple]) -> None:
    if not rows:
        return
    with _lock:
        _conn.executemany(sql, rows)
        _conn.commit()


def query(sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
    with _lock:
        cur = _conn.execute(sql, params)
        return [dict(r) for r in cur.fetchall()]


def query_one(sql: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    rows = query(sql, params)
    return rows[0] if rows else None


# ---------- helpers ----------

def update_video(video_id: str, **fields: Any) -> None:
    if not fields:
        return
    if "stats" in fields and not isinstance(fields["stats"], str):
        fields["stats"] = json.dumps(fields["stats"])
    cols = ", ".join(f"{k}=?" for k in fields)
    execute(f"UPDATE videos SET {cols} WHERE video_id=?", tuple(fields.values()) + (video_id,))


def get_video(video_id: str) -> Optional[Dict[str, Any]]:
    return query_one("SELECT * FROM videos WHERE video_id=?", (video_id,))


def latest_video_for_camera(camera_id: str) -> Optional[Dict[str, Any]]:
    return query_one(
        "SELECT * FROM videos WHERE camera_id=? ORDER BY created_at DESC, rowid DESC LIMIT 1",
        (camera_id,),
    )


def active_video_ids() -> List[str]:
    """The latest successfully-processed video per camera slot."""
    ids = []
    for cam in CAMERA_SLOTS:
        v = query_one(
            "SELECT video_id FROM videos WHERE camera_id=? AND status='done' "
            "ORDER BY created_at DESC, rowid DESC LIMIT 1",
            (cam,),
        )
        if v:
            ids.append(v["video_id"])
    return ids


def delete_video_data(video_id: str) -> None:
    """Remove derived data for a video (used when a camera slot is re-uploaded/reprocessed)."""
    with _lock:
        keys = [r["track_key"] for r in query("SELECT track_key FROM tracks WHERE video_id=?", (video_id,))]
        for table in ("detections", "tracks", "events", "evidence"):
            _conn.execute(f"DELETE FROM {table} WHERE video_id=?", (video_id,))
        _conn.execute("DELETE FROM alerts WHERE event_id NOT IN (SELECT event_id FROM events)")
        for k in keys:
            _conn.execute("DELETE FROM possible_matches WHERE track_key_a=? OR track_key_b=?", (k, k))
        _conn.execute(
            "DELETE FROM global_persons WHERE person_id NOT IN "
            "(SELECT DISTINCT global_person_id FROM tracks WHERE global_person_id IS NOT NULL)"
        )
        _conn.commit()


def next_person_id() -> str:
    row = query_one("SELECT person_id FROM global_persons ORDER BY person_id DESC LIMIT 1")
    n = int(row["person_id"][1:]) + 1 if row else 1
    pid = f"P{n:03d}"
    execute("INSERT INTO global_persons(person_id) VALUES (?)", (pid,))
    return pid


def format_time(video: Dict[str, Any], pts: Optional[float]) -> Optional[str]:
    """Absolute wall-clock time if the camera's recording start time is known,
    otherwise video-relative time. Never invents a clock time."""
    if pts is None:
        return None
    if video and video.get("start_time"):
        from datetime import datetime, timedelta
        try:
            start = datetime.fromisoformat(video["start_time"])
            return (start + timedelta(seconds=pts)).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        except ValueError:
            pass
    h = int(pts // 3600)
    m = int((pts % 3600) // 60)
    s = pts % 60
    return f"+{h:02d}:{m:02d}:{s:06.3f}"


def media_url(path: Optional[str]) -> Optional[str]:
    """Convert an on-disk storage path into a URL served at /media."""
    if not path:
        return None
    rel = Path(path).resolve().relative_to(STORAGE_DIR.resolve())
    return "/media/" + rel.as_posix()
