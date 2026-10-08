# MultiStream AI – Computer Vision & Re-ID Architecture

This directory defines the modular architecture for the video intelligence pipeline.

## 1. Pipeline Architecture

```
Raw CCTV Streams (RTSP / MP4)
        ↓
Frame Sampling & Preprocessing (OpenCV / FFmpeg)
        ↓
Object & Person Detection (YOLO11)
        ↓
Intra-Camera Tracking (ByteTrack)
        ↓
Feature Embedding & Person Re-ID (OSNet / FastReID)
        ↓
Temporal Event Extraction & Spatial Graph
        ↓
Vector Indexing (SigLIP + Qdrant)
        ↓
Hybrid Retrieval & Evidence Verification
```

## 2. Module Implementation Status

| Component | Status | Implementation Details |
| :--- | :--- | :--- |
| **YOLO11 Detection** | DEMO / ARCHITECTURE STUB | Simulated in `pipeline_detector.py` and visualized live on HTML5 canvas with dynamic bounding boxes (`person`, `backpack`, `vehicle`, `box`). Ready to load `yolo11n.pt` or `yolo11x.pt`. |
| **ByteTrack Tracking** | DEMO / ARCHITECTURE STUB | Kalman-filter tracking simulated with continuous track IDs (`Track #17`, `Track #42`, `Track #8`). Interface in `reid_tracker.py`. |
| **OSNet Re-Identification** | DEMO / ARCHITECTURE STUB | 512-dim embedding cosine similarity mapped to Global ID `P023` across Cam 01, Cam 02, and Cam 04. |
| **SigLIP Embeddings** | HYBRID SIMULATION | Text-to-visual similarity engine matching natural queries (e.g. *"blue shirt"*, *"red backpack"*) against extracted event attributes. |
| **Temporal Event Graph** | REAL MODULE | Fully implemented in `backend/engine/temporal_graph.py`. Traverses chronological transitions, computes proximity, and detects companion co-occurrences. |
| **Conversational Reasoner** | REAL MODULE | Fully implemented in `backend/engine/reasoning_engine.py` with multi-turn coreference resolution and anti-hallucination guardrails. |

## 3. How to Connect Real Hardware Models

To run live GPU inference:
1. Install PyTorch & Ultralytics:
   ```bash
   pip install ultralytics torch torchvision torchaudio
   ```
2. In `pipeline_detector.py`, replace the generator with:
   ```python
   from ultralytics import YOLO
   model = YOLO("yolo11x.pt")
   results = model.track(source="rtsp://your-camera-url", tracker="bytetrack.yaml")
   ```
3. Pass crops to OSNet / TorchReID:
   ```python
   import torchreid
   reid_model = torchreid.models.build_model(name='osnet_x1_0', num_classes=1000)
   ```
