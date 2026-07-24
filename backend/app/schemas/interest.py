"""
app/schemas/interest.py
────────────────────────
Pydantic v2 request and response models for the Interest Prediction API.

The request accepts topics, conversations, and projects separately so the
frontend can submit them from different UI inputs without pre-processing.
At least one field is required (enforced by a model-level validator).
"""

from __future__ import annotations

from pydantic import BaseModel, Field, model_validator


# ── Sub-models ──────────────────────────────────────────────────────────────────

class InterestDomain(BaseModel):
    """A single predicted interest domain with its relevance score."""

    id: str = Field(..., description="Unique interest domain identifier")
    name: str = Field(..., description="Human-readable domain name")
    description: str = Field(..., description="Brief description of the interest area")
    keywords: list[str] = Field(..., description="Representative keywords for this domain")
    score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Cosine similarity score (0–1, higher is more relevant)",
    )
    rank: int = Field(..., ge=1, description="1-based rank (1 = best match)")


# ── Request ─────────────────────────────────────────────────────────────────────

class InterestPredictRequest(BaseModel):
    """
    User-supplied context for interest prediction.

    At least one of the three fields must be provided.  All supplied
    texts are concatenated before embedding and scoring.
    """

    topics: list[str] | None = Field(
        default=None,
        description="Topics the user has mentioned or is curious about",
        examples=[["machine learning", "Python", "data pipelines"]],
    )
    conversations: list[str] | None = Field(
        default=None,
        description="Free-form conversation snippets from the user",
        examples=[["I really enjoy building APIs and thinking about system design"]],
    )
    projects: list[str] | None = Field(
        default=None,
        description="Descriptions of past or current projects",
        examples=[["Built a sentiment analysis model using BERT and deployed it to AWS"]],
    )

    @model_validator(mode="after")
    def at_least_one_field_provided(self) -> "InterestPredictRequest":
        """Ensure at least one non-empty field is supplied."""
        has_topics = bool(self.topics and any(t.strip() for t in self.topics))
        has_convs = bool(self.conversations and any(c.strip() for c in self.conversations))
        has_projects = bool(self.projects and any(p.strip() for p in self.projects))

        if not any([has_topics, has_convs, has_projects]):
            raise ValueError(
                "At least one of 'topics', 'conversations', or 'projects' must be provided."
            )
        return self


# ── Response ────────────────────────────────────────────────────────────────────

class InterestPredictResponse(BaseModel):
    """
    Interest prediction result returned to the frontend.

    ``primary_interest``  — the top-scored domain (always present).
    ``interests``         — all domains above the similarity threshold,
                           ranked, including the primary.
    ``total_domains_evaluated`` — total number of domains checked
                                  (useful for showing coverage).
    """

    primary_interest: InterestDomain = Field(
        ...,
        description="The highest-scoring predicted interest domain",
    )
    interests: list[InterestDomain] = Field(
        ...,
        description="All predicted interest domains above threshold, ranked best-first",
    )
    total_domains_evaluated: int = Field(
        ...,
        ge=0,
        description="Total number of interest domains that were evaluated",
    )
