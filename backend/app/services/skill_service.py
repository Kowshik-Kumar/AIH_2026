"""
app/services/skill_service.py
──────────────────────────────
Business logic layer for skill classification.

Responsibilities
----------------
* Merge all user-supplied text fields into a single document.
* Delegate classification to the ML layer (SkillClassifier).
* Convert the ML NamedTuple result into a Pydantic response model.
* Provide a FastAPI-compatible dependency function ``get_skill_service``.

Separation of concerns
-----------------------
API route   → calls service.classify(request)
Service     → merges text, calls ML, returns Pydantic model
ML layer    → pure Scikit-learn, no Pydantic awareness
"""

from __future__ import annotations

import logging
from functools import lru_cache

from app.schemas.skill import SkillClassifyRequest, SkillClassifyResponse
from ml.skill_classifier import SkillClassifier

logger = logging.getLogger(__name__)


# ── Text Merger ───────────────────────────────────────────────────────────────

def _merge_inputs(request: SkillClassifyRequest) -> str:
    """
    Concatenate all supplied user texts into a single document.

    Sections are separated by newlines so TF-IDF sees them as continuous
    prose without artificial term boundaries.
    """
    parts: list[str] = []

    if request.resume_text:
        parts.append(request.resume_text.strip())

    if request.projects:
        parts.extend(p.strip() for p in request.projects if p.strip())

    if request.github_summary:
        parts.append(request.github_summary.strip())

    if request.conversation:
        parts.append(request.conversation.strip())

    return "\n".join(parts)


# ── Service Class ─────────────────────────────────────────────────────────────

class SkillService:
    """
    Stateless service that wraps the SkillClassifier ML module.

    A single instance is cached per process (see ``get_skill_service``).
    """

    def __init__(self, classifier: SkillClassifier) -> None:
        self._classifier = classifier

    def classify(self, request: SkillClassifyRequest) -> SkillClassifyResponse:
        """
        Classify the user's skill level from their supplied text artefacts.

        Parameters
        ----------
        request:
            Validated Pydantic request model.

        Returns
        -------
        SkillClassifyResponse
            Predicted skill level, confidence, per-class scores, key indicators.

        Raises
        ------
        RuntimeError
            If the classifier has not been initialised.
        ValueError
            If all supplied text fields are empty after stripping.
        """
        merged_text = _merge_inputs(request)

        logger.info(
            "Skill classification requested | input_length=%d chars",
            len(merged_text),
        )

        result = self._classifier.classify(text=merged_text)

        logger.info(
            "Skill classified as '%s' (confidence=%.4f)",
            result.skill_level,
            result.confidence,
        )

        return SkillClassifyResponse(
            skill_level=result.skill_level,  # type: ignore[arg-type]
            confidence=result.confidence,
            confidence_scores=result.confidence_scores,
            key_indicators=result.key_indicators,
        )


# ── Dependency Injection ──────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_classifier() -> SkillClassifier:
    """
    Return the singleton SkillClassifier instance.

    ``initialise()`` is called in ``app.main`` lifespan, so the model
    is warm before any request arrives.
    """
    return SkillClassifier()


def get_skill_service() -> SkillService:
    """
    FastAPI dependency that returns a SkillService instance.

    Usage in route::

        @router.post("/classify-skill")
        async def endpoint(
            request: SkillClassifyRequest,
            service: SkillService = Depends(get_skill_service),
        ):
            return service.classify(request)
    """
    return SkillService(classifier=_get_classifier())
