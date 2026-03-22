"""Score fusion logic implementing Equations 8-11 from the proposal.

Sm = Σ w_{m,k} · s_{m,k}           — per-modality weighted average
S_total = W_A·S_A + W_B·S_B + W_C·S_C  — cross-modality total
r_m = (W_m · S_m) / (S_total + ε)  — contribution ratio
"""
from __future__ import annotations

from models.schemas import (
    EngineResult,
    Modality,
    ModalityScore,
    Verdict,
)

# Default weights — configurable via config.yaml at startup
ENGINE_WEIGHTS: dict[str, float] = {
    "LipForensics": 0.6,
    "DeepfakeHop": 0.4,
    "AASIST": 0.5,
    "Conformer": 0.5,
    "SyncNet": 0.7,
    "LipFD": 0.3,
}

MODALITY_WEIGHTS: dict[Modality, float] = {
    Modality.VISUAL: 0.40,
    Modality.AUDIO: 0.35,
    Modality.SYNC: 0.25,
}

EPSILON = 1e-8


def _verdict_from_score(score: float, threshold: float = 0.5) -> Verdict:
    if score >= threshold:
        return Verdict.SPOOF
    return Verdict.BONAFIDE


def compute_modality_score(results: list[EngineResult]) -> ModalityScore:
    """Equation 9: S_m = Σ w_{m,k} · s_{m,k}"""
    if not results:
        raise ValueError("No engine results to fuse")

    modality = results[0].modality
    total_weight = 0.0
    weighted_sum = 0.0

    for r in results:
        w = ENGINE_WEIGHTS.get(r.engine_name, 1.0 / len(results))
        weighted_sum += w * r.raw_score
        total_weight += w

    # Normalise if weights don't sum to 1
    score = weighted_sum / total_weight if total_weight > 0 else 0.0
    score = round(score, 4)

    return ModalityScore(
        modality=modality,
        engines=results,
        weighted_score=score,
        verdict=_verdict_from_score(score),
    )


def compute_overall_score(modality_scores: list[ModalityScore]) -> float:
    """Equation 10: S_total = W_A·S_A + W_B·S_B + W_C·S_C"""
    total = 0.0
    for ms in modality_scores:
        w = MODALITY_WEIGHTS.get(ms.modality, 1.0 / len(modality_scores))
        total += w * ms.weighted_score
    return round(total, 4)


def compute_contribution_ratios(
    modality_scores: list[ModalityScore], overall: float
) -> dict[Modality, float]:
    """Equation 11: r_m = (W_m · S_m) / (S_total + ε)"""
    ratios: dict[Modality, float] = {}
    for ms in modality_scores:
        w = MODALITY_WEIGHTS.get(ms.modality, 1.0 / len(modality_scores))
        c_m = w * ms.weighted_score
        r_m = c_m / (overall + EPSILON)
        ratios[ms.modality] = round(r_m, 4)
        ms.contribution_ratio = round(r_m, 4)
    return ratios
