from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserProfile(BaseModel):
    id: str
    auth_user_id: Optional[str] = None
    full_name: str
    phone_number: str
    email: Optional[str] = None
    role: str # security_officer, security_manager, campus_admin, investigation_team
    department: Optional[str] = "Campus Security"
    employee_id: Optional[str] = None
    status: str = "active"
    created_at: Optional[str] = None

class Camera(BaseModel):
    id: str
    name: str
    location: str
    zone: str
    stream_url: Optional[str] = None
    status: str = "online"
    resolution: str = "1080p"
    fps: int = 30
    ptz_enabled: bool = False
    people_count: int = 0
    object_count: int = 0
    latest_event: Optional[str] = None
    latest_timestamp: Optional[str] = None

class Person(BaseModel):
    id: str # 'P023'
    name_or_alias: str = "Unidentified Subject"
    visual_description: str
    clothing_top: Optional[str] = None
    clothing_bottom: Optional[str] = None
    accessories: Optional[str] = None
    first_seen: str
    last_seen: str
    first_camera_id: Optional[str] = None
    last_camera_id: Optional[str] = None
    cameras_visited: List[str] = []
    confidence: float = 0.95
    sample_thumbnail: Optional[str] = None
    status: str = "tracked" # tracked, flagged, cleared

class Track(BaseModel):
    track_id: str
    camera_id: str
    global_person_id: Optional[str] = None
    start_time: str
    end_time: Optional[str] = None
    confidence: float = 0.92
    bounding_box_history: Optional[List[Dict[str, Any]]] = None

class DetectedObject(BaseModel):
    id: str
    object_type: str
    camera_id: str
    associated_person_id: Optional[str] = None
    color: Optional[str] = None
    status: str = "detected"
    timestamp: str
    description: str
    frame_path: Optional[str] = None

class Event(BaseModel):
    id: str
    global_person_id: Optional[str] = None
    camera_id: str
    camera_name: Optional[str] = None
    event_type: str # entry, exit, walking, running, interaction, loitering, suspicious_activity
    start_time: str
    end_time: Optional[str] = None
    confidence: float
    description: str
    frame_path: str
    video_clip_path: Optional[str] = None
    related_person_id: Optional[str] = None
    related_object_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class EvidenceItem(BaseModel):
    id: str
    event_id: str
    camera_id: str
    camera_name: Optional[str] = None
    person_id: Optional[str] = None
    title: str
    timestamp: str
    frame_image_url: str
    video_clip_url: Optional[str] = None
    confidence: float
    notes: Optional[str] = None

class Alert(BaseModel):
    id: str
    severity: str # low, medium, high, critical
    camera_id: str
    camera_name: Optional[str] = None
    event_id: Optional[str] = None
    person_id: Optional[str] = None
    title: str
    description: str
    timestamp: str
    status: str = "active" # active, acknowledged, resolved

class InvestigationQueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    user_role: Optional[str] = "security_officer"
    context_person_id: Optional[str] = None

class InvestigationTimelineNode(BaseModel):
    step_number: int
    camera_id: str
    camera_name: str
    timestamp: str
    event_type: str
    description: str
    confidence: float
    evidence_id: str
    frame_url: str

class InvestigationResponse(BaseModel):
    answer: str
    session_id: str
    subject_person_id: Optional[str] = None
    subject_name: Optional[str] = None
    timeline: List[InvestigationTimelineNode] = []
    companion_ids: List[str] = []
    evidence: List[EvidenceItem] = []
    confidence: float
    query_breakdown: Dict[str, Any]
    sufficient_evidence: bool = True

class Report(BaseModel):
    id: str
    title: str
    investigator_name: str
    incident_type: str
    summary: str
    persons_involved: List[str]
    cameras_involved: List[str]
    timeline: List[Dict[str, Any]]
    evidence_list: List[Dict[str, Any]]
    confidence: float
    status: str = "finalized"
    created_at: str

class AuditLogEntry(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None

class AuthSendOtpRequest(BaseModel):
    phone_number: str

class AuthVerifyOtpRequest(BaseModel):
    phone_number: str
    otp: str

class AuthLoginResponse(BaseModel):
    session_token: str
    user: UserProfile
    message: str
