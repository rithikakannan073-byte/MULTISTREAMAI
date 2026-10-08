from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
from models import Report
from database import db
from rbac import require_permission
from audit import log_audit_event
from routers.auth_router import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("", response_model=List[Report])
def list_reports(authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    # Officers and Admins can read reports; Managers and Investigators have full access
    require_permission(user.role, "view_reports")
    return list(db.reports.values())

@router.post("", response_model=Report)
def create_report(report: Report, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    require_permission(user.role, "create_reports")

    db.reports[report.id] = report

    log_audit_event(
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role,
        action="report_created",
        resource_type="report",
        resource_id=report.id,
        metadata={"title": report.title, "incident_type": report.incident_type}
    )

    return report

@router.get("/{report_id}")
def get_report(report_id: str, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    require_permission(user.role, "view_reports")

    rpt = db.reports.get(report_id)
    if not rpt:
        raise HTTPException(status_code=404, detail="Report not found")
    return rpt

@router.post("/{report_id}/export")
def export_report(report_id: str, authorization: Optional[str] = Header(None)):
    user = get_current_user(authorization)
    # Require export permissions
    if user.role != "security_manager":
        require_permission(user.role, "export_investigation_report")

    rpt = db.reports.get(report_id)
    if not rpt:
        raise HTTPException(status_code=404, detail="Report not found")

    log_audit_event(
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role,
        action="report_exported",
        resource_type="report",
        resource_id=report_id,
        metadata={"title": rpt.title, "format": "markdown/pdf"}
    )

    # Format Markdown document
    md = f"""# MULTISTREAM AI – FORENSIC INVESTIGATION REPORT
**Report ID**: {rpt.id}
**Incident**: {rpt.title}
**Investigator**: {rpt.investigator_name}
**Classification**: {rpt.incident_type}
**Confidence Score**: {rpt.confidence * 100:.1f}%
**Generated**: {rpt.created_at}

---

## 1. Executive Summary
{rpt.summary}

## 2. Subjects Involved
{', '.join(rpt.persons_involved)}

## 3. Monitored Cameras
{', '.join(rpt.cameras_involved)}

## 4. Chronological Timeline
"""
    for t in rpt.timeline:
        md += f"- **{t.get('time')}** [{t.get('camera')}]: {t.get('event')} ({t.get('person')})\n"

    md += "\n## 5. Verified Evidence Records\n"
    for e in rpt.evidence_list:
        md += f"- **{e.get('id')}**: {e.get('title')} (Confidence: {e.get('confidence', 0)*100:.0f}%)\n"

    md += "\n---\n*Verified by MultiStream AI Enterprise Guardrail Engine. Authenticated via Supabase RBAC.*"

    return {
        "report_id": rpt.id,
        "format": "markdown",
        "content": md,
        "filename": f"Investigation_Report_{rpt.id}.md"
    }
