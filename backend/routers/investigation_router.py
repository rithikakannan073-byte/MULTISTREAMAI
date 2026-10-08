from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from models import InvestigationQueryRequest, InvestigationResponse, EvidenceItem
from database import db
from rbac import require_permission
from audit import log_audit_event
from routers.auth_router import get_current_user
from engine.reasoning_engine import reasoning_engine

router = APIRouter(prefix="/api/investigation", tags=["AI Investigation"])

@router.post("/query", response_model=InvestigationResponse)
def run_investigation_query(
    request: InvestigationQueryRequest,
    authorization: Optional[str] = Header(None)
):
    user = get_current_user(authorization)
    # Check permission
    require_permission(user.role, "use_ai_investigation")

    # Pass user role into request
    request.user_id = user.id
    request.user_role = user.role

    response = reasoning_engine.process_query(request)

    # Log audit event
    log_audit_event(
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role,
        action="ai_investigation",
        resource_type="query",
        resource_id=response.session_id,
        metadata={
            "query": request.query,
            "subject": response.subject_person_id,
            "evidence_count": len(response.evidence),
            "confidence": response.confidence
        }
    )

    return response

@router.get("/evidence/{evidence_id}", response_model=EvidenceItem)
def get_evidence(evidence_id: str, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    require_permission(user.role, "view_evidence")

    evd = db.evidence.get(evidence_id)
    if not evd:
        raise HTTPException(status_code=404, detail="Evidence record not found")

    log_audit_event(
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role,
        action="evidence_viewed",
        resource_type="evidence",
        resource_id=evidence_id,
        metadata={"camera_id": evd.camera_id, "timestamp": evd.timestamp}
    )

    return evd
