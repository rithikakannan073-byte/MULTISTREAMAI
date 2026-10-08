import uuid
import threading
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import List, Dict, Any

from pipeline.real_store import get_video, active_video_ids, update_video, VIDEO_DIR, delete_video_data, execute
from pipeline.processor import process_video_task

router = APIRouter(prefix="/api/videos", tags=["Video Storage"])

@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    camera_id: str = Form(...),
    start_time: str = Form(None)
):
    video_id = f"vid_{uuid.uuid4().hex[:8]}"
    ext = Path(file.filename).suffix
    save_path = VIDEO_DIR / f"{video_id}{ext}"
    
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Clear previous footage data for this camera
    from pipeline.real_store import query_one
    old_video = query_one("SELECT video_id FROM videos WHERE camera_id=?", (camera_id,))
    if old_video:
        delete_video_data(old_video["video_id"])

    execute(
        "INSERT INTO videos (video_id, camera_id, filename, source_path, start_time, status) "
        "VALUES (?, ?, ?, ?, ?, 'uploaded')",
        (video_id, camera_id, file.filename, str(save_path), start_time)
    )
    
    # Run pipeline in background
    thread = threading.Thread(target=process_video_task, args=(video_id, camera_id, str(save_path)))
    thread.start()
    
    return {"video_id": video_id, "status": "processing", "message": "Video uploaded and processing started."}

@router.get("")
def list_videos():
    from pipeline.real_store import query
    return query("SELECT * FROM videos ORDER BY created_at DESC")

@router.get("/{video_id}")
def get_video_status(video_id: str):
    v = get_video(video_id)
    if not v:
        raise HTTPException(status_code=404, detail="Video not found")
    return v

@router.post("/epfl-ingest")
def ingest_epfl_dataset(max_frames: int = 100):
    from pipeline.epfl_processor import process_all_epfl
    try:
        results = process_all_epfl(max_frames=max_frames)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

