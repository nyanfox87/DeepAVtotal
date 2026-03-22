"""Upload router — handles file upload and hash lookup."""
from __future__ import annotations

import hashlib
import os
from pathlib import Path

from fastapi import APIRouter, File, UploadFile, HTTPException

from database import file_exists, get_cached_result, save_file_record
from models.schemas import LookupResponse, UploadResponse
from services.media_probe import detect_media_type, get_applicable_modalities

router = APIRouter(prefix="/api", tags=["upload"])

UPLOAD_DIR = Path(__file__).parent.parent / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload a video/audio file, compute SHA-256, check cache."""
    content = await file.read()

    # Compute SHA-256
    file_hash = hashlib.sha256(content).hexdigest()

    # Check cache
    cached = file_exists(file_hash)

    # Save file to disk
    ext = os.path.splitext(file.filename or "video.mp4")[1]
    file_path = UPLOAD_DIR / f"{file_hash}{ext}"
    if not file_path.exists():
        with open(file_path, "wb") as f:
            f.write(content)

    # Detect media type (audio-only, video-only, or video+audio)
    media_type = detect_media_type(str(file_path))
    applicable = get_applicable_modalities(media_type)

    # Save file record to DB
    file_format = ext.lstrip(".")
    save_file_record(
        file_hash=file_hash,
        filename=file.filename or "unknown",
        file_size=len(content),
        file_format=file_format,
        source_url=None,
    )

    return UploadResponse(
        file_hash=file_hash,
        filename=file.filename or "unknown",
        cached=cached,
        media_type=media_type.value,
        applicable_modalities=applicable,
        message="File already analyzed — cached results available." if cached else "File uploaded successfully. Ready for analysis.",
    )


@router.get("/lookup/{file_hash}", response_model=LookupResponse)
async def lookup_hash(file_hash: str):
    """Check if a file hash has cached results."""
    result = get_cached_result(file_hash)
    if result:
        return LookupResponse(found=True, result=result)
    return LookupResponse(found=False)
