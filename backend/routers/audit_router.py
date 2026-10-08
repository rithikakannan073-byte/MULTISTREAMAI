from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
from models import AuditLogEntry
from database import db
from rbac import require_permission
from routers.auth_router import get_current_user

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogEntry])
def list_audit_logs(authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    # Strictly restricted to Security Manager
    require_permission(user.role, "view_audit_logs")
    # Return newest first
    return list(reversed(db.audit_logs))
