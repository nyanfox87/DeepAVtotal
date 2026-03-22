"""Media stream detection utility.

Determines whether an uploaded file contains video, audio, or both,
based on file extension and (optionally) binary header analysis.
"""
from __future__ import annotations

from enum import Enum
from pathlib import Path


class MediaType(str, Enum):
    VIDEO_AUDIO = "video_audio"   # Has both video & audio → all 3 modalities
    VIDEO_ONLY = "video_only"     # Has video but no audio → visual only
    AUDIO_ONLY = "audio_only"     # Has audio but no video → audio only
    UNKNOWN = "unknown"


# ── Extension-based classification ─────────────────────────────────────
AUDIO_EXTENSIONS = {
    ".wav", ".mp3", ".flac", ".ogg", ".aac", ".m4a",
    ".wma", ".opus", ".amr", ".aiff",
}

VIDEO_EXTENSIONS = {
    ".mp4", ".webm", ".avi", ".mov", ".mkv", ".flv",
    ".wmv", ".m4v", ".mpeg", ".mpg", ".3gp", ".ts",
}


def detect_media_type(file_path: str) -> MediaType:
    """Detect whether a file is audio-only, video-only, or video+audio.

    Uses file extension as the primary heuristic.
    For video files, we default to VIDEO_AUDIO since most videos have audio.
    To detect truly silent videos, ffprobe would be needed (future enhancement).
    """
    ext = Path(file_path).suffix.lower()

    if ext in AUDIO_EXTENSIONS:
        return MediaType.AUDIO_ONLY

    if ext in VIDEO_EXTENSIONS:
        # Default assumption: video files contain both streams.
        # A future enhancement could use ffprobe to check for audio track.
        return MediaType.VIDEO_AUDIO

    # Fallback: try to guess from MIME-like patterns
    return MediaType.UNKNOWN


def get_applicable_modalities(media_type: MediaType) -> list[str]:
    """Return which modalities should be executed for a given media type.

    Rules:
    - audio_only  → ["audio"]
    - video_only  → ["visual"]
    - video_audio → ["visual", "audio", "sync"]
    - unknown     → ["visual", "audio", "sync"]  (run all as fallback)
    """
    if media_type == MediaType.AUDIO_ONLY:
        return ["audio"]
    elif media_type == MediaType.VIDEO_ONLY:
        return ["visual"]
    else:
        return ["visual", "audio", "sync"]
