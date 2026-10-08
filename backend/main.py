import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

from routers.auth_router import router as auth_router
from routers.camera_router import router as camera_router
from routers.investigation_router import router as investigation_router
from routers.journey_router import router as journey_router
from routers.events_router import router as events_router
from routers.alerts_router import router as alerts_router
from routers.analytics_router import router as analytics_router
from routers.reports_router import router as reports_router
from routers.audit_router import router as audit_router
from routers.video_router import router as video_router
from fastapi.staticfiles import StaticFiles
from pipeline.real_store import STORAGE_DIR

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="MultiStream AI – Secure Conversational Multi-Camera Video Intelligence API"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static media directory for real video footage and evidence
app.mount("/media", StaticFiles(directory=str(STORAGE_DIR.resolve())), name="media")

# Register routers
app.include_router(auth_router)
app.include_router(camera_router)
app.include_router(investigation_router)
app.include_router(journey_router)
app.include_router(events_router)
app.include_router(alerts_router)
app.include_router(analytics_router)
app.include_router(reports_router)
app.include_router(audit_router)
app.include_router(video_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": settings.APP_NAME,
        "version": settings.VERSION,
        "security": "Supabase Phone-OTP + RLS Enforced",
        "vision_models": ["YOLO11 Detection", "ByteTrack Tracking", "OSNet Re-ID", "SigLIP Embeddings"]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
