# MultiStream AI – Secure Conversational Multi-Camera Video Intelligence

> **"Instead of manually watching hours of CCTV footage, authorized investigators can ask the video intelligence system what happened and receive a temporally ordered, cross-camera, evidence-backed answer."**

---

## 1. System Overview

**MultiStream AI** is an enterprise-grade AI-powered multi-camera video intelligence and investigation platform combining:
- **Secure Supabase Phone-OTP Authentication** (`+91` format with 45s resend cooldown).
- **Strict Role-Based Access Control (RBAC)** across 4 enterprise personas (`security_officer`, `security_manager`, `campus_admin`, `investigation_team`).
- **Database Row Level Security (RLS)** protecting 12 core schema tables.
- **Computer Vision Pipeline**:
  - Detection: YOLO11
  - Intra-Camera Tracking: ByteTrack
  - Cross-Camera Person Re-ID: OSNet / FastReID architecture
  - Semantic Retrieval: SigLIP Embeddings
- **Temporal Event Graph**: Models cross-camera transitions and proximity interactions.
- **Conversational AI Investigation**: Multi-turn dialogue with coreference resolution (*"Where did he go?"*, *"Who was he with?"*) and anti-hallucination guardrails (*"I could not find sufficient evidence in the available camera footage."*).
- **Evidence Verification**: Every answer is grounded by timecode, camera source, confidence score, and clickable visual evidence frames.
- **Audit Logging**: Immutable tracking of all logins, inquiries, evidence views, and exported reports.

---

## 2. Architecture & Data Flow

```
Multiple CCTV Streams (CAM-01, CAM-02, CAM-03, CAM-04)
        ↓
OpenCV / Canvas Rendering Engine
        ↓
YOLO11 Detection (Pedestrians, Vehicles, Objects)
        ↓
ByteTrack Intra-Camera Tracking (Track #17, #42, #8)
        ↓
Cross-Camera Person Re-ID (OSNet: Maps to Global ID P023)
        ↓
Event Extraction (Entry, Exit, Walking, Interaction, Alert)
        ↓
Temporal Event Graph & Semantic Embeddings (SigLIP + Qdrant)
        ↓
Query Understanding & Coreference Parser (he, him, there, then)
        ↓
Hybrid Retrieval (Semantic + Structured Metadata)
        ↓
Temporal Reasoning Engine
        ↓
Evidence Verification Guardrail (Anti-Hallucination)
        ↓
Evidence-Backed Conversational Answer
```

---

## 3. User Roles & RBAC Matrix

| Role | Dashboard | Live Cameras | AI Investigation | Person Journey | Event Timeline | Alert Center | Camera Mgmt | Analytics | Export Reports | Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Security Officer** | ✅ | ✅ (Live Grid) | ✅ | ✅ | ✅ | Ack/View | ❌ | Basic | ❌ | ❌ |
| **Security Manager** | ✅ | ✅ (Live Grid) | ✅ | ✅ | ✅ | Full Control | ✅ | Advanced | ✅ | ✅ |
| **Campus Admin** | ✅ | Status Only | ❌ (Blocked) | ❌ (Blocked) | Overview | View Major | Status | Overview | View Only | ❌ |
| **Investigation Team** | ✅ | History | ✅ (Forensic) | ✅ (Full) | Advanced | View | ❌ | Incidents | ✅ (Full MD/PDF) | ❌ |

---

## 4. Pre-Configured Test Credentials

For quick evaluation during demonstrations, the following accounts can be accessed via Phone OTP (`123456`):

| Role | Name | Phone Number | Description |
| :--- | :--- | :--- | :--- |
| **Security Officer** | Vikram Rathore | `+91 9876543210` | CCTV Monitoring & Real-time Alerts |
| **Security Manager** | Priya Sharma | `+91 9876543211` | Team Lead, Camera Config & Audit Logs |
| **Campus Admin** | Dr. Arvind Patel | `+91 9876543212` | High-level Campus Overview (Restricted Forensics) |
| **Investigation Team** | Inspector Rajesh Nair | `+91 9876543213` | Deep AI Forensics & Report Export |

---

## 5. Demonstration Walkthrough: The Person P023 Scenario

