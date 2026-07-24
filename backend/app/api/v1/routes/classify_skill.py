"""
app/api/v1/routes/classify_skill.py
────────────────────────────────────
POST /api/v1/classify-skill

Thin route — validates the request, delegates to SkillService,
maps exceptions to HTTP errors.  Zero business logic here.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.skill import SkillClassifyRequest, SkillClassifyResponse
from app.services.skill_service import SkillService, get_skill_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Skill Classification"])


@router.post(
    "/classify-skill",
    response_model=SkillClassifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Classify a user's skill level from their text artefacts",
    description=(
        "Accepts one or more text artefacts (resume, projects, GitHub summary, "
        "conversation) and returns a predicted skill level "
        "(beginner / intermediate / advanced) along with per-class confidence "
        "scores and interpretable key indicator phrases."
    ),
    responses={
        200: {"description": "Successful classification"},
        422: {"description": "Validation error — at least one text field required"},
        500: {"description": "Internal classifier error"},
        503: {"description": "Classifier not ready"},
    },
)
async def classify_skill(
    request: SkillClassifyRequest,
    service: SkillService = Depends(get_skill_service),
) -> SkillClassifyResponse:
    """
    Classify the user's skill level from their supplied text artefacts.

    The classifier concatenates all supplied fields and runs them through
    a TF-IDF + LogisticRegression pipeline trained on labeled skill examples.
    """
    logger.debug("POST /classify-skill | fields_provided=%s", {
        "resume": bool(request.resume_text),
        "projects": bool(request.projects),
        "github": bool(request.github_summary),
        "conversation": bool(request.conversation),
    })

    try:
        response = service.classify(request)
    except RuntimeError as exc:
        logger.error("Skill classifier not ready: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The skill classifier is not yet initialised. Please retry in a moment.",
        ) from exc
    except ValueError as exc:
        logger.error("Skill classification failed with value error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected error during skill classification")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again.",
        ) from exc

    return response
