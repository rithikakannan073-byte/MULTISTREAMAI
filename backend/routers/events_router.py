from fastapi import APIRouter, HTTPException, Header, Query
from typing import List, Optional, Dict, Any
from models import Event, DetectedObject
from database import db
from rbac import require_permission
from audit import log_audit_event
from routers.auth_router import get_current_user
from engine.query_parser import query_parser
from engine.hybrid_retriever import hybrid_retriever

router = APIRouter(prefix="/api/events", tags=["Events & Search"])

@router.get("", response_model=List[Event])
def list_events(
    camera_id: Optional[str] = Query(None),
    person_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    min_confidence: Optional[float] = Query(0.0),
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    require_permission(user.role, "search_events")

    results = []
    for evt in db.events.values():
        if camera_id and evt.camera_id != camera_id:
            continue
        if person_id and evt.global_person_id != person_id and evt.related_person_id != person_id:
            continue
        if event_type and evt.event_type.lower() != event_type.lower():
            continue
        if evt.confidence < min_confidence:
            continue
        results.append(evt)

    # Sort chronologically descending
    results.sort(key=lambda x: x.start_time, reverse=True)
    return results

@router.post("/search")
def search_events(body: Dict[str, str], authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    require_permission(user.role, "search_events")

    query_text = body.get("query", "").strip()
    if not query_text:
        return {"query": "", "events": [], "objects": [], "matched_persons": []}

    parsed = query_parser.parse(query_text)
    matched_events = hybrid_retriever.retrieve(parsed)

    # Match objects
    matched_objects = []
    for obj in db.objects.values():
        if query_text.lower() in obj.description.lower() or query_text.lower() in obj.object_type.lower():
            matched_objects.append(obj)

    # Matched persons
    matched_persons = []
    if parsed.get("subject_person_id"):
        p = db.persons.get(parsed["subject_person_id"])
        if p:
            matched_persons.append(p)

    log_audit_event(
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role,
        action="search",
        resource_type="events",
        resource_id=None,
        metadata={"query": query_text, "results_count": len(matched_events)}
    )

    return {
        "query": query_text,
        "parsed": parsed,
        "events": matched_events,
        "objects": matched_objects,
        "matched_persons": matched_persons
    }
