import json
import logging
import threading
from pathlib import Path
import cv2
import torch
import torchvision.models.detection as detection
import torchvision.transforms.functional as TF
import numpy as np
import traceback

from pipeline import real_store
from pipeline.attributes import dominant_upper_color
from pipeline.reid import get_extractor, match_cross_camera
from pipeline.tracker import CentroidTracker

logger = logging.getLogger("cv_pipeline")

# Initialize torchvision model on CPU
_detector = None
def get_detector():
    global _detector
    if _detector is None:
        _detector = detection.ssdlite320_mobilenet_v3_large(weights='DEFAULT')
        _detector.eval()
    return _detector

def process_video_task(video_id: str, camera_id: str, filepath: str):
    real_store.update_video(video_id, status="processing", progress=0.0)
    try:
        _run_pipeline(video_id, camera_id, filepath)
        real_store.update_video(video_id, status="done", progress=100.0)
    except Exception as e:
        logger.error(f"Pipeline failed for {video_id}: {e}")
        traceback.print_exc()
        real_store.update_video(video_id, status="failed", error=str(e))

def _run_pipeline(video_id: str, camera_id: str, filepath: str):
    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        raise RuntimeError("Failed to open video file")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    real_store.update_video(video_id, fps=fps, width=width, height=height, frame_count=total_frames)

    detector = get_detector()
    tracker = CentroidTracker(max_disappeared=15, max_distance=80)
    reid = get_extractor()

    stride = max(1, int(fps // 5))  # Process at ~5 fps
    frame_idx = 0

    tracks_data = {}  # track_id -> { "crops": [], "bboxes": [], "conf": [], "first_pts": ... }

    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        pts = frame_idx / fps

        if frame_idx % stride == 0:
            # 1. Detection
            img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            t_img = TF.to_tensor(img_rgb)
            with torch.no_grad():
                preds = detector([t_img])[0]
            
            # Filter for persons (COCO label 1), conf > 0.4
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
                # find closest bbox
                for (box, conf) in boxes_data:
                    bx, by = (box[0]+box[2])//2, (box[1]+box[3])//2
                    if abs(cx - bx) < 50 and abs(cy - by) < 50:
                        best_box = box
                        best_conf = conf
                        break
                
                if best_box is not None:
                    # Save to detection log
                    real_store.execute(
                        "INSERT INTO detections (video_id, frame_idx, pts, class_id, class_name, conf, x1, y1, x2, y2, track_id) "
                        "VALUES (?, ?, ?, 1, 'person', ?, ?, ?, ?, ?, ?)",
                        (video_id, frame_idx, pts, best_conf, int(best_box[0]), int(best_box[1]), int(best_box[2]), int(best_box[3]), obj_id)
                    )
                    
                    if obj_id not in tracks_data:
                        tracks_data[obj_id] = {
                            "first_pts": pts, "first_frame": frame_idx,
                            "crops": [], "bboxes": [], "conf": [], "best_frame": None, "best_frame_idx": None
                        }
                    
                    # Crop image for Re-ID
                    crop = frame[max(0, best_box[1]):min(height, best_box[3]), max(0, best_box[0]):min(width, best_box[2])]
                    if crop.size > 0:
                        tracks_data[obj_id]["crops"].append(crop)
                        tracks_data[obj_id]["bboxes"].append(best_box)
                        tracks_data[obj_id]["conf"].append(best_conf)
                        
                        # Save the best high-res frame for evidence later
                        if tracks_data[obj_id]["best_frame"] is None or best_conf > max(tracks_data[obj_id]["conf"]):
                            tracks_data[obj_id]["best_frame"] = frame.copy()
                            tracks_data[obj_id]["best_frame_idx"] = frame_idx
            
            # Progress update
            if frame_idx % (stride * 10) == 0 and total_frames > 0:
                real_store.update_video(video_id, progress=(frame_idx / total_frames) * 90.0)

        frame_idx += 1

    cap.release()

    # 3. Post-process tracks (Re-ID, Colors, Evidence, Global Matching)
    for obj_id, data in tracks_data.items():
        if len(data["crops"]) < 2:
            continue
            
        track_key = f"{video_id}:{obj_id}"
        
        # Color extraction
        upper_color, color_frac = dominant_upper_color(data["crops"])
        
        # Re-ID Embedding (take average of best crops)
        embeddings = []
        for crop in data["crops"][:5]:  # max 5 crops for speed
            embeddings.append(reid.extract(crop))
        mean_emb = np.mean(embeddings, axis=0) if embeddings else np.zeros(576)
        norm = np.linalg.norm(mean_emb)
        if norm > 0: mean_emb = mean_emb / norm
        
        # Cross-camera matching
        global_person_id, possible_matches = match_cross_camera(real_store, camera_id, mean_emb.tolist(), upper_color)
        
        # Insert matches
        for m in possible_matches:
            real_store.execute(
                "INSERT INTO possible_matches (track_key_a, track_key_b, similarity) VALUES (?, ?, ?)",
                (track_key, m["track_key"], m["similarity"])
            )
        
        # Save evidence
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
            
            # Register Track
            real_store.execute(
                "INSERT INTO tracks (track_key, video_id, camera_id, track_id, class_name, first_frame, first_pts, num_detections, mean_conf, upper_color, upper_color_frac, embedding, global_person_id, thumbnail_path) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (track_key, video_id, camera_id, obj_id, "person", data["first_frame"], data["first_pts"], len(data["crops"]), float(np.mean(data["conf"])), upper_color, float(color_frac), json.dumps(mean_emb.tolist()), global_person_id, str(ev_path))
            )
            
            # Create an entry Event
            event_id = f"evt_{track_key.replace(':','_')}_entry"
            desc = f"Subject {global_person_id} detected in {camera_id}"
            if upper_color:
                desc += f" wearing {upper_color}."
            
            real_store.execute(
                "INSERT INTO events (event_id, video_id, camera_id, event_type, track_key, frame_idx, pts, confidence, description, evidence_id) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (event_id, video_id, camera_id, "entry", track_key, data["best_frame_idx"], data["first_pts"], float(max(data["conf"])), desc, ev_id)
            )
