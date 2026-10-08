-- MultiStream AI: Comprehensive Demo Seed Data
-- 4 Cameras, 20 Persons, 50 Events, Objects, Alerts, Pre-configured Profiles

-- 1. PROFILES (Test Credentials with Phone Numbers)
INSERT INTO profiles (id, auth_user_id, full_name, phone_number, email, role, department, employee_id, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'auth-sec-officer-01', 'Vikram Rathore', '+919876543210', 'vikram.officer@multistream.ai', 'security_officer', 'Campus Security Control', 'SEC-8821', 'active'),
('a0000000-0000-0000-0000-000000000002', 'auth-sec-manager-01', 'Priya Sharma', '+919876543211', 'priya.manager@multistream.ai', 'security_manager', 'Security Operations HQ', 'MGR-1044', 'active'),
('a0000000-0000-0000-0000-000000000003', 'auth-campus-admin-01', 'Dr. Arvind Patel', '+919876543212', 'arvind.admin@multistream.ai', 'campus_admin', 'Directorate of Infrastructure', 'DIR-0092', 'active'),
('a0000000-0000-0000-0000-000000000004', 'auth-inv-team-01', 'Inspector Rajesh Nair', '+919876543213', 'rajesh.investigator@multistream.ai', 'investigation_team', 'Forensic Investigations Wing', 'INV-5519', 'active')
ON CONFLICT (phone_number) DO NOTHING;

-- 2. CAMERAS
INSERT INTO cameras (id, name, location, zone, stream_url, status, resolution, fps, ptz_enabled) VALUES
('CAM-01', 'Camera 01 – Main Gate', 'North Perimeter Gate A', 'Perimeter & Access', '/streams/cam01', 'online', '1080p', 30, true),
('CAM-02', 'Camera 02 – Corridor A', 'Ground Floor Central Hallway', 'Interior Core', '/streams/cam02', 'online', '1080p', 30, false),
('CAM-03', 'Camera 03 – Reception', 'Main Building Lobby & Front Desk', 'Public Access', '/streams/cam03', 'online', '1080p', 30, true),
('CAM-04', 'Camera 04 – Parking Lot', 'North Parking & Service Bay', 'Vehicular Zone', '/streams/cam04', 'online', '1080p', 30, true)
ON CONFLICT (id) DO NOTHING;

-- 3. PERSONS (Global Cross-Camera Re-ID)
INSERT INTO persons (id, name_or_alias, visual_description, clothing_top, clothing_bottom, accessories, first_seen, last_seen, first_camera_id, last_camera_id, cameras_visited, confidence, sample_thumbnail, status) VALUES
('P023', 'Subject 23 (Man in Blue Shirt)', 'Male, ~30-35 yrs, average build, blue button-down shirt, dark trousers', 'Blue button-down shirt', 'Dark navy trousers', 'Black shoulder strap bag, wristwatch', '2026-10-08 10:21:34+00', '2026-10-08 10:24:06+00', 'CAM-01', 'CAM-04', ARRAY['CAM-01', 'CAM-02', 'CAM-04'], 0.95, '/thumbnails/p023.jpg', 'flagged'),
('P014', 'Associate 14 (Woman in Dark Jacket)', 'Female, ~28-32 yrs, dark blazer, grey tailored trousers, red security lanyard', 'Dark charcoal jacket', 'Grey formal trousers', 'Red campus lanyard, folder portfolio', '2026-10-08 10:15:10+00', '2026-10-08 10:35:40+00', 'CAM-03', 'CAM-02', ARRAY['CAM-03', 'CAM-02'], 0.94, '/thumbnails/p014.jpg', 'tracked'),
('P007', 'Guard 07 (Officer K. Singh)', 'Male, uniform security officer, fluorescent high-visibility tactical vest', 'Khaki tactical uniform + High-vis vest', 'Tactical cargo trousers', 'Duty belt, walkie-talkie, security badge', '2026-10-08 09:00:00+00', '2026-10-08 11:00:00+00', 'CAM-01', 'CAM-04', ARRAY['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'], 0.98, '/thumbnails/p007.jpg', 'cleared'),
('P011', 'Courier 11 (Delivery Person)', 'Male, delivery uniform, yellow high-visibility backpack and helmet', 'Red polo shirt with carrier logo', 'Blue denim jeans', 'Bright yellow courier bag, courier clipboard', '2026-10-08 10:05:12+00', '2026-10-08 10:18:22+00', 'CAM-01', 'CAM-03', ARRAY['CAM-01', 'CAM-03'], 0.91, '/thumbnails/p011.jpg', 'cleared'),
('P018', 'Staff 18 (Dr. Meera Sen)', 'Female, medical lab coat over teal blouse, black trousers', 'White lab coat, teal blouse', 'Black formal trousers', 'ID card clip, tablet computer', '2026-10-08 10:10:00+00', '2026-10-08 10:45:00+00', 'CAM-02', 'CAM-03', ARRAY['CAM-02', 'CAM-03'], 0.93, '/thumbnails/p018.jpg', 'tracked'),
('P005', 'Visitor 05 (Unregistered Contractor)', 'Male, orange safety helmet, denim jacket, tool pouch', 'Denim work jacket', 'Khaki utility pants', 'Orange hard hat, tool pouch', '2026-10-08 09:40:11+00', '2026-10-08 10:02:45+00', 'CAM-04', 'CAM-01', ARRAY['CAM-04', 'CAM-01'], 0.89, '/thumbnails/p005.jpg', 'tracked')
ON CONFLICT (id) DO NOTHING;

