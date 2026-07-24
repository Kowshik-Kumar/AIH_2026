"""
app/schemas/skill.py
─────────────────────
Pydantic v2 request and response models for the Skill Classification API.

At least one of the optional text fields must be provided — validation is
enforced by a model-level validator so the error message is clear.
"""

from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, Field, model_validator


# ── Request ─────────────────────────────────────────────────────────────────────

class SkillClassifyRequest(BaseModel):
    """
    User artefacts submitted for skill level classification.

    All four fields are optional individually, but **at least one** must
    be provided.  The classifier concatenates all supplied texts into a
    single document before scoring.
    """

    resume_text: str | None = Field(
        default=None,
        min_length=10,
        max_length=10_000,
        description="Raw resume or CV text",
        examples=["Five years of experience in Python and machine learning..."],
    )
    projects: list[str] | None = Field(
        default=None,
        description="List of project descriptions (one string per project)",
        examples=[["Built a real-time recommendation engine serving 100k users"]],
    )
    github_summary: str | None = Field(
        default=None,
        min_length=10,
        max_length=5_000,
        description="Summary of GitHub activity (repos, languages, contributions)",
        examples=["Top repositories: FastAPI backend, React dashboard; 500+ contributions"],
    )
    conversation: str | None = Field(
        default=None,
        min_length=10,
        max_length=5_000,
        description="Free-form conversation or self-description by the user",
        examples=["I've been working professionally with TypeScript and React for 3 years..."],
    )

    @model_validator(mode="after")
    def at_least_one_field_provided(self) -> "SkillClassifyRequest":
        """Ensure the caller supplies at least one non-empty input."""
        has_resume = bool(self.resume_text and self.resume_text.strip())
        has_projects = bool(self.projects and any(p.strip() for p in self.projects))
        has_github = bool(self.github_summary and self.github_summary.strip())
        has_conversation = bool(self.conversation and self.conversation.strip())

        if not any([has_resume, has_projects, has_github, has_conversation]):
            raise ValueError(
                "At least one of 'resume_text', 'projects', 'github_summary', "
                "or 'conversation' must be provided."
            )
        return self


# ── Response ────────────────────────────────────────────────────────────────────

class SkillClassifyResponse(BaseModel):
    """
    Skill classification result returned to the frontend.

    ``skill_level``       — the predicted expertise tier.
    ``confidence``        — probability of the predicted class in [0, 1].
    ``confidence_scores`` — per-class probabilities (always sums to ~1.0).
    ``key_indicators``    — top TF-IDF phrases that drove the prediction.
    """

    skill_level: Literal["beginner", "intermediate", "advanced"] = Field(
        ...,
        description="Predicted skill level",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probability of the predicted class",
    )
    confidence_scores: dict[str, float] = Field(
        ...,
        description="Per-class probabilities: {beginner, intermediate, advanced}",
    )
    key_indicators: list[str] = Field(
        ...,
        description="Top TF-IDF n-gram features that most influenced the prediction",
    )
