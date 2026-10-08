from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
from models import Camera
from database import db
from rbac import require_permission
from audit import log_audit_event
from routers.auth_router import get_current_user

router = APIRouter(prefix="/api/cameras", tags=["Cameras"])

@router.get("", response_model=List[Camera])
def list_cameras():
    return list(db.cameras.values())

@router.get("/{camera_id}", response_model=Camera)
def get_camera(camera_id: str):
    cam = db.cameras.get(camera_id)
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    return cam

@router.post("", response_model=Camera)
def create_or_update_camera(camera: Camera, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    require_permission(user.role, "manage_cameras")

    db.cameras[camera.id] = camera

    log_audit_event(
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role,
        action="camera_changed",
        resource_type="camera",
        resource_id=camera.id,
        metadata={"camera_name": camera.name, "status": camera.status}
    )

    return camera
