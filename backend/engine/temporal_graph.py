from typing import List, Dict, Any, Optional
from database import db
from models import Event, EvidenceItem

class TemporalEventGraph:
    """
    Constructs a directed temporal event graph modeling:
    - Intra-camera tracks
    - Cross-camera transitions (e.g., Cam 01 -> Cam 02 -> Cam 04)
    - Proximity & co-occurrence interactions between individuals
    """
    
    def get_person_events(self, person_id: str) -> List[Event]:
        person_evts = [
            e for e in db.events.values() 
            if e.global_person_id == person_id or e.related_person_id == person_id
        ]
        # Sort chronologically
        person_evts.sort(key=lambda x: x.start_time)
        return person_evts

    def get_journey_timeline(self, person_id: str) -> List[Dict[str, Any]]:
        events = self.get_person_events(person_id)
        timeline = []
        for idx, evt in enumerate(events, 1):
            cam = db.cameras.get(evt.camera_id)
            cam_name = cam.name if cam else evt.camera_id
            
            # Find matching evidence
            matching_evd = next((ev for ev in db.evidence.values() if ev.event_id == evt.id), None)
            
            timeline.append({
                "step_number": idx,
                "event_id": evt.id,
                "camera_id": evt.camera_id,
                "camera_name": cam_name,
                "timestamp": evt.start_time.split(" ")[-1] if " " in evt.start_time else evt.start_time,
                "full_timestamp": evt.start_time,
                "event_type": evt.event_type,
                "description": evt.description,
                "confidence": evt.confidence,
                "evidence_id": matching_evd.id if matching_evd else f"EVD-{evt.id}",
                "frame_url": evt.frame_path,
                "video_clip_url": evt.video_clip_path,
                "related_person_id": evt.related_person_id,
                "related_object_id": evt.related_object_id
            })
        return timeline

    def get_companions_and_interactions(self, person_id: str) -> List[Dict[str, Any]]:
        """
        Finds all individuals who were near or interacted with the target person.
        """
        interactions = []
        for evt in db.events.values():
            if evt.event_type == "interaction":
                if evt.global_person_id == person_id and evt.related_person_id:
                    companion = db.persons.get(evt.related_person_id)
                    interactions.append({
                        "person_id": evt.related_person_id,
                        "person_name": companion.name_or_alias if companion else evt.related_person_id,
                        "description": companion.visual_description if companion else "",
                        "camera_id": evt.camera_id,
                        "timestamp": evt.start_time,
                        "event_id": evt.id,
                        "confidence": evt.confidence
                    })
                elif evt.related_person_id == person_id and evt.global_person_id:
                    companion = db.persons.get(evt.global_person_id)
                    interactions.append({
                        "person_id": evt.global_person_id,
                        "person_name": companion.name_or_alias if companion else evt.global_person_id,
                        "description": companion.visual_description if companion else "",
                        "camera_id": evt.camera_id,
                        "timestamp": evt.start_time,
                        "event_id": evt.id,
                        "confidence": evt.confidence
                    })
        return interactions

temporal_graph = TemporalEventGraph()
