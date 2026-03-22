"""FormosaDeepAV — FastAPI main application entry point."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import upload, analysis, community

app = FastAPI(
    title="FormosaDeepAV API",
    description="Multi-modal deepfake detection platform API",
    version="0.1.0",
)

# ── CORS ───────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────
app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(community.router)


# ── Startup ────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    init_db()


@app.get("/")
async def root():
    return {
        "name": "FormosaDeepAV API",
        "version": "0.1.0",
        "status": "running",
        "endpoints": {
            "upload": "/api/upload",
            "lookup": "/api/lookup/{hash}",
            "analyze": "/api/analyze/{hash}",
            "community": "/api/community/{hash}/stats",
        },
    }
