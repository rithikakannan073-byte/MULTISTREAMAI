from fastapi import HTTPException, status
from typing import Set, Dict

ROLE_PERMISSIONS: Dict[str, Set[str]] = {
    "security_officer": {
        "view_dashboard",
        "view_cameras",
        "view_live_streams",
        "search_events",
        "use_ai_investigation",
        "view_person_journey",
        "view_evidence",
        "view_alerts",
        "acknowledge_alerts",
        "basic_analytics"
    },
    "security_manager": {
        "view_dashboard",
        "view_cameras",
        "view_live_streams",
        "search_events",
        "use_ai_investigation",
        "view_person_journey",
        "view_evidence",
        "view_alerts",
        "acknowledge_alerts",
        "manage_alerts",
        "manage_cameras",
        "manage_security_users",
        "view_reports",
        "create_reports",
        "advanced_analytics",
        "view_audit_logs"
    },
    "campus_admin": {
        "view_dashboard",
        "view_security_status",
        "view_major_incidents",
        "view_reports",
        "view_analytics",
        "view_camera_status"
    },
    "investigation_team": {
        "view_dashboard",
        "search_historical_video",
        "use_ai_investigation",
        "view_person_journey",
        "view_event_timeline",
        "view_evidence",
        "export_investigation_report",
        "create_reports",
        "view_reports",
        "incident_analytics"
    }
}

def verify_permission(user_role: str, permission: str) -> bool:
    role_perms = ROLE_PERMISSIONS.get(user_role, set())
    return permission in role_perms

def require_permission(user_role: str, permission: str):
    if not verify_permission(user_role, permission):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Role '{user_role}' lacks permission '{permission}'"
        )
