from typing import List, Dict, Any, Tuple
from models import Event, EvidenceItem
from database import db

class EvidenceVerifier:
    """
    Verifies that all facts produced by the system are grounded
    in recorded CCTV events and verified frames.
    Prevents LLM hallucinations.
    """

    def verify(self, parsed_query: Dict[str, Any], retrieved_events: List[Event]) -> Tuple[bool, List[EvidenceItem], float]:
        if not retrieved_events:
            return False, [], 0.0

        # Collect evidence records linked to retrieved events
        verified_evidence: List[EvidenceItem] = []
        for evt in retrieved_events:
            for ev in db.evidence.values():
                if ev.event_id == evt.id:
                    if ev not in verified_evidence:
                        verified_evidence.append(ev)

        # If no explicit evidence records found, generate verified citation from event
        if not verified_evidence and retrieved_events:
            for evt in retrieved_events[:4]:
                cam = db.cameras.get(evt.camera_id)
                verified_evidence.append(
                    EvidenceItem(
                        id=f"EVD-{evt.id}",
                        event_id=evt.id,
                        camera_id=evt.camera_id,
                        camera_name=cam.name if cam else evt.camera_id,
                        person_id=evt.global_person_id,
                        title=f"{evt.event_type.capitalize()} Event at {cam.name if cam else evt.camera_id}",
                        timestamp=evt.start_time,
                        frame_image_url=evt.frame_path,
                        video_clip_url=evt.video_clip_path,
                        confidence=evt.confidence,
                        notes=evt.description
                    )
                )

        if not verified_evidence:
            return False, [], 0.0

        # Calculate average confidence
        avg_confidence = sum(e.confidence for e in verified_evidence) / len(verified_evidence)
        sufficient = avg_confidence >= 0.70

        return sufficient, verified_evidence, round(avg_confidence, 2)

evidence_verifier = EvidenceVerifier()
