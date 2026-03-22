"""Mock visual detection engines (LipForensics, DeepfakeHop).

These return simulated scores+evidence. Replace internals with real
PyTorch inference when model weights are available.
"""
from __future__ import annotations

import asyncio
import math
import random
import time

from engines.base import DetectionEngine
from models.schemas import EngineResult, Modality, Verdict


def _make_verdict(score: float, threshold: float = 0.5) -> Verdict:
    if score >= threshold:
        return Verdict.SPOOF
    return Verdict.BONAFIDE


def _generate_heatmap(width: int = 8, height: int = 8) -> list[list[float]]:
    """Create a fake Grad-CAM heatmap grid."""
    cx, cy = random.randint(2, 5), random.randint(2, 5)
    grid: list[list[float]] = []
    for y in range(height):
        row: list[float] = []
        for x in range(width):
            dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            val = max(0.0, 1.0 - dist / 4.0) + random.uniform(-0.05, 0.05)
            row.append(round(max(0.0, min(1.0, val)), 3))
        grid.append(row)
    return grid


class LipForensicsEngine(DetectionEngine):
    name = "LipForensics"
    modality = Modality.VISUAL

    async def analyze(self, file_path: str, file_hash: str) -> EngineResult:
        await asyncio.sleep(random.uniform(0.3, 0.8))  # simulate processing
        t0 = time.perf_counter()
        score = round(random.uniform(0.0, 1.0), 4)
        elapsed = (time.perf_counter() - t0) * 1000

        return EngineResult(
            engine_name=self.name,
            modality=self.modality,
            raw_score=score,
            verdict=_make_verdict(score),
            evidence={
                "type": "gradcam",
                "heatmap": _generate_heatmap(),
                "description": "唇部區域偽影偵測熱力圖 (Lip region artifact heatmap)",
                "frames_analyzed": 25,
            },
            processing_time_ms=round(elapsed + random.uniform(200, 600), 1),
        )


class DeepfakeHopEngine(DetectionEngine):
    name = "DeepfakeHop"
    modality = Modality.VISUAL

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
                "type": "gradcam",
                "heatmap": _generate_heatmap(),
                "description": "臉部合成痕跡分析 (Facial synthesis trace analysis)",
                "frames_analyzed": 25,
            },
            processing_time_ms=round(elapsed + random.uniform(100, 400), 1),
        )
