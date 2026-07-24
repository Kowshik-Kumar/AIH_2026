"""
app/services/mentor_service.py
────────────────────────────────
Business logic layer for mentor recommendation.

Responsibilities
----------------
* Orchestrate the ML layer (MentorRecommender) without leaking ML
  implementation details into the API routes.
* Convert raw ML output (list of dicts + float scores) into typed
  Pydantic response models.
* Generate a human-readable recommendation reason string.
* Expose a FastAPI-compatible dependency function ``get_mentor_service``.

Separation of concerns
-----------------------
API routes → call service methods with Pydantic request objects.
Service    → calls ML layer, builds Pydantic response objects.
ML layer   → pure numerical computation, no Pydantic awareness.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any

from app.core.config import settings
from app.schemas.mentor import (
    MentorRecommendRequest,
    MentorRecommendResponse,
    MentorResult,
)
from ml.mentor_recommender import MentorRecommender, user_profile_to_text

logger = logging.getLogger(__name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_mentor_result(mentor: dict[str, Any]) -> MentorResult:
    """Map a raw mentor dict (from JSON) to a typed MentorResult schema."""
    return MentorResult(
        id=mentor["id"],
        name=mentor["name"],
        title=mentor["title"],
        expertise_areas=mentor.get("expertise_areas", []),
        skills=mentor.get("skills", []),
        teaching_style=mentor["teaching_style"],
        difficulty_level=mentor["difficulty_level"],
        years_experience=mentor["years_experience"],
        languages=mentor.get("languages", []),
        bio=mentor["bio"],
    )


def _build_reason(
    mentor: dict[str, Any],
    score: float,
    request: MentorRecommendRequest,
) -> str:
    """
    Generate a concise, human-readable explanation for the recommendation.

    This is a deterministic template-based approach (no LLM required at this
    stage).  Gemini will replace/augment this in a later sprint.
    """
    expertise = ", ".join(mentor.get("expertise_areas", [])[:2])
    teaching_style = mentor.get("teaching_style", "")
    difficulty = mentor.get("difficulty_level", "")
    score_pct = round(score * 100, 1)

    return (
        f"{mentor['name']} is a {score_pct}% match for your goal: "
        f'"{request.user_goal}". '
        f"They specialise in {expertise}, teach in a {teaching_style} style, "
        f"and primarily work with {difficulty}-level learners — aligning with "
        f"your {request.experience_level} background and {request.preferred_difficulty} "
        f"difficulty preference."
    )


# ── Service Class ─────────────────────────────────────────────────────────────

class MentorService:
    """
    Stateless service that wraps the MentorRecommender ML module.

    A single instance is cached per process (see ``get_mentor_service``).
    The recommender itself is injected so it can be replaced with a mock
    during testing.
    """

    def __init__(self, recommender: MentorRecommender) -> None:
        self._recommender = recommender

    def recommend(self, request: MentorRecommendRequest) -> MentorRecommendResponse:
        """
        Run the full recommendation pipeline for a user profile.

        Parameters
        ----------
        request:
            Validated Pydantic request model from the API layer.

        Returns
        -------
        MentorRecommendResponse
            Best mentor, score, reason, and alternative mentors.

        Raises
        ------
        RuntimeError
            If the FAISS index has not been initialised.
        ValueError
            If no mentors are indexed.
        """
        logger.info(
            "Recommendation requested | goal=%r | experience=%s | skills=%s",
            request.user_goal,
            request.experience_level,
            request.current_skills,
        )

        profile_text = user_profile_to_text(
            user_goal=request.user_goal,
            experience_level=request.experience_level,
            current_skills=request.current_skills,
            learning_style=request.learning_style,
            preferred_difficulty=request.preferred_difficulty,
        )

        results = self._recommender.recommend(
            user_profile_text=profile_text,
            top_k=settings.top_k_mentors,
        )

        if not results:
            raise ValueError("No mentor matches found — the index may be empty.")

        best_mentor_dict, best_score = results[0]
        best_mentor = _build_mentor_result(best_mentor_dict)
        reason = _build_reason(best_mentor_dict, best_score, request)

        alternatives = [
            _build_mentor_result(m_dict) for m_dict, _ in results[1:]
        ]

        logger.info(
            "Top match: %s (score=%.4f)", best_mentor.name, best_score
        )

        return MentorRecommendResponse(
            best_mentor=best_mentor,
            recommendation_score=round(best_score, 4),
            reason=reason,
            alternative_mentors=alternatives,
        )


# ── Dependency Injection ──────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_recommender() -> MentorRecommender:
    """
    Return the singleton MentorRecommender.

    ``initialise()`` is called in ``app.main`` lifespan, so by the time
    a request reaches here the index is already warm.
    """
    return MentorRecommender()


def get_mentor_service() -> MentorService:
    """
    FastAPI dependency that returns a MentorService instance.

    Usage in route::

        @router.post("/recommend-mentor")
        async def endpoint(
            request: MentorRecommendRequest,
            service: MentorService = Depends(get_mentor_service),
        ):
            return service.recommend(request)
    """
    return MentorService(recommender=_get_recommender())
