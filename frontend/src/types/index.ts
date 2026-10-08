export type UserRole = 'security_officer' | 'security_manager' | 'campus_admin' | 'investigation_team';

export interface UserProfile {
  id: string;
  auth_user_id?: string;
  full_name: string;
  phone_number: string;
  email?: string;
  role: UserRole;
  department?: string;
  employee_id?: string;
  status: 'active' | 'suspended' | 'inactive';
  created_at?: string;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  zone: string;
  stream_url?: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  resolution: string;
  fps: number;
  ptz_enabled: boolean;
  people_count: number;
  object_count: number;
  latest_event?: string;
  latest_timestamp?: string;
}

export interface Person {
  id: string;
  name_or_alias: string;
  visual_description: string;
  clothing_top?: string;
  clothing_bottom?: string;
  accessories?: string;
  first_seen: string;
  last_seen: string;
  first_camera_id?: string;
  last_camera_id?: string;
  cameras_visited: string[];
  confidence: number;
  sample_thumbnail?: string;
  status: 'tracked' | 'flagged' | 'cleared';
}

export interface Event {
  id: string;
  global_person_id?: string;
  camera_id: string;
  camera_name?: string;
  event_type: string;
  start_time: string;
  end_time?: string;
  confidence: number;
  description: string;
  frame_path: string;
  video_clip_path?: string;
  related_person_id?: string;
  related_object_id?: string;
  metadata?: Record<string, any>;
}

export interface EvidenceItem {
  id: string;
  event_id: string;
  camera_id: string;
  camera_name?: string;
  person_id?: string;
  title: string;
  timestamp: string;
  frame_image_url: string;
  video_clip_url?: string;
  confidence: number;
  notes?: string;
}

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  camera_id: string;
  camera_name?: string;
  event_id?: string;
  person_id?: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface InvestigationTimelineNode {
  step_number: number;
  camera_id: string;
  camera_name: string;
  timestamp: string;
  event_type: string;
  description: string;
  confidence: number;
  evidence_id: string;
  frame_url: string;
}

export interface InvestigationResponse {
  answer: string;
  session_id: string;
  subject_person_id?: string;
  subject_name?: string;
  timeline: InvestigationTimelineNode[];
  companion_ids: string[];
  evidence: EvidenceItem[];
  confidence: number;
  query_breakdown: Record<string, any>;
  sufficient_evidence: boolean;
}

export interface Report {
  id: string;
  title: string;
  investigator_name: string;
  incident_type: string;
  summary: string;
  persons_involved: string[];
  cameras_involved: string[];
  timeline: any[];
  evidence_list: any[];
  confidence: number;
  status: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name?: string;
  user_role?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
