"""Mock audio detection engines (AASIST, Conformer)."""
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


def _generate_spectrogram_segments(duration_s: float = 30.0) -> list[dict]:
    """Simulate anomaly segments on a spectrogram."""
    segments = []
    n = random.randint(0, 4)
    for _ in range(n):
        start = round(random.uniform(0, duration_s - 2), 2)
        end = round(start + random.uniform(0.5, 3.0), 2)
        segments.append({
            "start_s": start,
            "end_s": min(end, duration_s),
            "severity": round(random.uniform(0.3, 1.0), 2),
        })
    return segments


class AASISTEngine(DetectionEngine):
    name = "AASIST"
    modality = Modality.AUDIO

    async def analyze(self, file_path: str, file_hash: str) -> EngineResult:
        await asyncio.sleep(random.uniform(0.3, 0.8))
        t0 = time.perf_counter()
        score = round(random.uniform(0.0, 1.0), 4)
        elapsed = (time.perf_counter() - t0) * 1000

        return EngineResult(
            engine_name=self.name,
            modality=self.modality,
            raw_score=score,
            verdict=_make_verdict(score),
            evidence={
                "type": "spectrogram",
                "anomaly_segments": _generate_spectrogram_segments(),
                "description": "語音合成痕跡分析 (Speech synthesis trace analysis)",
                "sample_rate": 16000,
            },
            processing_time_ms=round(elapsed + random.uniform(150, 500), 1),
        )


class ConformerEngine(DetectionEngine):
    name = "Conformer"
    modality = Modality.AUDIO

    async def analyze(self, file_path: str, file_hash: str) -> EngineResult:
        await asyncio.sleep(random.uniform(0.3, 0.8))
        t0 = time.perf_counter()
        score = round(random.uniform(0.0, 1.0), 4)
        elapsed = (time.perf_counter() - t0) * 1000

        return EngineResult(
            engine_name=self.name,
            modality=self.modality,
            raw_score=score,
            verdict=_make_verdict(score),
            evidence={
                "type": "spectrogram",
                "anomaly_segments": _generate_spectrogram_segments(),
                "description": "聲學特徵一致性檢測 (Acoustic consistency check)",
                "sample_rate": 16000,
            },
            processing_time_ms=round(elapsed + random.uniform(100, 400), 1),
        )
