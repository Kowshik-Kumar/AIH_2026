"""
ml/mentor_recommender.py
─────────────────────────
Mentor Recommendation Engine — Module 1.

Algorithm
---------
1. Each mentor record is serialised to a rich descriptive text string.
2. All mentor texts are embedded with Sentence-Transformers.
3. Embeddings are stored in a FAISS ``IndexFlatIP`` (inner product).
   Because vectors are L2-normalised, inner product == cosine similarity.
4. At query time the user profile is serialised + embedded, then FAISS
   returns the top-k nearest mentors.
5. The raw cosine scores are clipped to [0, 1] and returned.

Persistence
-----------
The FAISS index and mentor records are saved to disk after the first
build so that subsequent startups skip the embedding step entirely.

Delete ``models/embeddings/mentor_index.faiss`` and
``models/embeddings/mentor_records.json`` to force a full rebuild
(e.g. after updating ``data/mentors.json``).
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import faiss
import numpy as np

from app.core.config import settings
from ml.embeddings import embedder

logger = logging.getLogger(__name__)

# Type alias for a mentor record dict loaded from JSON
MentorRecord = dict[str, Any]


# ── Text Serialisers ───────────────────────────────────────────────────────────

def mentor_to_text(mentor: MentorRecord) -> str:
    """
    Convert a mentor dict into a rich flat text string for embedding.

    The string deliberately packs all semantically meaningful fields so
    the embedding captures expertise, style, and audience.
    """
    skills = ", ".join(mentor.get("skills", []))
    expertise = ", ".join(mentor.get("expertise_areas", []))
    langs = ", ".join(mentor.get("languages", []))
    return (
        f"Mentor: {mentor['name']}. "
        f"Title: {mentor['title']}. "
        f"Expertise: {expertise}. "
        f"Skills: {skills}. "
        f"Teaching style: {mentor['teaching_style']}. "
        f"Difficulty level: {mentor['difficulty_level']}. "
        f"Experience: {mentor['years_experience']} years. "
        f"Languages: {langs}. "
        f"Bio: {mentor['bio']}"
    )


def user_profile_to_text(
    user_goal: str,
    experience_level: str,
    current_skills: list[str],
    learning_style: str,
    preferred_difficulty: str,
) -> str:
    """
    Serialise a user profile to text for embedding.

    Mirrors the structure of ``mentor_to_text`` so both vectors live in
    the same semantic space.
    """
    skills = ", ".join(current_skills)
    return (
        f"Goal: {user_goal}. "
        f"Experience level: {experience_level}. "
        f"Current skills: {skills}. "
        f"Learning style: {learning_style}. "
        f"Preferred difficulty: {preferred_difficulty}."
    )


# ── Core Recommender ───────────────────────────────────────────────────────────

class MentorRecommender:
    """
    Wraps a FAISS index and provides mentor recommendation.

    Typical usage (handled automatically by the service layer)::

        recommender = MentorRecommender()
        recommender.initialise()          # builds or loads index
        results = recommender.recommend("I want to learn ML", top_k=4)
    """

    def __init__(self) -> None:
        self._index: faiss.IndexFlatIP | None = None
        self._mentors: list[MentorRecord] = []
        self._ready = False

    # ── Initialisation ────────────────────────────────────────────────────────

    def initialise(self) -> None:
        """
        Load an existing FAISS index from disk, or build one from scratch.

        Called once during application startup.
        """
        index_path = settings.mentor_index_path
        records_path = settings.mentor_records_path

        if index_path.exists() and records_path.exists():
            logger.info("Loading existing mentor FAISS index from %s", index_path)
            self._load_index(index_path, records_path)
        else:
            logger.info("No cached index found — building from %s", settings.mentors_data_path)
            self._build_index()

        self._ready = True
        logger.info(
            "MentorRecommender ready ✓ (%d mentors indexed)", len(self._mentors)
        )

    def _load_index(self, index_path: Path, records_path: Path) -> None:
        self._index = faiss.read_index(str(index_path))
        with records_path.open("r", encoding="utf-8") as fh:
            self._mentors = json.load(fh)

    def _build_index(self) -> None:
        """Embed all mentors and create a new FAISS IndexFlatIP."""
        data_path = settings.mentors_data_path
        if not data_path.exists():
            raise FileNotFoundError(
                f"Mentor data file not found: {data_path}. "
                "Ensure data/mentors.json exists relative to the working directory."
            )

        with data_path.open("r", encoding="utf-8") as fh:
            mentors: list[MentorRecord] = json.load(fh)

        if not mentors:
            raise ValueError("mentors.json is empty — cannot build index.")

        logger.info("Embedding %d mentor profiles …", len(mentors))
        texts = [mentor_to_text(m) for m in mentors]
        embeddings: np.ndarray = embedder.embed_batch(texts)  # (N, D) float32

        dim = embeddings.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(embeddings)  # type: ignore[arg-type]

        self._index = index
        self._mentors = mentors

        # Persist for future startups
        self._save_index()

    def _save_index(self) -> None:
        index_path = settings.mentor_index_path
        records_path = settings.mentor_records_path

        index_path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self._index, str(index_path))  # type: ignore[arg-type]

        with records_path.open("w", encoding="utf-8") as fh:
            json.dump(self._mentors, fh, ensure_ascii=False, indent=2)

        logger.info("FAISS index saved to %s", index_path)

    # ── Recommendation ────────────────────────────────────────────────────────

    def recommend(
        self,
        user_profile_text: str,
        top_k: int | None = None,
    ) -> list[tuple[MentorRecord, float]]:
        """
        Return the top-k best mentor matches for a user profile.

        Parameters
        ----------
        user_profile_text:
            Pre-serialised user profile string (from ``user_profile_to_text``).
        top_k:
            Number of results to return.  Defaults to ``settings.top_k_mentors``.

        Returns
        -------
        list[tuple[MentorRecord, float]]
            Ranked list of ``(mentor_dict, cosine_score)`` pairs,
            best match first.  Score is in [0, 1].

        Raises
        ------
        RuntimeError
            If ``initialise()`` has not been called.
        """
        if not self._ready or self._index is None:
            raise RuntimeError(
                "MentorRecommender.initialise() must be called before recommend()."
            )

        k = top_k if top_k is not None else settings.top_k_mentors
        # Don't request more than we have
        k = min(k, len(self._mentors))

        query_vec = embedder.embed_text(user_profile_text)
        query_vec = query_vec.reshape(1, -1)  # (1, D)

        scores, indices = self._index.search(query_vec, k)  # type: ignore[attr-defined]

        results: list[tuple[MentorRecord, float]] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:  # FAISS sentinel for "no result"
                continue
            clamped_score = float(np.clip(score, 0.0, 1.0))
            results.append((self._mentors[idx], clamped_score))

        return results
