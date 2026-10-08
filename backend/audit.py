import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from models import AuditLogEntry
from database import db

def log_audit_event(
    user_id: str,
    action: str,
    resource_type: str,
    user_role: Optional[str] = None,
    user_name: Optional[str] = None,
    resource_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
):
    entry = AuditLogEntry(
        id=str(uuid.uuid4()),
        user_id=user_id,
        user_name=user_name,
        user_role=user_role,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        timestamp=datetime.now(timezone.utc).isoformat(),
        metadata=metadata or {}
    )
    db.audit_logs.append(entry)
    return entry
