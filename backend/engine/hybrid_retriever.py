from typing import List, Dict, Any, Optional
from database import db
from models import Event

class HybridRetriever:
    """
    Combines semantic text similarity with structured metadata
    (camera, global person identity, timestamps, event type).
    """

    def retrieve(self, parsed_query: Dict[str, Any]) -> List[Event]:
        subject_id = parsed_query.get("subject_person_id")
        camera_id = parsed_query.get("target_camera")
        raw_text = parsed_query.get("raw_query", "").lower()

        matched_events: List[Event] = []

        for evt in db.events.values():
            score = 0.0

            # Match Person ID
            if subject_id and (evt.global_person_id == subject_id or evt.related_person_id == subject_id):
                score += 0.60

            # Match Camera
            if camera_id and evt.camera_id == camera_id:
                score += 0.25

            # Semantic keyword / description overlap
            desc_lower = evt.description.lower()
            tokens = raw_text.split()
            overlap = sum(1 for t in tokens if len(t) > 3 and t in desc_lower)
            score += min(0.30, overlap * 0.10)

            # High confidence events score higher
            score += evt.confidence * 0.10

            if score >= 0.40:
                matched_events.append((score, evt))

        # Sort by relevance score descending, then start_time
        matched_events.sort(key=lambda x: (x[0], x[1].start_time), reverse=True)
        return [item[1] for item in matched_events]

hybrid_retriever = HybridRetriever()
