"""
app/api/v1/routes/predict_interest.py
───────────────────────────────────────
POST /api/v1/predict-interest

Thin route — validates request, delegates to InterestService, maps exceptions.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.interest import InterestPredictRequest, InterestPredictResponse
from app.services.interest_service import InterestService, get_interest_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Interest Prediction"])


@router.post(
    "/predict-interest",
    response_model=InterestPredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict a user's primary learning interests",
    description=(
        "Accepts topics, conversation snippets, and project descriptions, then "
        "returns a ranked list of learning interest domains (e.g. Machine Learning, "
        "Web Development, DevOps) using semantic embedding similarity."
    ),
    responses={
        200: {"description": "Successful prediction"},
        422: {"description": "Validation error — at least one input field required"},
        500: {"description": "Internal predictor error or no interests above threshold"},
        503: {"description": "Predictor not initialised"},
    },
)
async def predict_interest(
    request: InterestPredictRequest,
    service: InterestService = Depends(get_interest_service),
) -> InterestPredictResponse:
    """
    Predict the user's learning interests from their supplied context.

    The engine embeds all provided text and computes cosine similarity
    against 20 predefined interest domain anchors, returning the
    top matches above a configurable threshold.
    """
    logger.debug(
        "POST /predict-interest | topics=%s | convs=%d | projects=%d",
        request.topics,
        len(request.conversations or []),
        len(request.projects or []),
    )

    try:
        response = service.predict(request)
    except RuntimeError as exc:
        logger.error("Interest predictor not ready: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The interest predictor is not yet initialised. Please retry in a moment.",
        ) from exc
    except ValueError as exc:
        logger.error("Interest prediction failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected error during interest prediction")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again.",
        ) from exc

    return response