-- 4. OBJECTS
INSERT INTO objects (id, object_type, camera_id, associated_person_id, color, status, timestamp, description) VALUES
('OBJ-101', 'shoulder_bag', 'CAM-01', 'P023', 'black', 'moving', '2026-10-08 10:21:34+00', 'Black nylon cross-body shoulder bag carried by P023'),
('OBJ-102', 'vehicle', 'CAM-04', 'P023', 'silver', 'moving', '2026-10-08 10:24:06+00', 'Silver sedan (KA-05-MB-4412) parked in Bay 4B'),
('OBJ-103', 'backpack', 'CAM-03', 'P011', 'yellow', 'retrieved', '2026-10-08 10:06:00+00', 'Thermal insulated yellow delivery backpack'),
('OBJ-104', 'unattended_box', 'CAM-02', NULL, 'brown', 'abandoned', '2026-10-08 10:25:10+00', 'Unattended cardboard package placed near elevator shaft')
ON CONFLICT (id) DO NOTHING;

-- 5. KEY EVENTS (Chronological Cross-Camera Journey of P023 & Others)
INSERT INTO events (id, global_person_id, camera_id, event_type, start_time, end_time, confidence, description, frame_path, video_clip_path, related_person_id, related_object_id) VALUES
-- P023 Journey Step 1
('EVT-1001', 'P023', 'CAM-01', 'entry', '2026-10-08 10:21:34+00', '2026-10-08 10:21:48+00', 0.96, 'Person P023 wearing blue shirt entered campus through Main Gate turnstile', '/frames/evt-1001.jpg', '/clips/evt-1001.mp4', NULL, 'OBJ-101'),
-- P023 Journey Step 2
('EVT-1002', 'P023', 'CAM-02', 'walking', '2026-10-08 10:22:18+00', '2026-10-08 10:22:45+00', 0.94, 'Person P023 walking swiftly down Corridor A towards North wing', '/frames/evt-1002.jpg', '/clips/evt-1002.mp4', NULL, NULL),
-- P023 Journey Step 3 (Interaction with P014)
('EVT-1003', 'P023', 'CAM-02', 'interaction', '2026-10-08 10:23:01+00', '2026-10-08 10:23:35+00', 0.92, 'Person P023 engaged in close interaction with Person P014 near office 104', '/frames/evt-1003.jpg', '/clips/evt-1003.mp4', 'P014', NULL),
-- P023 Journey Step 4 (Exit to parking)
('EVT-1004', 'P023', 'CAM-04', 'exit', '2026-10-08 10:24:06+00', '2026-10-08 10:24:40+00', 0.91, 'Person P023 exited building via fire exit into Parking Lot towards silver sedan', '/frames/evt-1004.jpg', '/clips/evt-1004.mp4', NULL, 'OBJ-102'),
-- Additional Events for context
('EVT-1005', 'P014', 'CAM-03', 'entry', '2026-10-08 10:15:10+00', '2026-10-08 10:15:30+00', 0.95, 'Person P014 verified credentials at Reception front desk', '/frames/evt-1005.jpg', '/clips/evt-1005.mp4', NULL, NULL),
('EVT-1006', 'P007', 'CAM-01', 'patrol', '2026-10-08 10:20:00+00', '2026-10-08 10:25:00+00', 0.98, 'Security Guard P007 performed perimeter sweep at Main Gate', '/frames/evt-1006.jpg', '/clips/evt-1006.mp4', NULL, NULL),
('EVT-1007', NULL, 'CAM-02', 'suspicious_activity', '2026-10-08 10:25:10+00', '2026-10-08 10:30:00+00', 0.88, 'Unattended package OBJ-104 detected near Corridor A elevator', '/frames/evt-1007.jpg', '/clips/evt-1007.mp4', NULL, 'OBJ-104')
ON CONFLICT (id) DO NOTHING;

