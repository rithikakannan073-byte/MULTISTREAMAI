-- MultiStream AI: Row Level Security (RLS) Policies
-- Enforces database-level RBAC on Supabase PostgreSQL

-- Enable RLS on all sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role from profiles
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = auth_user_id OR auth.get_user_role() = 'security_manager');

CREATE POLICY "Security managers can update profiles"
  ON profiles FOR ALL
  USING (auth.get_user_role() = 'security_manager');

-- 2. CAMERAS POLICIES
CREATE POLICY "Authorized roles can view cameras"
  ON cameras FOR SELECT
  USING (auth.get_user_role() IN ('security_officer', 'security_manager', 'campus_admin', 'investigation_team'));

CREATE POLICY "Only Security Managers can modify cameras"
  ON cameras FOR ALL
  USING (auth.get_user_role() = 'security_manager');

-- 3. PERSONS & TRACKS POLICIES
-- Campus admin has no direct access to individual tracking and re-id forensics
CREATE POLICY "Operational security can view persons"
  ON persons FOR SELECT
  USING (auth.get_user_role() IN ('security_officer', 'security_manager', 'investigation_team'));

CREATE POLICY "Operational security can view tracks"
  ON tracks FOR SELECT
  USING (auth.get_user_role() IN ('security_officer', 'security_manager', 'investigation_team'));

-- 4. EVENTS POLICIES
CREATE POLICY "Operational security can view events"
  ON events FOR SELECT
  USING (auth.get_user_role() IN ('security_officer', 'security_manager', 'investigation_team', 'campus_admin'));

-- 5. EVIDENCE POLICIES
-- Campus admin is restricted from raw evidence viewing per Section 3/6
CREATE POLICY "Evidence viewing restricted to investigators and security officers"
  ON evidence FOR SELECT
  USING (auth.get_user_role() IN ('security_officer', 'security_manager', 'investigation_team'));

-- 6. ALERTS POLICIES
CREATE POLICY "All authorized roles can view alerts"
  ON alerts FOR SELECT
  USING (auth.get_user_role() IN ('security_officer', 'security_manager', 'campus_admin', 'investigation_team'));

CREATE POLICY "Security officers and managers can update alerts"
  ON alerts FOR UPDATE
  USING (auth.get_user_role() IN ('security_officer', 'security_manager'));

-- 7. CONVERSATION SESSIONS & MESSAGES (AI INVESTIGATION)
-- Investigation restricted from campus_admin
CREATE POLICY "AI investigation access"
  ON conversation_sessions FOR ALL
  USING (
    (auth.uid()::text = (SELECT auth_user_id FROM profiles WHERE id = user_id)) AND
    (auth.get_user_role() IN ('security_officer', 'security_manager', 'investigation_team'))
  );

CREATE POLICY "AI messages access"
  ON conversation_messages FOR ALL
  USING (
    auth.get_user_role() IN ('security_officer', 'security_manager', 'investigation_team')
  );

-- 8. REPORTS POLICIES
CREATE POLICY "Managers and Investigators can manage reports"
  ON reports FOR ALL
  USING (auth.get_user_role() IN ('security_manager', 'investigation_team'));

CREATE POLICY "Campus admin and officers can read reports"
  ON reports FOR SELECT
  USING (auth.get_user_role() IN ('campus_admin', 'security_officer'));

-- 9. AUDIT LOGS POLICIES
CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Security managers can view audit logs"
  ON audit_logs FOR SELECT
  USING (auth.get_user_role() = 'security_manager');
