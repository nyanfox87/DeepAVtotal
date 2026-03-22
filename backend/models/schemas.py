"""Pydantic models for the FormosaDeepAV platform."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class Modality(str, Enum):
    VISUAL = "visual"
    AUDIO = "audio"
    SYNC = "sync"


class Verdict(str, Enum):
    BONAFIDE = "BONAFIDE"
    SPOOF = "SPOOF"
    UNCERTAIN = "UNCERTAIN"


# ── Engine results ──────────────────────────────────────────────────────
class EngineResult(BaseModel):
    engine_name: str
    modality: Modality
    raw_score: float = Field(ge=0.0, le=1.0, description="Forgery risk score 0=real 1=fake")
    verdict: Verdict
    evidence: Optional[dict[str, Any]] = None  # Grad-CAM, spectrogram, etc.
    processing_time_ms: float = 0.0


class ModalityScore(BaseModel):
    modality: Modality
    engines: list[EngineResult]
    weighted_score: float = Field(ge=0.0, le=1.0)
    verdict: Verdict
    contribution_ratio: float = 0.0


# ── Diagnostic report ──────────────────────────────────────────────────
class DiagnosticReport(BaseModel):
    risk_level: str  # "LOW" | "MEDIUM" | "HIGH"
    overall_score: float
    summary_zh: str
    summary_en: str
    dominant_modality: Optional[Modality] = None


# ── Full analysis result ───────────────────────────────────────────────
class AnalysisResult(BaseModel):
    file_hash: str
    filename: str
    file_size: int
    file_format: str
    media_type: str = "video_audio"  # video_audio | video_only | audio_only
    applicable_modalities: list[str] = ["visual", "audio", "sync"]
    source_url: Optional[str] = None
    analyzed_at: datetime
    modalities: list[ModalityScore]
    overall_score: float
    diagnostic: DiagnosticReport


# ── Upload / Lookup ────────────────────────────────────────────────────
class UploadResponse(BaseModel):
    file_hash: str
    filename: str
    cached: bool
    media_type: str = "video_audio"  # video_audio | video_only | audio_only
    applicable_modalities: list[str] = ["visual", "audio", "sync"]
    message: str


class LookupResponse(BaseModel):
    found: bool
    result: Optional[AnalysisResult] = None


# ── Community ──────────────────────────────────────────────────────────
class CommunityVote(BaseModel):
    vote: str = Field(pattern="^(REAL|FAKE)$")


class CommunityStats(BaseModel):
    total_votes: int
    real_votes: int
    fake_votes: int
    real_ratio: float
    fake_ratio: float
