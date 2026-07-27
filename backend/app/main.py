"""
app/main.py
────────────
FastAPI application factory and lifespan manager.

Startup sequence
----------------
1. Configure logging.
2. Load the FAISS mentor index (build if not cached).
3. Register API routers.
4. Register global exception handlers.

Shutdown sequence
-----------------
No teardown required (FAISS in-memory index is discarded with the process).

Run locally
-----------
    cd backend
    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import setup_logging

# ── Bootstrap logging before anything else ───────────────────────────────────
setup_logging()
logger = logging.getLogger(__name__)


# ── Lifespan: startup / shutdown ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Build or load the FAISS mentor index exactly once at startup.

    Using FastAPI's lifespan context manager (preferred over the
    deprecated ``on_event`` hooks) ensures the index is ready before
    the first request is served.
    """
    # Import here to avoid circular imports at module level
    from app.services.mentor_service import _get_recommender  # noqa: PLC0415
    from app.services.skill_service import _get_classifier  # noqa: PLC0415
    from app.services.interest_service import _get_predictor  # noqa: PLC0415

    logger.info("MentorSphere backend starting up …")

    # Module 1 — Mentor FAISS index
    recommender = _get_recommender()
    recommender.initialise()

    # Module 2 — Skill Classifier
    classifier = _get_classifier()
    classifier.initialise()

    # Module 3 — Interest Predictor
    predictor = _get_predictor()
    predictor.initialise()

    logger.info("Startup complete ✓")

    yield  # Server is running — handle requests

    logger.info("MentorSphere backend shutting down …")


# ── Application factory ───────────────────────────────────────────────────────

def create_app() -> FastAPI:
    """Construct and configure the FastAPI application."""
    app = FastAPI(
        title="MentorSphere AI Personalization Engine",
        description=(
            "Production-ready ML backend for the MentorSphere platform. "
            "Provides intelligent mentor matching, skill classification, "
            "interest prediction, personalised learning paths, and resource ranking."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Restrict in production — update ALLOWED_ORIGINS in .env
    allowed_origins = (
        ["http://localhost:3000", "http://127.0.0.1:3000"]
        if settings.app_env == "development"
        else []
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    from app.api.v1.routes.recommend_mentor import router as mentor_router  # noqa: PLC0415
    from app.api.v1.routes.classify_skill import router as skill_router  # noqa: PLC0415
    from app.api.v1.routes.predict_interest import router as interest_router  # noqa: PLC0415
    from app.api.v1.routes.parse_resume import router as resume_router  # noqa: PLC0415
    from app.api.v1.routes.chat import router as chat_router  # noqa: PLC0415

    app.include_router(mentor_router, prefix="/api/v1")
    app.include_router(skill_router, prefix="/api/v1")
    app.include_router(interest_router, prefix="/api/v1")
    app.include_router(resume_router, prefix="/api/v1")
    app.include_router(chat_router, prefix="/api/v1")

    # ── Global exception handlers ─────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception on %s %s", request.method, request.url)
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred."},
        )

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["Health"], summary="Health check")
    async def health_check() -> dict[str, str]:
        """Returns service health status and version."""
        return {
            "status": "ok",
            "version": "1.0.0",
            "environment": settings.app_env,
        }

    return app


# Module-level app instance (used by Uvicorn)
app: FastAPI = create_app()
