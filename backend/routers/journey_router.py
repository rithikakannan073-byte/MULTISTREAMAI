from fastapi import APIRouter, HTTPException, Header
from typing import List, Dict, Any, Optional
from models import Person
from database import db
from rbac import require_permission
from audit import log_audit_event
from routers.auth_router import get_current_user
from engine.temporal_graph import temporal_graph

router = APIRouter(prefix="/api/persons", tags=["Person Tracking & Journey"])

@router.get("", response_model=List[Person])
def list_persons(authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    # Campus admin has restricted access to granular person tracking
    require_permission(user.role, "view_person_journey")
    return list(db.persons.values())

@router.get("/{person_id}", response_model=Person)
def get_person(person_id: str, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    require_permission(user.role, "view_person_journey")
    
    person = db.persons.get(person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

@router.get("/{person_id}/journey")
def get_person_journey(person_id: str, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    require_permission(user.role, "view_person_journey")

    person = db.persons.get(person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    timeline = temporal_graph.get_journey_timeline(person_id)
    interactions = temporal_graph.get_companions_and_interactions(person_id)

    log_audit_event(
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role,
        action="journey_viewed",
        resource_type="person",
        resource_id=person_id,
        metadata={"steps_count": len(timeline), "cameras": person.cameras_visited}
    )

    return {
        "person": person,
        "timeline": timeline,
        "interactions": interactions,
        "cameras_visited": person.cameras_visited,
        "total_steps": len(timeline)
    }
