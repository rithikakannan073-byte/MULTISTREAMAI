from fastapi import APIRouter, Header
from typing import Optional
from database import db
from rbac import require_permission
from routers.auth_router import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("")
def get_analytics(authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    # Check permissions (either basic_analytics, advanced_analytics, view_analytics, incident_analytics)
    if user.role not in ["security_officer", "security_manager", "campus_admin", "investigation_team"]:
        require_permission(user.role, "basic_analytics")

    # Hourly distribution mock/data
    hourly_traffic = [
        {"time": "08:00", "Main Gate": 18, "Corridor A": 12, "Reception": 14, "Parking": 22},
        {"time": "09:00", "Main Gate": 42, "Corridor A": 31, "Reception": 28, "Parking": 35},
        {"time": "10:00", "Main Gate": 58, "Corridor A": 49, "Reception": 44, "Parking": 38},
        {"time": "11:00", "Main Gate": 34, "Corridor A": 39, "Reception": 30, "Parking": 26},
        {"time": "12:00", "Main Gate": 45, "Corridor A": 52, "Reception": 36, "Parking": 31},
        {"time": "13:00", "Main Gate": 39, "Corridor A": 44, "Reception": 29, "Parking": 27},
    ]

    # Camera activity breakdown
    camera_activity = [
        {"name": "Main Gate (Cam 01)", "events": 24, "people": 142, "status": "online"},
        {"name": "Corridor A (Cam 02)", "events": 38, "people": 98, "status": "online"},
        {"name": "Reception (Cam 03)", "events": 19, "people": 76, "status": "online"},
        {"name": "Parking (Cam 04)", "events": 16, "people": 64, "status": "online"},
    ]

    # Cross-camera transitions
    transitions = [
        {"from": "CAM-01 (Main Gate)", "to": "CAM-02 (Corridor A)", "count": 68},
        {"from": "CAM-02 (Corridor A)", "to": "CAM-03 (Reception)", "count": 42},
        {"from": "CAM-02 (Corridor A)", "to": "CAM-04 (Parking)", "count": 29},
        {"from": "CAM-03 (Reception)", "to": "CAM-02 (Corridor A)", "count": 35},
        {"from": "CAM-04 (Parking)", "to": "CAM-01 (Main Gate)", "count": 18},
    ]

    # Event types breakdown
    event_distribution = [
        {"type": "Walking", "count": 22, "fill": "#06B6D4"},
        {"type": "Entry", "count": 14, "fill": "#3B82F6"},
        {"type": "Interaction", "count": 6, "fill": "#8B5CF6"},
        {"type": "Exit", "count": 5, "fill": "#10B981"},
        {"type": "Suspicious / Alert", "count": 3, "fill": "#EF4444"},
    ]

    return {
        "summary": {
            "total_cameras": len(db.cameras),
            "active_cameras": len([c for c in db.cameras.values() if c.status == "online"]),
            "people_tracked": len(db.persons),
            "active_alerts": len([a for a in db.alerts.values() if a.status == "active"]),
            "avg_reid_confidence": 0.94
        },
        "hourly_traffic": hourly_traffic,
        "camera_activity": camera_activity,
        "transitions": transitions,
        "event_distribution": event_distribution
    }
