"""Analysis router — triggers parallel detection across applicable modalities only."""
from __future__ import annotations

import asyncio
import glob
import json
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException

from database import get_cached_result, save_result, file_exists
from engines import (
    LipForensicsEngine,
    DeepfakeHopEngine,
    AASISTEngine,
    ConformerEngine,
    SyncNetEngine,
    LipFDEngine,
)
from models.schemas import AnalysisResult, Modality, ModalityScore
from services.fusion import (
    compute_modality_score,
    compute_overall_score,
    compute_contribution_ratios,
)
from services.diagnostics import generate_diagnostic
from services.media_probe import detect_media_type, get_applicable_modalities

router = APIRouter(prefix="/api", tags=["analysis"])

UPLOAD_DIR = Path(__file__).parent.parent / "data" / "uploads"

# ── Engine registry grouped by modality ────────────────────────────────
ENGINES_BY_MODALITY: dict[str, list] = {
    "visual": [LipForensicsEngine(), DeepfakeHopEngine()],
    "audio": [AASISTEngine(), ConformerEngine()],
    "sync": [SyncNetEngine(), LipFDEngine()],
}


def _find_file(file_hash: str) -> str:
    """Find the uploaded file by hash (any extension)."""
    matches = list(UPLOAD_DIR.glob(f"{file_hash}.*"))
    if matches:
        return str(matches[0])
    return str(UPLOAD_DIR / file_hash)


@router.post("/analyze/{file_hash}")
async def run_analysis(file_hash: str, force: bool = False):
    """Run multi-modal analysis, dispatching only applicable modalities.

    If the file is audio-only, only audio engines run.
    If the file is video-only (no audio track), only visual engines run.
    If the file has both video and audio, all three modalities run.
    """

    if not file_exists(file_hash):
        raise HTTPException(status_code=404, detail="File not found. Upload it first.")

    # Return cached result unless force re-analyze
    if not force:
        cached = get_cached_result(file_hash)
        if cached:
            return cached

    # ── Detect applicable modalities ───────────────────────────────────
    file_path = _find_file(file_hash)
    media_type = detect_media_type(file_path)
    applicable = get_applicable_modalities(media_type)

    # ── Dispatch only applicable engines in parallel ───────────────────
    tasks = []
    for modality_key in applicable:
        engines = ENGINES_BY_MODALITY.get(modality_key, [])
        for engine in engines:
            tasks.append(engine.analyze(file_path, file_hash))

    engine_results = await asyncio.gather(*tasks)

    # ── Group by modality ──────────────────────────────────────────────
    by_modality: dict[Modality, list] = {}
    for r in engine_results:
        by_modality.setdefault(r.modality, []).append(r)

    # ── Compute scores (only for modalities that ran) ──────────────────
    modality_scores: list[ModalityScore] = []
    for modality in [Modality.VISUAL, Modality.AUDIO, Modality.SYNC]:
        results = by_modality.get(modality, [])
        if results:
            modality_scores.append(compute_modality_score(results))

    overall = compute_overall_score(modality_scores)
    ratios = compute_contribution_ratios(modality_scores, overall)
    diagnostic = generate_diagnostic(modality_scores, overall, ratios)

    # ── Build result object ────────────────────────────────────────────
    result = AnalysisResult(
        file_hash=file_hash,
        filename="uploaded_file",
        file_size=0,
        file_format=Path(file_path).suffix.lstrip(".") or "unknown",
        media_type=media_type.value,
        applicable_modalities=applicable,
        source_url=None,
        analyzed_at=datetime.utcnow(),
        modalities=modality_scores,
        overall_score=overall,
        diagnostic=diagnostic,
    )

    # ── Cache result ───────────────────────────────────────────────────
    result_json = result.model_dump_json()
    save_result(file_hash, result_json)

    return result


@router.get("/analyze/{file_hash}/results")
async def get_results(file_hash: str):
    """Get cached analysis results for a file hash."""
    cached = get_cached_result(file_hash)
    if not cached:
        raise HTTPException(status_code=404, detail="No analysis results found. Run analysis first.")
    return cached
