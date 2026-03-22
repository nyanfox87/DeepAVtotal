"""Diagnostic text generation — maps scores to human-readable reports."""
from __future__ import annotations

from models.schemas import DiagnosticReport, Modality, ModalityScore


def generate_diagnostic(
    modality_scores: list[ModalityScore],
    overall_score: float,
    ratios: dict[Modality, float],
) -> DiagnosticReport:
    """Generate bilingual diagnostic summary based on risk level and contribution ratios."""

    # ── Risk level classification ──
    if overall_score < 0.3:
        risk_level = "LOW"
    elif overall_score < 0.6:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    # ── Identify dominant modality ──
    dominant: Modality | None = None
    max_ratio = 0.0
    for m, r in ratios.items():
        if r > max_ratio:
            max_ratio = r
            dominant = m

    # ── Generate Chinese summary ──
    modality_names_zh = {
        Modality.VISUAL: "影像偽影",
        Modality.AUDIO: "音訊特徵",
        Modality.SYNC: "影音同步性",
    }
    modality_names_en = {
        Modality.VISUAL: "visual artifacts",
        Modality.AUDIO: "audio features",
        Modality.SYNC: "AV synchrony",
    }

    pct = round(overall_score * 100, 1)

    if risk_level == "LOW":
        summary_zh = (
            f"綜合風險評分 {pct}%，系統判定該檔案偽造風險極低。"
            f"三個模態（影像、音訊、同步性）均未偵測到顯著異常。"
        )
        summary_en = (
            f"Overall risk score {pct}%. The system assesses this file as very low risk. "
            f"No significant anomalies detected across all three modalities."
        )
    elif risk_level == "MEDIUM":
        dom_zh = modality_names_zh.get(dominant, "未知") if dominant else "多重模態"
        dom_en = modality_names_en.get(dominant, "unknown") if dominant else "multiple modalities"
        summary_zh = (
            f"綜合風險評分 {pct}%，系統判定為中度可疑。"
            f"主要疑點來源：{dom_zh}（貢獻度 {round(max_ratio * 100, 1)}%）。"
            f"建議進一步人工確認。"
        )
        summary_en = (
            f"Overall risk score {pct}%. Assessed as moderately suspicious. "
            f"Primary concern: {dom_en} (contribution {round(max_ratio * 100, 1)}%). "
            f"Manual review recommended."
        )
    else:  # HIGH
        dom_zh = modality_names_zh.get(dominant, "未知") if dominant else "多重模態"
        dom_en = modality_names_en.get(dominant, "unknown") if dominant else "multiple modalities"

        # Check if multiple modalities are above threshold
        high_modalities = [m for m, r in ratios.items() if r > 0.3]
        if len(high_modalities) > 1:
            multi_zh = "、".join(modality_names_zh.get(m, "") for m in high_modalities)
            summary_zh = (
                f"綜合風險評分 {pct}%，系統判定為高度可疑！"
                f"多模態協同異常：{multi_zh}皆顯示偽造痕跡。"
                f"強烈建議標記為深偽內容。"
            )
            multi_en = ", ".join(modality_names_en.get(m, "") for m in high_modalities)
            summary_en = (
                f"Overall risk score {pct}%. Assessed as HIGHLY SUSPICIOUS. "
                f"Cross-modal anomalies detected in: {multi_en}. "
                f"Strong recommendation to flag as deepfake content."
            )
        else:
            summary_zh = (
                f"綜合風險評分 {pct}%，系統判定為高度可疑！"
                f"主要疑點來源：{dom_zh}（貢獻度 {round(max_ratio * 100, 1)}%）。"
                f"建議標記為深偽內容並進行深入調查。"
            )
            summary_en = (
                f"Overall risk score {pct}%. Assessed as HIGHLY SUSPICIOUS. "
                f"Primary concern: {dom_en} (contribution {round(max_ratio * 100, 1)}%). "
                f"Recommend flagging as deepfake content for further investigation."
            )

    return DiagnosticReport(
        risk_level=risk_level,
        overall_score=overall_score,
        summary_zh=summary_zh,
        summary_en=summary_en,
        dominant_modality=dominant,
    )
