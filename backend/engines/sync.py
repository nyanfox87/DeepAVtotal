"""Mock sync detection engines (SyncNet, LipFD)."""
from __future__ import annotations

import asyncio
import random
import time

from engines.base import DetectionEngine
from models.schemas import EngineResult, Modality, Verdict


def _make_verdict(score: float, threshold: float = 0.5) -> Verdict:
    if score >= threshold:
        return Verdict.SPOOF
    return Verdict.BONAFIDE


def _generate_sync_curve(duration_s: float = 30.0, points: int = 60) -> list[dict]:
    """Simulate an offset curve for AV sync analysis."""
    curve = []
    for i in range(points):
        t = round(i * duration_s / points, 2)
        offset = round(random.gauss(0, 40), 1)  # offset in ms
        curve.append({"time_s": t, "offset_ms": offset})
    return curve


class SyncNetEngine(DetectionEngine):
    name = "SyncNet"
    modality = Modality.SYNC

    async def analyze(self, file_path: str, file_hash: str) -> EngineResult:
        await asyncio.sleep(random.uniform(0.3, 0.8))
        t0 = time.perf_counter()
        score = round(random.uniform(0.0, 1.0), 4)
        elapsed = (time.perf_counter() - t0) * 1000

        curve = _generate_sync_curve()
        avg_offset = round(sum(abs(p["offset_ms"]) for p in curve) / len(curve), 1)

        return EngineResult(
            engine_name=self.name,
            modality=self.modality,
            raw_score=score,
            verdict=_make_verdict(score),
            evidence={
                "type": "sync_timeline",
                "offset_curve": curve,
                "average_offset_ms": avg_offset,
                "description": "影音同步性檢測時間軸 (AV sync timeline)",
            },
            processing_time_ms=round(elapsed + random.uniform(200, 600), 1),
        )


class LipFDEngine(DetectionEngine):
    name = "LipFD"
    modality = Modality.SYNC

    async def analyze(self, file_path: str, file_hash: str) -> EngineResult:
        await asyncio.sleep(random.uniform(0.3, 0.8))
        t0 = time.perf_counter()
        score = round(random.uniform(0.0, 1.0), 4)
        elapsed = (time.perf_counter() - t0) * 1000

        curve = _generate_sync_curve()
        avg_offset = round(sum(abs(p["offset_ms"]) for p in curve) / len(curve), 1)

        return EngineResult(
            engine_name=self.name,
            modality=self.modality,
            raw_score=score,
            verdict=_make_verdict(score),
            evidence={
                "type": "sync_timeline",
                "offset_curve": curve,
                "average_offset_ms": avg_offset,
                "description": "唇語驅動偽造偵測 (Lip-driven forgery detection)",
            },
            processing_time_ms=round(elapsed + random.uniform(150, 500), 1),
        )
