from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
from models import Alert
from database import db
from rbac import require_permission
from audit import log_audit_event
from routers.auth_router import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[Alert])
def list_alerts(authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    require_permission(user.role, "view_alerts")
    # Return alerts sorted by severity (critical/high first), then timestamp
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    sorted_alerts = sorted(
        db.alerts.values(),
        key=lambda a: (severity_order.get(a.severity, 4), a.timestamp),
        reverse=False
    )
    return sorted_alerts

@router.post("/{alert_id}/acknowledge", response_model=Alert)
def acknowledge_alert(alert_id: str, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    require_permission(user.role, "acknowledge_alerts")

    alert = db.alerts.get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "acknowledged"

    log_audit_event(
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role,
        action="alert_acknowledged",
        resource_type="alert",
        resource_id=alert_id,
        metadata={"title": alert.title, "severity": alert.severity}
    )

    return alert