1. **Login**: Enter `+91 9876543210` or click "Security Officer" quick preset. Enter OTP `123456`.
2. **Surveillance Matrix**: View the 2x2 live camera grid (Main Gate, Corridor A, Reception, Parking Lot) with dynamic animated YOLO11 bounding boxes and ByteTrack IDs.
3. **Launch AI Investigation**:
   - Query: *"Where did the man in the blue shirt go after entering the main gate?"*
   - AI Response:
     > *"Subject P023 was tracked across multiple cameras: CAM-01 → CAM-02 → CAM-04.*
     > *• 10:21:34 (Camera 01 – Main Gate): Entered campus through perimeter turnstile.*
     > *• 10:22:18 (Camera 02 – Corridor A): Moved swiftly down ground floor corridor.*
     > *• 10:23:01 (Camera 02 – Corridor A): Observed in close interaction with Associate P014.*
     > *• 10:24:06 (Camera 04 – Parking Lot): Exited through emergency door into vehicle bay 4B towards silver sedan (KA-05-MB-4412)."*
4. **Follow-Up Conversational Inquiry**:
   - Query: *"Who was he with?"*
   - Coreference Resolver maps *"he"* to `P023`.
   - AI Response:
     > *"Subject P023 was detected in close proximity and interacting with Associate 14 (P014) in CAM-02 at 10:23:01."*
5. **Inspect Evidence**: Click `[VIEW EVIDENCE]` to open the verified frame crop and video clip player with confidence score.
6. **Anti-Hallucination Guardrail Check**:
   - Query: *"Did someone in a purple cape steal a helicopter?"*
   - AI Response:
     > *"I could not find sufficient evidence in the available camera footage."*
7. **Switch to Investigation Team**: Open **Incident Reports** and click `[EXPORT REPORT]` to download the forensic markdown document.

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Start the Backend API
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 7. Project Structure

```
multistream-ai/
├── README.md                          # Documentation
├── .env.example                       # Environment template
├── database/
│   ├── schema.sql                     # Supabase PostgreSQL tables
│   ├── seed.sql                       # 4 Cameras, 20 People, 50 Events, Alerts
│   └── rls_policies.sql               # Row Level Security RBAC policies
├── backend/
│   ├── main.py                        # FastAPI entry point
│   ├── config.py                      # Server settings
│   ├── models.py                      # Pydantic schemas
│   ├── database.py                    # Surveillance store & seed data
│   ├── rbac.py                        # Permission matrix enforcement
│   ├── audit.py                       # Audit logging utility
│   ├── engine/
│   │   ├── temporal_graph.py          # Spatial-temporal event graph
│   │   ├── query_parser.py            # Natural language & coreference parsing
│   │   ├── hybrid_retriever.py        # Vector + metadata retriever
│   │   ├── reasoning_engine.py        # Multi-camera narrative synthesizer
│   │   └── evidence_verifier.py       # Anti-hallucination guardrail
│   └── routers/
│       ├── auth_router.py             # Phone OTP auth & session management
│       ├── camera_router.py           # Multi-camera feeds & management
│       ├── investigation_router.py    # Conversational AI investigation
│       ├── journey_router.py          # Cross-camera person trajectory
│       ├── events_router.py           # Event timeline & search
│       ├── alerts_router.py           # Real-time incident alerts
│       ├── analytics_router.py        # Recharts metrics
│       ├── reports_router.py          # Forensic report generator & export
│       └── audit_router.py            # Audit compliance log
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx                    # Main layout & router
        ├── context/AuthContext.tsx    # Auth & RBAC provider
        ├── services/api.ts            # REST API client
        ├── services/supabase.ts       # Supabase client
        └── components/
            ├── auth/LoginPage.tsx
            ├── common/Header.tsx
            ├── common/Sidebar.tsx
            ├── common/EvidenceModal.tsx
            ├── dashboard/OverviewDashboard.tsx
            ├── surveillance/LiveCameraGrid.tsx
            ├── surveillance/CameraFeedCanvas.tsx
            ├── investigation/AIChatInvestigation.tsx
            ├── journey/PersonJourneyView.tsx
            ├── timeline/EventTimelineView.tsx
            ├── alerts/AlertCenterView.tsx
            ├── analytics/AnalyticsDashboard.tsx
            ├── management/CameraManagementView.tsx
            ├── reports/InvestigationReportView.tsx
            └── audit/AuditLogView.tsx
```
