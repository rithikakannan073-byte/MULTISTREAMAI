import os
import json
import logging
import cv2
import torch
import torchvision.transforms.functional as TF
import numpy as np
import traceback
from pathlib import Path

from config import settings
from pipeline import real_store
from pipeline.attributes import dominant_upper_color
from pipeline.reid import get_extractor, match_cross_camera
from pipeline.tracker import CentroidTracker
from pipeline.processor import get_detector

logger = logging.getLogger("epfl_pipeline")

def process_epfl_camera(camera_folder: str, camera_id: str, max_frames: int = 100, fps: float = 25.0):
    dataset_root = Path(settings.EPFL_RLC_DATASET_ROOT)
    frame_dir = dataset_root / "frames" / camera_folder
    
    if not frame_dir.exists():
        logger.error(f"EPFL dataset frame directory not found: {frame_dir}")
        return False
        
    frames = sorted([f for f in os.listdir(frame_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    if not frames:
        logger.error(f"No frames found in {frame_dir}")
        return False
        
    frames = frames[:max_frames]
    total_frames = len(frames)
    
    video_id = f"epfl_{camera_folder}"
    
    # We will also create an MP4 proxy for the frontend to play
    video_path = real_store.VIDEO_DIR / f"{video_id}.mp4"
    real_store.delete_video_data(video_id)
    real_store.execute(
        "INSERT INTO videos (video_id, camera_id, filename, source_path, fps, frame_count, status, progress) "
        "VALUES (?, ?, ?, ?, ?, ?, 'processing', 0)",
        (video_id, camera_id, f"EPFL_{camera_folder}", str(frame_dir), fps, total_frames)
    )
    
    detector = get_detector()
    tracker = CentroidTracker(max_disappeared=15, max_distance=80)
    reid = get_extractor()
    
    tracks_data = {}
    
    # Initialize VideoWriter
    first_frame_path = frame_dir / frames[0]
    sample_img = cv2.imread(str(first_frame_path))
    height, width = sample_img.shape[:2]
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out_video = cv2.VideoWriter(str(video_path), fourcc, fps, (width, height))
    
    for frame_idx, filename in enumerate(frames):
        filepath = frame_dir / filename
        frame = cv2.imread(str(filepath))
        if frame is None:
            continue
            
        out_video.write(frame)
        
        # Relative timestamp (since absolute is unknown)
        pts = frame_idx / fps
        
        # 1. Detection
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        t_img = TF.to_tensor(img_rgb)
        with torch.no_grad():
            preds = detector([t_img])[0]
            
        # Filter for persons
        rects = []
        boxes_data = []
        for i in range(len(preds['labels'])):
            if preds['labels'][i] == 1 and preds['scores'][i] > 0.4:
                box = preds['boxes'][i].numpy().astype(int)
                rects.append((box[0], box[1], box[2], box[3]))
                boxes_data.append((box, preds['scores'][i].item()))
                
        # 2. Tracking
        objects = tracker.update(rects)
        
        # Assign bounding boxes to tracked objects
        for obj_id, centroid in objects.items():
            cx, cy = centroid
            best_box, best_conf = None, 0
            for (box, conf) in boxes_data:
                bx, by = (box[0]+box[2])//2, (box[1]+box[3])//2
                if abs(cx - bx) < 50 and abs(cy - by) < 50:
                    best_box = box
                    best_conf = conf
                    break
            
            if best_box is not None:
                real_store.execute(
                    "INSERT INTO detections (video_id, frame_idx, pts, class_id, class_name, conf, x1, y1, x2, y2, track_id) "
                    "VALUES (?, ?, ?, 1, 'person', ?, ?, ?, ?, ?, ?)",
                    (video_id, frame_idx, pts, best_conf, int(best_box[0]), int(best_box[1]), int(best_box[2]), int(best_box[3]), obj_id)
                )
                
                if obj_id not in tracks_data:
                    tracks_data[obj_id] = {
                        "first_pts": pts, "first_frame": frame_idx,
                        "crops": [], "bboxes": [], "conf": [], "best_frame": None, "best_frame_idx": None,
                        "source_filename": filename
                    }
                
                crop = frame[max(0, best_box[1]):min(height, best_box[3]), max(0, best_box[0]):min(width, best_box[2])]
                if crop.size > 0:
                    tracks_data[obj_id]["crops"].append(crop)
                    tracks_data[obj_id]["bboxes"].append(best_box)
                    tracks_data[obj_id]["conf"].append(best_conf)
                    
                    if tracks_data[obj_id]["best_frame"] is None or best_conf > max(tracks_data[obj_id]["conf"]):
                        tracks_data[obj_id]["best_frame"] = frame.copy()
                        tracks_data[obj_id]["best_frame_idx"] = frame_idx
                        tracks_data[obj_id]["source_filename"] = filename
                        
        if frame_idx % 10 == 0:
            real_store.update_video(video_id, progress=(frame_idx / total_frames) * 90.0)

    out_video.release()
    
    # 3. Post-process tracks (Re-ID, Colors, Evidence, Global Matching)
    for obj_id, data in tracks_data.items():
        if len(data["crops"]) < 2:
            continue
            
        track_key = f"{video_id}:{obj_id}"
        
        upper_color, color_frac = dominant_upper_color(data["crops"])
        
        embeddings = [reid.extract(crop) for crop in data["crops"][:5]]
        mean_emb = np.mean(embeddings, axis=0) if embeddings else np.zeros(576)
        norm = np.linalg.norm(mean_emb)
        if norm > 0: mean_emb = mean_emb / norm
        
        global_person_id, possible_matches = match_cross_camera(real_store, camera_id, mean_emb.tolist(), upper_color)
        
        for m in possible_matches:
            real_store.execute(
                "INSERT INTO possible_matches (track_key_a, track_key_b, similarity) VALUES (?, ?, ?)",
                (track_key, m["track_key"], m["similarity"])
            )
        
        ev_id = f"ev_{track_key.replace(':','_')}"
        ev_path = real_store.EVIDENCE_DIR / f"{ev_id}.jpg"
        ev_anno_path = real_store.EVIDENCE_DIR / f"{ev_id}_anno.jpg"
        
        if data["best_frame"] is not None:
            cv2.imwrite(str(ev_path), data["best_frame"])
            
            best_idx = np.argmax(data["conf"])
            bbox = data["bboxes"][best_idx]
            anno_img = data["best_frame"].copy()
            cv2.rectangle(anno_img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
            cv2.putText(anno_img, f"{global_person_id}", (bbox[0], bbox[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,255,0), 2)
            cv2.imwrite(str(ev_anno_path), anno_img)
            
            real_store.execute(
                "INSERT INTO evidence (evidence_id, video_id, camera_id, frame_idx, pts, track_key, confidence, image_path, annotated_image_path, bbox) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (ev_id, video_id, camera_id, data["best_frame_idx"], data["first_pts"], track_key, float(max(data["conf"])), str(ev_path), str(ev_anno_path), json.dumps(bbox.tolist()))
            )
            
            real_store.execute(
                "INSERT INTO tracks (track_key, video_id, camera_id, track_id, class_name, first_frame, first_pts, num_detections, mean_conf, upper_color, upper_color_frac, embedding, global_person_id, thumbnail_path) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (track_key, video_id, camera_id, obj_id, "person", data["first_frame"], data["first_pts"], len(data["crops"]), float(np.mean(data["conf"])), upper_color, float(color_frac), json.dumps(mean_emb.tolist()), global_person_id, str(ev_path))
            )
            
            event_id = f"evt_{track_key.replace(':','_')}_entry"
            desc = f"Subject {global_person_id} detected in {camera_id}"
            
            real_store.execute(
                "INSERT INTO events (event_id, video_id, camera_id, event_type, track_key, frame_idx, pts, confidence, description, evidence_id) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (event_id, video_id, camera_id, "entry", track_key, data["best_frame_idx"], data["first_pts"], float(max(data["conf"])), desc, ev_id)
            )

    real_store.update_video(video_id, status="done", progress=100.0)
    logger.info(f"Processed EPFL {camera_folder}: {total_frames} frames, {len(tracks_data)} tracks")
    
    return {
        "camera_folder": camera_folder,
        "frames_loaded": total_frames,
        "tracks_created": len(tracks_data)
    }

def process_all_epfl(max_frames=100):
    cameras = [("cam0", "CAM-01"), ("cam1", "CAM-02"), ("cam2", "CAM-03")]
    results = []
    for cam_folder, cam_id in cameras:
        res = process_epfl_camera(cam_folder, cam_id, max_frames=max_frames)
        results.append(res)
    return results