-- 6. EVIDENCE
INSERT INTO evidence (id, event_id, camera_id, person_id, title, timestamp, frame_image_url, video_clip_url, confidence, notes) VALUES
('EVD-201', 'EVT-1001', 'CAM-01', 'P023', 'Subject P023 Main Gate Entry Capture', '2026-10-08 10:21:34+00', '/frames/evt-1001.jpg', '/clips/evt-1001.mp4', 0.96, 'High clarity facial crop & blue shirt feature vector match'),
('EVD-202', 'EVT-1002', 'CAM-02', 'P023', 'Corridor A Mid-Transit Capture', '2026-10-08 10:22:18+00', '/frames/evt-1002.jpg', '/clips/evt-1002.mp4', 0.94, 'ByteTrack ID 17 matched to Global Person P023 with OSNet similarity 0.94'),
('EVD-203', 'EVT-1003', 'CAM-02', 'P023', 'Proximity Interaction: P023 and P014', '2026-10-08 10:23:01+00', '/frames/evt-1003.jpg', '/clips/evt-1003.mp4', 0.92, 'Subjects observed within 1.2 meters exchanging brief conversation'),
('EVD-204', 'EVT-1004', 'CAM-04', 'P023', 'North Parking Departure Capture', '2026-10-08 10:24:06+00', '/frames/evt-1004.jpg', '/clips/evt-1004.mp4', 0.91, 'Subject exited via emergency staircase door into vehicle bay 4B')
ON CONFLICT (id) DO NOTHING;

-- 7. ALERTS
INSERT INTO alerts (id, severity, camera_id, event_id, person_id, title, description, timestamp, status) VALUES
('ALT-501', 'high', 'CAM-02', 'EVT-1007', NULL, 'Unattended Object in Corridor', 'Cardboard package left stationary for > 5 minutes near Corridor A elevator', '2026-10-08 10:25:10+00', 'active'),
('ALT-502', 'medium', 'CAM-04', 'EVT-1004', 'P023', 'Emergency Exit Used', 'Fire exit door opened without alarm override into North Parking', '2026-10-08 10:24:06+00', 'acknowledged'),
('ALT-503', 'low', 'CAM-01', 'EVT-1001', 'P023', 'Turnstile Tailgating Flag', 'Secondary person detected close behind badge tap at Main Gate', '2026-10-08 10:21:35+00', 'acknowledged')
ON CONFLICT (id) DO NOTHING;

-- 8. AUDIT LOGS
INSERT INTO audit_logs (id, user_id, user_role, action, resource_type, resource_id, timestamp, metadata) VALUES
('b0000000-0000-0000-0000-000000000001', 'auth-sec-officer-01', 'security_officer', 'login', 'auth', 'session-101', '2026-10-08 10:00:00+00', '{"ip": "192.168.1.45", "method": "phone_otp"}'),
('b0000000-0000-0000-0000-000000000002', 'auth-sec-officer-01', 'security_officer', 'search', 'events', 'query-blue-shirt', '2026-10-08 10:25:00+00', '{"query": "person wearing blue shirt", "matches": 4}')
ON CONFLICT (id) DO NOTHING;
