"""
app/api/v1/routes/recommend_mentor.py
───────────────────────────────────────
POST /api/v1/recommend-mentor

This route is intentionally thin:
  - Validate the request (Pydantic handles this automatically).
  - Delegate ALL business logic to MentorService.
  - Return the response model.
  - Handle exceptions and return appropriate HTTP errors.

No ML code, no direct data access, no string manipulation — ever.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.mentor import MentorRecommendRequest, MentorRecommendResponse
from app.services.mentor_service import MentorService, get_mentor_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Mentor Recommendation"])


@router.post(
    "/recommend-mentor",
    response_model=MentorRecommendResponse,
    status_code=status.HTTP_200_OK,
    summary="Recommend the best mentor for a user profile",
    description=(
        "Accepts a structured user profile (goal, experience, skills, learning style, "
        "difficulty preference) and returns the best matching mentor along with "
        "alternative recommendations. Powered by Sentence-Transformers + FAISS."
    ),
    responses={
        200: {"description": "Successful recommendation"},
        422: {"description": "Validation error — check request body"},
        500: {"description": "Internal ML engine error"},
        503: {"description": "Recommendation engine not ready"},
    },
)
async def recommend_mentor(
    request: MentorRecommendRequest,
    service: MentorService = Depends(get_mentor_service),
) -> MentorRecommendResponse:
    """
    Find the best mentor match for the given user profile.

    The recommendation engine uses semantic similarity (cosine distance
    over Sentence-Transformer embeddings stored in FAISS) to rank all
    mentors against the user's profile and return the top matches.
    """
    logger.debug("POST /recommend-mentor | payload=%s", request.model_dump())

    try:
        response = service.recommend(request)
    except RuntimeError as exc:
        logger.error("Recommendation engine not ready: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The recommendation engine is not yet initialised. Please retry in a moment.",
        ) from exc
    except ValueError as exc:
        logger.error("Recommendation failed with value error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected error during mentor recommendation")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again.",
        ) from exc

    return response
