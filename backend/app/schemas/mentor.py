"""
app/schemas/mentor.py
──────────────────────
Pydantic v2 request and response models for the Mentor Recommendation API.

All models use strict validation and descriptive field metadata so that
FastAPI's auto-generated OpenAPI docs are immediately useful.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ── Sub-models ──────────────────────────────────────────────────────────────────

class MentorResult(BaseModel):
    """A single mentor entry returned inside a recommendation response."""

    id: str = Field(..., description="Unique mentor identifier")
    name: str = Field(..., description="Full display name of the mentor")
    title: str = Field(..., description="Professional title / role")
    expertise_areas: list[str] = Field(
        ..., description="High-level domains the mentor specialises in"
    )
    skills: list[str] = Field(..., description="Specific skills the mentor teaches")
    teaching_style: str = Field(
        ..., description="How the mentor typically teaches (e.g. project-based)"
    )
    difficulty_level: Literal["beginner", "intermediate", "advanced"] = Field(
        ..., description="Audience difficulty level the mentor targets"
    )
    years_experience: int = Field(..., ge=0, description="Years of professional experience")
    languages: list[str] = Field(..., description="Languages the mentor teaches in")
    bio: str = Field(..., description="Short mentor biography")


# ── Request ─────────────────────────────────────────────────────────────────────

class MentorRecommendRequest(BaseModel):
    """
    User profile submitted to the mentor recommendation endpoint.

    All five fields are required; together they construct the semantic
    query vector used for FAISS nearest-neighbour search.
    """

    user_goal: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="What the user wants to achieve (e.g. 'Become a machine learning engineer')",
        examples=["I want to become a full-stack web developer"],
    )
    experience_level: Literal["beginner", "intermediate", "advanced"] = Field(
        ...,
        description="Current overall experience level of the user",
        examples=["intermediate"],
    )
    current_skills: list[str] = Field(
        ...,
        min_length=1,
        description="Technologies and topics the user already knows",
        examples=[["Python", "HTML", "CSS"]],
    )
    learning_style: Literal["visual", "reading", "hands-on", "auditory"] = Field(
        ...,
        description="How the user learns best",
        examples=["hands-on"],
    )
    preferred_difficulty: Literal["easy", "medium", "hard"] = Field(
        ...,
        description="Preferred challenge level for learning material",
        examples=["medium"],
    )


# ── Response ────────────────────────────────────────────────────────────────────

class MentorRecommendResponse(BaseModel):
    """
    Full recommendation payload returned to the frontend.

    ``best_mentor`` is the top-ranked match.
    ``alternative_mentors`` are the next best (up to top_k - 1).
    ``recommendation_score`` is cosine similarity in [0, 1].
    ``reason`` is a human-readable explanation.
    """

    best_mentor: MentorResult = Field(..., description="Top-ranked mentor match")
    recommendation_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Cosine similarity score of the best match",
    )
    reason: str = Field(
        ...,
        description="Human-readable explanation of why this mentor was recommended",
    )
    alternative_mentors: list[MentorResult] = Field(
        default_factory=list,
        description="Other strong mentor matches in ranked order",
    )
