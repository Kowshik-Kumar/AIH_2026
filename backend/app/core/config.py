"""
app/core/config.py
──────────────────
Centralised application settings.

All values are read from environment variables (or a .env file loaded
by python-dotenv).  Pydantic-settings handles type coercion and
validation at startup, so any missing required variable surfaces as a
clear error before the server accepts traffic.

Usage
-----
    from app.core.config import settings
    print(settings.embedding_model)
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings, sourced from environment / .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    app_env: str = Field(default="development", description="Runtime environment")
    log_level: str = Field(default="INFO", description="Python logging level")

    # ── ML / Embedding ───────────────────────────────────────────────────────
    embedding_model: str = Field(
        default="all-MiniLM-L6-v2",
        description="Sentence-Transformers model name",
    )
    top_k_mentors: int = Field(
        default=4,
        ge=1,
        le=20,
        description="Number of mentor candidates to return",
    )
    top_k_interests: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of top interest domains to return",
    )
    interest_score_threshold: float = Field(
        default=0.15,
        ge=0.0,
        le=1.0,
        description="Minimum cosine similarity score for an interest to be included",
    )

    # ── Data Paths ───────────────────────────────────────────────────────────
    mentors_data_path: Path = Field(default=Path("data/mentors.json"))
    skills_data_path: Path = Field(default=Path("data/skills.json"))
    learning_paths_data_path: Path = Field(default=Path("data/learning_paths.json"))
    resources_data_path: Path = Field(default=Path("data/resources.json"))
    interests_data_path: Path = Field(
        default=Path("data/interests.json"),
        description="Path to predefined interest domain definitions",
    )

    # ── FAISS Index Paths ────────────────────────────────────────────────────
    mentor_index_path: Path = Field(
        default=Path("models/embeddings/mentor_index.faiss")
    )
    mentor_records_path: Path = Field(
        default=Path("models/embeddings/mentor_records.json")
    )

    # ── ML Model Paths ───────────────────────────────────────────────────────
    skill_classifier_path: Path = Field(
        default=Path("models/trained/skill_classifier.joblib"),
        description="Path where the trained Scikit-learn skill classifier is saved",
    )

    # ── Supabase (future integration) ────────────────────────────────────────
    supabase_url: str = Field(default="", description="Supabase project URL")
    supabase_anon_key: str = Field(default="", description="Supabase anon key")

    # ── Google Gemini (future integration) ───────────────────────────────────
    gemini_api_key: str = Field(default="", description="Google Gemini API key")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()


# Module-level convenience alias
settings: Settings = get_settings()
