import json
from typing import Dict, Any, Optional, List, Tuple
import cv2
import numpy as np
import torch
import torchvision.models as models
from torchvision.transforms import Compose, Resize, Normalize, ToTensor

# OSNet/MobileNet lightweight Re-ID embedding model
class FeatureExtractor:
    def __init__(self):
        self.device = torch.device("cpu")
        # Lightweight MobileNet feature extractor
        self.model = models.mobilenet_v3_small(weights='DEFAULT').features
        self.model.eval()
        self.pool = torch.nn.AdaptiveAvgPool2d((1, 1))
        self.transform = Compose([
            ToTensor(),
            Resize((256, 128), antialias=True),
            Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def extract(self, bgr_crop: np.ndarray) -> np.ndarray:
        if bgr_crop.size == 0:
            return np.zeros(576, dtype=np.float32)
        rgb_crop = cv2.cvtColor(bgr_crop, cv2.COLOR_BGR2RGB)
        t = self.transform(rgb_crop).unsqueeze(0).to(self.device)
        with torch.no_grad():
            feat = self.pool(self.model(t))
        feat = feat.view(feat.size(0), -1).numpy()[0]
        norm = np.linalg.norm(feat)
        if norm > 0:
            feat = feat / norm
        return feat

_extractor = None

def get_extractor():
    global _extractor
    if _extractor is None:
        _extractor = FeatureExtractor()
    return _extractor

def compute_similarity(emb1: List[float], emb2: List[float]) -> float:
    e1 = np.array(emb1, dtype=np.float32)
    e2 = np.array(emb2, dtype=np.float32)
    return float(np.dot(e1, e2))

def match_cross_camera(
    db, 
    camera_id: str,
    track_embedding: List[float], 
    upper_color: Optional[str]
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Given a new track embedding, finds the best matching global_person_id from OTHER cameras.
    Returns (assigned_global_id, [list of possible matches]).
    """
    from pipeline.real_store import query_one, next_person_id
    
    # 1. Fetch all tracks from other cameras that have a global_person_id and an embedding
    # We only match across cameras, not within the same camera (to avoid self-matching logic for now)
    other_tracks = db.query(
        "SELECT track_key, global_person_id, embedding, upper_color FROM tracks "
        "WHERE camera_id != ? AND global_person_id IS NOT NULL AND embedding IS NOT NULL",
        (camera_id,)
    )

    best_match_id = None
    best_sim = 0.0
    possible_matches = []

    for t in other_tracks:
        try:
            emb = json.loads(t["embedding"])
            sim = compute_similarity(track_embedding, emb)
            
            # Colour penalty if distinct colours detected
            if upper_color and t["upper_color"] and upper_color != t["upper_color"]:
                sim -= 0.15

            if sim > 0.50:
                possible_matches.append({
                    "track_key": t["track_key"],
                    "similarity": sim
                })
            
            if sim > best_sim and sim >= 0.70:
                best_sim = sim
                best_match_id = t["global_person_id"]
        except Exception:
            continue

    if not best_match_id:
        best_match_id = next_person_id()

    return best_match_id, possible_matches
