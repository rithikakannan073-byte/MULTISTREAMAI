-- MultiStream AI: Secure Conversational Multi-Camera Video Intelligence
-- Supabase PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('security_officer', 'security_manager', 'campus_admin', 'investigation_team')),
    department TEXT,
    employee_id TEXT UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAMERAS TABLE
CREATE TABLE IF NOT EXISTS cameras (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    zone TEXT NOT NULL,
    stream_url TEXT,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'degraded', 'maintenance')),
    resolution TEXT DEFAULT '1080p',
    fps INTEGER DEFAULT 30,
    ptz_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERSONS TABLE (Global Cross-Camera Person Re-ID)
CREATE TABLE IF NOT EXISTS persons (
    id TEXT PRIMARY KEY, -- e.g. 'P023', 'P014'
    name_or_alias TEXT DEFAULT 'Unidentified Subject',
    visual_description TEXT NOT NULL,
    clothing_top TEXT,
    clothing_bottom TEXT,
    accessories TEXT,
    first_seen TIMESTAMPTZ,
    last_seen TIMESTAMPTZ,
    first_camera_id TEXT REFERENCES cameras(id),
    last_camera_id TEXT REFERENCES cameras(id),
    cameras_visited TEXT[],
    confidence NUMERIC DEFAULT 0.95,
    sample_thumbnail TEXT,
    status TEXT DEFAULT 'tracked' CHECK (status IN ('tracked', 'flagged', 'cleared', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRACKS TABLE (Intra-Camera ByteTrack)
CREATE TABLE IF NOT EXISTS tracks (
    track_id TEXT PRIMARY KEY,
    camera_id TEXT REFERENCES cameras(id) ON DELETE CASCADE,
    global_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    confidence NUMERIC DEFAULT 0.92,
    bounding_box_history JSONB, -- list of [x, y, w, h, t]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DETECTED OBJECTS TABLE
CREATE TABLE IF NOT EXISTS objects (
    id TEXT PRIMARY KEY,
    object_type TEXT NOT NULL, -- backpack, suitcase, vehicle, laptop, box
    camera_id TEXT REFERENCES cameras(id) ON DELETE CASCADE,
    associated_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
    color TEXT,
    status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'moving', 'abandoned', 'retrieved')),
    timestamp TIMESTAMPTZ NOT NULL,
    bounding_box JSONB,
    description TEXT,
    frame_path TEXT
);

-- 6. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    global_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
    camera_id TEXT REFERENCES cameras(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- entry, exit, walking, running, interaction, loitering, object_pickup, object_drop, vehicle_arrival, vehicle_departure, suspicious_activity
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    confidence NUMERIC NOT NULL,
    description TEXT NOT NULL,
    frame_path TEXT NOT NULL,
    video_clip_path TEXT,
    related_person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
    related_object_id TEXT REFERENCES objects(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    camera_id TEXT REFERENCES cameras(id) ON DELETE CASCADE,
    person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    frame_image_url TEXT NOT NULL,
    video_clip_url TEXT,
    confidence NUMERIC NOT NULL,
    notes TEXT,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    camera_id TEXT REFERENCES cameras(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
    person_id TEXT REFERENCES persons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'investigating', 'resolved')),
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CONVERSATION SESSIONS TABLE
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Investigation',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CONVERSATION MESSAGES TABLE
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    retrieved_events JSONB,
    evidence_ids TEXT[],
    confidence NUMERIC,
    query_breakdown JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. INVESTIGATION REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    investigator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    incident_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    persons_involved TEXT[],
    cameras_involved TEXT[],
    timeline JSONB NOT NULL,
    evidence_list JSONB NOT NULL,
    confidence NUMERIC NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'finalized', 'archived')),
    exported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_role TEXT,
    action TEXT NOT NULL, -- login, logout, search, ai_investigation, evidence_viewed, clip_opened, report_exported, camera_changed, user_managed, alert_acknowledged
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_events_person ON events(global_person_id);
CREATE INDEX IF NOT EXISTS idx_events_camera ON events(camera_id);
CREATE INDEX IF NOT EXISTS idx_events_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_tracks_camera ON tracks(camera_id);
CREATE INDEX IF NOT EXISTS idx_tracks_person ON tracks(global_person_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
