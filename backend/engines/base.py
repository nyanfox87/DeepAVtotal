"""Abstract base class for all detection engines."""
from __future__ import annotations

from abc import ABC, abstractmethod

from models.schemas import EngineResult, Modality


class DetectionEngine(ABC):
    """Every detection engine must implement this interface.

    Adding a new engine is as simple as:
    1. Subclass ``DetectionEngine``
    2. Implement ``analyze``
    3. Register the engine in ``config.yaml``
    """

    name: str
    modality: Modality

    @abstractmethod
    async def analyze(self, file_path: str, file_hash: str) -> EngineResult:
        """Run detection and return a standardised ``EngineResult``."""
        ...
