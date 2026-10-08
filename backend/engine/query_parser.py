import re
from typing import Dict, Any, Optional
from database import db

class QueryParser:
    """
    Parses natural language CCTV queries, extracts entities,
    and resolves conversational coreferences across turns.
    """

    def parse(self, query: str, context_person_id: Optional[str] = None) -> Dict[str, Any]:
        text = query.lower().strip()
        parsed = {
            "raw_query": query,
            "query_type": "general",
            "subject_person_id": None,
            "target_object": None,
            "target_camera": None,
            "temporal_relation": None,
            "is_coreference": False
        }

        # Check for coreference pronouns
        pronouns = ["he", "him", "his", "she", "her", "they", "them", "this person", "that person", "this man", "the man"]
        has_pronoun = any(re.search(r'\b' + re.escape(p) + r'\b', text) for p in pronouns)
        
        # Check specific intent types
        if "who was he with" in text or "who was she with" in text or "who was this person with" in text or "who was with him" in text or "who did he meet" in text:
            parsed["query_type"] = "companion_lookup"
            parsed["is_coreference"] = True
            if context_person_id:
                parsed["subject_person_id"] = context_person_id
        elif "where did he go" in text or "where did she go" in text or "where did they go" in text or "where did this person go" in text or "movement timeline" in text:
            parsed["query_type"] = "movement_timeline"
            parsed["is_coreference"] = True
            if context_person_id:
                parsed["subject_person_id"] = context_person_id
        elif "where did" in text or "path" in text or "journey" in text:
            parsed["query_type"] = "movement_timeline"

        # Explicit Person ID in query (e.g., P023, P014)
        person_match = re.search(r'\b(p0\d\d|p\d\d\d)\b', text)
        if person_match:
            parsed["subject_person_id"] = person_match.group(1).upper()
            parsed["is_coreference"] = False

        # Semantic Person description matching
        if not parsed["subject_person_id"]:
            if "blue shirt" in text or "blue button" in text:
                parsed["subject_person_id"] = "P023"
            elif "dark jacket" in text or "grey trousers" in text or "lanyard" in text:
                parsed["subject_person_id"] = "P014"
            elif "security guard" in text or "high-vis" in text or "officer" in text:
                parsed["subject_person_id"] = "P007"
            elif "courier" in text or "yellow backpack" in text or "delivery" in text:
                parsed["subject_person_id"] = "P011"
            elif "lab coat" in text or "doctor" in text or "meera" in text:
                parsed["subject_person_id"] = "P018"
            elif "contractor" in text or "hard hat" in text or "helmet" in text:
                parsed["subject_person_id"] = "P005"
            elif has_pronoun and context_person_id:
                parsed["subject_person_id"] = context_person_id
                parsed["is_coreference"] = True

        # Camera detection
        if "main gate" in text or "gate" in text or "turnstile" in text:
            parsed["target_camera"] = "CAM-01"
        elif "corridor" in text or "hallway" in text:
            parsed["target_camera"] = "CAM-02"
        elif "reception" in text or "lobby" in text:
            parsed["target_camera"] = "CAM-03"
        elif "parking" in text or "bay" in text:
            parsed["target_camera"] = "CAM-04"

        # Temporal relations
        if "after" in text:
            parsed["temporal_relation"] = "after"
        elif "before" in text:
            parsed["temporal_relation"] = "before"
        elif "during" in text or "while" in text:
            parsed["temporal_relation"] = "during"

        # Object detection
        if "backpack" in text or "bag" in text:
            parsed["target_object"] = "bag"
        elif "car" in text or "sedan" in text or "vehicle" in text:
            parsed["target_object"] = "vehicle"
        elif "box" in text or "package" in text:
            parsed["target_object"] = "unattended_box"

        return parsed

query_parser = QueryParser()
