import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from models import (
    UserProfile, Camera, Person, Track, DetectedObject,
    Event, EvidenceItem, Alert, Report, AuditLogEntry
)

class DataStore:
    def __init__(self):
        self.profiles: Dict[str, UserProfile] = {}
        self.cameras: Dict[str, Camera] = {}
        self.persons: Dict[str, Person] = {}
        self.tracks: List[Track] = []
        self.objects: Dict[str, DetectedObject] = {}
        self.events: Dict[str, Event] = {}
        self.evidence: Dict[str, EvidenceItem] = {}
        self.alerts: Dict[str, Alert] = {}
        self.reports: Dict[str, Report] = {}
        self.audit_logs: List[AuditLogEntry] = []
        self.conversation_sessions: Dict[str, List[Dict[str, Any]]] = {}
        self._seed_data()

    def _seed_data(self):
        # 1. Profiles
        self.profiles["+919876543210"] = UserProfile(
            id="a0000000-0000-0000-0000-000000000001",
            auth_user_id="auth-sec-officer-01",
            full_name="Vikram Rathore",
            phone_number="+919876543210",
            email="vikram.officer@multistream.ai",
            role="security_officer",
            department="Campus Security Control",
            employee_id="SEC-8821",
            status="active",
            created_at="2026-10-08T09:00:00Z"
        )
        self.profiles["+919876543211"] = UserProfile(
            id="a0000000-0000-0000-0000-000000000002",
            auth_user_id="auth-sec-manager-01",
            full_name="Priya Sharma",
            phone_number="+919876543211",
            email="priya.manager@multistream.ai",
            role="security_manager",
            department="Security Operations HQ",
            employee_id="MGR-1044",
            status="active",
            created_at="2026-10-08T09:00:00Z"
        )
        self.profiles["+919876543212"] = UserProfile(
            id="a0000000-0000-0000-0000-000000000003",
            auth_user_id="auth-campus-admin-01",
            full_name="Dr. Arvind Patel",
            phone_number="+919876543212",
            email="arvind.admin@multistream.ai",
            role="campus_admin",
            department="Directorate of Infrastructure",
            employee_id="DIR-0092",
            status="active",
            created_at="2026-10-08T09:00:00Z"
        )
        self.profiles["+919876543213"] = UserProfile(
            id="a0000000-0000-0000-0000-000000000004",
            auth_user_id="auth-inv-team-01",
            full_name="Inspector Rajesh Nair",
            phone_number="+919876543213",
            email="rajesh.investigator@multistream.ai",
            role="investigation_team",
            department="Forensic Investigations Wing",
            employee_id="INV-5519",
            status="active",
            created_at="2026-10-08T09:00:00Z"
        )

        # 2. Cameras
        cams = [
            Camera(
                id="CAM-01",
                name="Camera 01 – Main Gate",
                location="North Perimeter Gate A",
                zone="Perimeter & Access",
                stream_url="/streams/cam01",
                status="online",
                resolution="1080p",
                fps=30,
                ptz_enabled=True,
                people_count=4,
                object_count=2,
                latest_event="Person P023 entered through turnstile",
                latest_timestamp="10:21:34"
            ),
            Camera(
                id="CAM-02",
                name="Camera 02 – Corridor A",
                location="Ground Floor Central Hallway",
                zone="Interior Core",
                stream_url="/streams/cam02",
                status="online",
                resolution="1080p",
                fps=30,
                ptz_enabled=False,
                people_count=6,
                object_count=1,
                latest_event="Interaction between P023 and P014",
                latest_timestamp="10:23:01"
            ),
            Camera(
                id="CAM-03",
                name="Camera 03 – Reception",
                location="Main Building Lobby & Front Desk",
                zone="Public Access",
                stream_url="/streams/cam03",
                status="online",
                resolution="1080p",
                fps=30,
                ptz_enabled=True,
                people_count=5,
                object_count=3,
                latest_event="Visitor badge validation at desk",
                latest_timestamp="10:15:10"
            ),
            Camera(
                id="CAM-04",
                name="Camera 04 – Parking Lot",
                location="North Parking & Service Bay",
                zone="Vehicular Zone",
                stream_url="/streams/cam04",
                status="online",
                resolution="1080p",
                fps=30,
                ptz_enabled=True,
                people_count=3,
                object_count=8,
                latest_event="Subject P023 exited towards Bay 4B",
                latest_timestamp="10:24:06"
            ),
        ]
        for c in cams:
            self.cameras[c.id] = c

        # 3. Persons
        persons_list = [
            Person(
                id="P023",
                name_or_alias="Subject 23 (Man in Blue Shirt)",
                visual_description="Male, ~30-35 yrs, medium build, blue collared button-down shirt, dark trousers, carrying black shoulder bag",
                clothing_top="Blue button-down shirt",
                clothing_bottom="Dark navy trousers",
                accessories="Black shoulder strap bag, wristwatch",
                first_seen="2026-10-08 10:21:34",
                last_seen="2026-10-08 10:24:06",
                first_camera_id="CAM-01",
                last_camera_id="CAM-04",
                cameras_visited=["CAM-01", "CAM-02", "CAM-04"],
                confidence=0.96,
                sample_thumbnail="/thumbnails/p023.jpg",
                status="flagged"
            ),
            Person(
                id="P014",
                name_or_alias="Associate 14 (Woman in Dark Jacket)",
                visual_description="Female, ~28-32 yrs, dark blazer, grey trousers, red security lanyard, document portfolio",
                clothing_top="Dark charcoal jacket",
                clothing_bottom="Grey formal trousers",
                accessories="Red campus lanyard, portfolio folder",
                first_seen="2026-10-08 10:15:10",
                last_seen="2026-10-08 10:35:40",
                first_camera_id="CAM-03",
                last_camera_id="CAM-02",
                cameras_visited=["CAM-03", "CAM-02"],
                confidence=0.94,
                sample_thumbnail="/thumbnails/p014.jpg",
                status="tracked"
            ),
            Person(
                id="P007",
                name_or_alias="Officer K. Singh",
                visual_description="Male, uniform security officer, fluorescent high-visibility tactical vest, radio handset",
                clothing_top="Khaki tactical uniform + High-vis vest",
                clothing_bottom="Tactical cargo trousers",
                accessories="Duty belt, walkie-talkie",
                first_seen="2026-10-08 09:00:00",
                last_seen="2026-10-08 11:00:00",
                first_camera_id="CAM-01",
                last_camera_id="CAM-04",
                cameras_visited=["CAM-01", "CAM-02", "CAM-03", "CAM-04"],
                confidence=0.98,
                sample_thumbnail="/thumbnails/p007.jpg",
                status="cleared"
            ),
            Person(
                id="P011",
                name_or_alias="Delivery Courier",
                visual_description="Male, delivery uniform, bright yellow high-visibility backpack and helmet",
                clothing_top="Red polo shirt with carrier logo",
                clothing_bottom="Blue denim jeans",
                accessories="Yellow delivery backpack, clipboard",
                first_seen="2026-10-08 10:05:12",
                last_seen="2026-10-08 10:18:22",
                first_camera_id="CAM-01",
                last_camera_id="CAM-03",
                cameras_visited=["CAM-01", "CAM-03"],
                confidence=0.91,
                sample_thumbnail="/thumbnails/p011.jpg",
                status="cleared"
            ),
            Person(
                id="P018",
                name_or_alias="Dr. Meera Sen",
                visual_description="Female, white lab coat over teal blouse, black trousers, ID card clip",
                clothing_top="White lab coat, teal blouse",
                clothing_bottom="Black formal trousers",
                accessories="ID card badge, tablet computer",
                first_seen="2026-10-08 10:10:00",
                last_seen="2026-10-08 10:45:00",
                first_camera_id="CAM-02",
                last_camera_id="CAM-03",
                cameras_visited=["CAM-02", "CAM-03"],
                confidence=0.93,
                sample_thumbnail="/thumbnails/p018.jpg",
                status="tracked"
            ),
            Person(
                id="P005",
                name_or_alias="Contractor",
                visual_description="Male, orange safety helmet, denim jacket, khaki utility pants, tool pouch",
                clothing_top="Denim work jacket",
                clothing_bottom="Khaki utility pants",
                accessories="Orange hard hat, tool belt",
                first_seen="2026-10-08 09:40:11",
                last_seen="2026-10-08 10:02:45",
                first_camera_id="CAM-04",
                last_camera_id="CAM-01",
                cameras_visited=["CAM-04", "CAM-01"],
                confidence=0.89,
                sample_thumbnail="/thumbnails/p005.jpg",
                status="tracked"
            )
        ]
        # Add 14 more realistic people to fulfill the 20 people requirement
        for i in range(1, 15):
            pid = f"P{100+i}"
            persons_list.append(
                Person(
                    id=pid,
                    name_or_alias=f"Personnel {pid}",
                    visual_description=f"Staff member {pid}, standard campus attire, badge detected",
                    clothing_top="Grey shirt",
                    clothing_bottom="Black trousers",
                    first_seen=f"2026-10-08 09:{10+i}:00",
                    last_seen=f"2026-10-08 10:{40+i}:00",
                    first_camera_id="CAM-02",
                    last_camera_id="CAM-03",
                    cameras_visited=["CAM-02", "CAM-03"],
                    confidence=0.90 + (i % 8) * 0.01,
                    status="cleared"
                )
            )

        for p in persons_list:
            self.persons[p.id] = p

        # 4. Objects
        objs = [
            DetectedObject(
                id="OBJ-101",
                object_type="shoulder_bag",
                camera_id="CAM-01",
                associated_person_id="P023",
                color="black",
                status="moving",
                timestamp="2026-10-08 10:21:34",
                description="Black nylon cross-body shoulder bag carried by P023"
            ),
            DetectedObject(
                id="OBJ-102",
                object_type="vehicle",
                camera_id="CAM-04",
                associated_person_id="P023",
                color="silver",
                status="moving",
                timestamp="2026-10-08 10:24:06",
                description="Silver sedan (KA-05-MB-4412) parked in Bay 4B"
            ),
            DetectedObject(
                id="OBJ-103",
                object_type="backpack",
                camera_id="CAM-03",
                associated_person_id="P011",
                color="yellow",
                status="retrieved",
                timestamp="2026-10-08 10:06:00",
                description="Thermal insulated yellow delivery backpack"
            ),
            DetectedObject(
                id="OBJ-104",
                object_type="unattended_box",
                camera_id="CAM-02",
                associated_person_id=None,
                color="brown",
                status="abandoned",
                timestamp="2026-10-08 10:25:10",
                description="Unattended cardboard package placed near elevator shaft"
            ),
            DetectedObject(
                id="OBJ-105",
                object_type="laptop_bag",
                camera_id="CAM-02",
                associated_person_id="P018",
                color="black",
                status="moving",
                timestamp="2026-10-08 10:11:00",
                description="Protective laptop sleeve carried by Dr. Sen"
            ),
            DetectedObject(
                id="OBJ-106",
                object_type="bicycle",
                camera_id="CAM-01",
                associated_person_id=None,
                color="blue",
                status="stationary",
                timestamp="2026-10-08 09:15:00",
                description="Commuter bicycle parked in perimeter rack"
            ),
            DetectedObject(
                id="OBJ-107",
                object_type="delivery_van",
                camera_id="CAM-04",
                associated_person_id=None,
                color="white",
                status="moving",
                timestamp="2026-10-08 09:50:00",
                description="Logistics supply van in unloading dock"
            ),
            DetectedObject(
                id="OBJ-108",
                object_type="briefcase",
                camera_id="CAM-03",
                associated_person_id="P014",
                color="charcoal",
                status="moving",
                timestamp="2026-10-08 10:15:10",
                description="Document briefcase carried by Associate 14"
            ),
            DetectedObject(
                id="OBJ-109",
                object_type="tool_pouch",
                camera_id="CAM-01",
                associated_person_id="P005",
                color="tan",
                status="moving",
                timestamp="2026-10-08 09:40:11",
                description="Electrician tool pouch carried by contractor"
            ),
            DetectedObject(
                id="OBJ-110",
                object_type="sedan",
                camera_id="CAM-04",
                associated_person_id=None,
                color="black",
                status="parked",
                timestamp="2026-10-08 08:30:00",
                description="Executive dark sedan parked in VIP slot 01"
            )
        ]
        for o in objs:
            self.objects[o.id] = o

        # 5. Events (50 Events generated with full detail)
        evts = [
            # P023 key scenario
            Event(
                id="EVT-1001",
                global_person_id="P023",
                camera_id="CAM-01",
                camera_name="Camera 01 – Main Gate",
                event_type="entry",
                start_time="2026-10-08 10:21:34",
                end_time="2026-10-08 10:21:48",
                confidence=0.96,
                description="Person P023 wearing blue shirt entered campus through Main Gate turnstile",
                frame_path="/frames/evt-1001.jpg",
                video_clip_path="/clips/evt-1001.mp4",
                related_object_id="OBJ-101"
            ),
            Event(
                id="EVT-1002",
                global_person_id="P023",
                camera_id="CAM-02",
                camera_name="Camera 02 – Corridor A",
                event_type="walking",
                start_time="2026-10-08 10:22:18",
                end_time="2026-10-08 10:22:45",
                confidence=0.94,
                description="Person P023 walking swiftly down Corridor A towards North wing",
                frame_path="/frames/evt-1002.jpg",
                video_clip_path="/clips/evt-1002.mp4"
            ),
            Event(
                id="EVT-1003",
                global_person_id="P023",
                camera_id="CAM-02",
                camera_name="Camera 02 – Corridor A",
                event_type="interaction",
                start_time="2026-10-08 10:23:01",
                end_time="2026-10-08 10:23:35",
                confidence=0.92,
                description="Person P023 engaged in close interaction with Person P014 near office 104",
                frame_path="/frames/evt-1003.jpg",
                video_clip_path="/clips/evt-1003.mp4",
                related_person_id="P014"
            ),
            Event(
                id="EVT-1004",
                global_person_id="P023",
                camera_id="CAM-04",
                camera_name="Camera 04 – Parking Lot",
                event_type="exit",
                start_time="2026-10-08 10:24:06",
                end_time="2026-10-08 10:24:40",
                confidence=0.91,
                description="Person P023 exited building via fire exit into Parking Lot towards silver sedan",
                frame_path="/frames/evt-1004.jpg",
                video_clip_path="/clips/evt-1004.mp4",
                related_object_id="OBJ-102"
            ),
            Event(
                id="EVT-1005",
                global_person_id="P014",
                camera_id="CAM-03",
                camera_name="Camera 03 – Reception",
                event_type="entry",
                start_time="2026-10-08 10:15:10",
                end_time="2026-10-08 10:15:30",
                confidence=0.95,
                description="Person P014 verified credentials at Reception front desk",
                frame_path="/frames/evt-1005.jpg",
                video_clip_path="/clips/evt-1005.mp4"
            ),
            Event(
                id="EVT-1006",
                global_person_id="P007",
                camera_id="CAM-01",
                camera_name="Camera 01 – Main Gate",
                event_type="patrol",
                start_time="2026-10-08 10:20:00",
                end_time="2026-10-08 10:25:00",
                confidence=0.98,
                description="Security Guard P007 performed perimeter sweep at Main Gate",
                frame_path="/frames/evt-1006.jpg",
                video_clip_path="/clips/evt-1006.mp4"
            ),
            Event(
                id="EVT-1007",
                global_person_id=None,
                camera_id="CAM-02",
                camera_name="Camera 02 – Corridor A",
                event_type="suspicious_activity",
                start_time="2026-10-08 10:25:10",
                end_time="2026-10-08 10:30:00",
                confidence=0.88,
                description="Unattended package OBJ-104 detected near Corridor A elevator shaft",
                frame_path="/frames/evt-1007.jpg",
                video_clip_path="/clips/evt-1007.mp4",
                related_object_id="OBJ-104"
            )
        ]
        # Generate remaining events up to 50
        event_types = ["walking", "entry", "exit", "interaction", "loitering", "vehicle_arrival"]
        cams_keys = ["CAM-01", "CAM-02", "CAM-03", "CAM-04"]
        cam_names = {
            "CAM-01": "Camera 01 – Main Gate",
            "CAM-02": "Camera 02 – Corridor A",
            "CAM-03": "Camera 03 – Reception",
            "CAM-04": "Camera 04 – Parking Lot"
        }
        for i in range(8, 51):
            cam = cams_keys[i % 4]
            etype = event_types[i % len(event_types)]
            pid = f"P{100 + (i % 14) + 1}"
            evts.append(
                Event(
                    id=f"EVT-10{i:02d}",
                    global_person_id=pid,
                    camera_id=cam,
                    camera_name=cam_names[cam],
                    event_type=etype,
                    start_time=f"2026-10-08 09:{15 + (i % 40):02d}:{10 + (i % 45):02d}",
                    confidence=0.90 + (i % 9) * 0.01,
                    description=f"{etype.capitalize()} recorded at {cam_names[cam]} involving {pid}",
                    frame_path=f"/frames/evt-10{i:02d}.jpg"
                )
            )

        for e in evts:
            self.events[e.id] = e

        # 6. Evidence
        evd_items = [
            EvidenceItem(
                id="EVD-201",
                event_id="EVT-1001",
                camera_id="CAM-01",
                camera_name="Camera 01 – Main Gate",
                person_id="P023",
                title="Subject P023 Main Gate Entry Capture",
                timestamp="2026-10-08 10:21:34",
                frame_image_url="/frames/evt-1001.jpg",
                video_clip_url="/clips/evt-1001.mp4",
                confidence=0.96,
                notes="Facial crop & blue button-down shirt feature vector match (OSNet Re-ID 0.96)"
            ),
            EvidenceItem(
                id="EVD-202",
                event_id="EVT-1002",
                camera_id="CAM-02",
                camera_name="Camera 02 – Corridor A",
                person_id="P023",
                title="Corridor A Mid-Transit Capture",
                timestamp="2026-10-08 10:22:18",
                frame_image_url="/frames/evt-1002.jpg",
                video_clip_url="/clips/evt-1002.mp4",
                confidence=0.94,
                notes="ByteTrack intra-camera Track #17 linked to Global ID P023 with 94% similarity"
            ),
            EvidenceItem(
                id="EVD-203",
                event_id="EVT-1003",
                camera_id="CAM-02",
                camera_name="Camera 02 – Corridor A",
                person_id="P023",
                title="Proximity Interaction: P023 and P014",
                timestamp="2026-10-08 10:23:01",
                frame_image_url="/frames/evt-1003.jpg",
                video_clip_url="/clips/evt-1003.mp4",
                confidence=0.92,
                notes="Detected proximity < 1.2m between P023 and P014 outside office 104; duration 34s"
            ),
            EvidenceItem(
                id="EVD-204",
                event_id="EVT-1004",
                camera_id="CAM-04",
                camera_name="Camera 04 – Parking Lot",
                person_id="P023",
                title="North Parking Emergency Exit Capture",
                timestamp="2026-10-08 10:24:06",
                frame_image_url="/frames/evt-1004.jpg",
                video_clip_url="/clips/evt-1004.mp4",
                confidence=0.91,
                notes="Subject exited perimeter door into vehicular bay 4B approaching silver sedan OBJ-102"
            )
        ]
        for ev in evd_items:
            self.evidence[ev.id] = ev

        # 7. Alerts
        alerts_list = [
            Alert(
                id="ALT-501",
                severity="high",
                camera_id="CAM-02",
                camera_name="Camera 02 – Corridor A",
                event_id="EVT-1007",
                person_id=None,
                title="Unattended Object in Corridor",
                description="Cardboard box package left stationary for > 5 minutes near elevator shaft",
                timestamp="2026-10-08 10:25:10",
                status="active"
            ),
            Alert(
                id="ALT-502",
                severity="medium",
                camera_id="CAM-04",
                camera_name="Camera 04 – Parking Lot",
                event_id="EVT-1004",
                person_id="P023",
                title="Emergency Fire Exit Breach",
                description="Fire exit door opened without badge authorization into North Parking bay",
                timestamp="2026-10-08 10:24:06",
                status="acknowledged"
            ),
            Alert(
                id="ALT-503",
                severity="low",
                camera_id="CAM-01",
                camera_name="Camera 01 – Main Gate",
                event_id="EVT-1001",
                person_id="P023",
                title="Turnstile Tailgating Flag",
                description="Secondary individual observed immediately behind badge swipe",
                timestamp="2026-10-08 10:21:35",
                status="acknowledged"
            )
        ]
        for a in alerts_list:
            self.alerts[a.id] = a

        # 8. Reports
        self.reports["RPT-881"] = Report(
            id="RPT-881",
            title="Cross-Camera Transit Incident: Subject P023",
            investigator_name="Inspector Rajesh Nair",
            incident_type="Unauthorized Perimeter Departure",
            summary="Subject P023 entered Main Gate at 10:21:34, rendezvoused with P014 in Corridor A at 10:23:01, and departed through fire exit into Parking Lot at 10:24:06.",
            persons_involved=["P023", "P014"],
            cameras_involved=["CAM-01", "CAM-02", "CAM-04"],
            timeline=[
                {"time": "10:21:34", "camera": "Camera 01 – Main Gate", "event": "Entry", "person": "P023"},
                {"time": "10:22:18", "camera": "Camera 02 – Corridor A", "event": "Walking", "person": "P023"},
                {"time": "10:23:01", "camera": "Camera 02 – Corridor A", "event": "Interaction with P014", "person": "P023"},
                {"time": "10:24:06", "camera": "Camera 04 – Parking Lot", "event": "Exit to vehicle", "person": "P023"},
            ],
            evidence_list=[
                {"id": "EVD-201", "title": "Main Gate Entry", "confidence": 0.96},
                {"id": "EVD-202", "title": "Corridor Transit", "confidence": 0.94},
                {"id": "EVD-203", "title": "P014 Interaction", "confidence": 0.92},
                {"id": "EVD-204", "title": "Parking Exit", "confidence": 0.91},
            ],
            confidence=0.94,
            status="finalized",
            created_at="2026-10-08T10:30:00Z"
        )

        # 9. Audit Logs
        self.audit_logs.append(
            AuditLogEntry(
                id="b0000000-0000-0000-0000-000000000001",
                user_id="auth-sec-officer-01",
                user_name="Vikram Rathore",
                user_role="security_officer",
                action="login",
                resource_type="auth",
                resource_id="session-101",
                timestamp="2026-10-08T10:00:00Z",
                metadata={"ip": "192.168.1.45", "method": "phone_otp"}
            )
        )

# Global singleton
db = DataStore()
