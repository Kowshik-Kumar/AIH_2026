"""
app/services/interest_service.py
──────────────────────────────────
Business logic layer for interest prediction.

Responsibilities
----------------
* Merge and clean user-supplied text fields (topics, conversations, projects).
* Delegate prediction to the ML layer (InterestPredictor).
* Convert ML NamedTuple results to Pydantic response models.
* Raise a clear error if no interests exceed the similarity threshold.
* Provide a FastAPI-compatible dependency function ``get_interest_service``.
"""

from __future__ import annotations

import logging
from functools import lru_cache

from app.core.config import settings
from app.schemas.interest import (
    InterestDomain,
    InterestPredictRequest,
    InterestPredictResponse,
)
from ml.interest_predictor import InterestPredictor, InterestResult

logger = logging.getLogger(__name__)


# ── Text Merger ───────────────────────────────────────────────────────────────

def _merge_inputs(request: InterestPredictRequest) -> str:
    """
    Concatenate all user-supplied texts into a single document for embedding.

    Topics are repeated slightly to up-weight explicitly stated interests
    over implicit mentions in prose.
    """
    parts: list[str] = []

    # Topics are explicit signals — include twice for higher weight
    if request.topics:
        clean = [t.strip() for t in request.topics if t.strip()]
        if clean:
            joined = " ".join(clean)
            parts.append(joined)
            parts.append(joined)  # intentional double-weight

    if request.conversations:
        parts.extend(c.strip() for c in request.conversations if c.strip())

    if request.projects:
        parts.extend(p.strip() for p in request.projects if p.strip())

    return "\n".join(parts)


# ── Service Class ─────────────────────────────────────────────────────────────

class InterestService:
    """
    Stateless service wrapping the InterestPredictor ML module.

    A single instance is cached per process (see ``get_interest_service``).
    """

    def __init__(self, predictor: InterestPredictor) -> None:
        self._predictor = predictor

    def predict(self, request: InterestPredictRequest) -> InterestPredictResponse:
        """
        Predict interest domains from the user's supplied context.

        Parameters
        ----------
        request:
            Validated Pydantic request model.

        Returns
        -------
        InterestPredictResponse
            Primary interest and ranked list of all matching domains.

        Raises
        ------
        RuntimeError
            If the predictor has not been initialised.
        ValueError
            If no domains exceed the similarity threshold.
        """
        merged_text = _merge_inputs(request)

        logger.info(
            "Interest prediction requested | input_length=%d chars | "
            "topics=%r convs=%d projects=%d",
            len(merged_text),
            request.topics,
            len(request.conversations or []),
            len(request.projects or []),
        )

        results: list[InterestResult] = self._predictor.predict(
            user_text=merged_text,
            top_k=settings.top_k_interests,
            threshold=settings.interest_score_threshold,
        )

        if not results:
            raise ValueError(
                "No interest domains reached the minimum similarity threshold. "
                "Please provide more descriptive input."
            )

        # Convert NamedTuples → Pydantic models
        interest_domains = [
            InterestDomain(
                id=r.id,
                name=r.name,
                description=r.description,
                keywords=r.keywords,
                score=r.score,
                rank=r.rank,
            )
            for r in results
        ]

        primary = interest_domains[0]

        logger.info(
            "Top interest: %s (score=%.4f) | %d domains above threshold",
            primary.name,
            primary.score,
            len(interest_domains),
        )

        # total_domains_evaluated comes from the predictor's domain count
        total = len(self._predictor._domains)  # noqa: SLF001

        return InterestPredictResponse(
            primary_interest=primary,
            interests=interest_domains,
            total_domains_evaluated=total,
        )


# ── Dependency Injection ──────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_predictor() -> InterestPredictor:
    """Return the singleton InterestPredictor instance."""
    return InterestPredictor()


def get_interest_service() -> InterestService:
    """
    FastAPI dependency that returns an InterestService instance.

    Usage in route::

        @router.post("/predict-interest")
        async def endpoint(
            request: InterestPredictRequest,
            service: InterestService = Depends(get_interest_service),
        ):
            return service.predict(request)
    """
    return InterestService(predictor=_get_predictor())
