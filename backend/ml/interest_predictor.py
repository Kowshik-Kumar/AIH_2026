"""
ml/interest_predictor.py
─────────────────────────
Module 3 — Interest Prediction Engine.

Algorithm
---------
1. Load predefined interest domains from ``data/interests.json``.
   Each domain has an ``anchor_text`` — a rich, dense description of
   that interest area.

2. At initialisation, embed every domain's anchor_text using the shared
   Sentence-Transformer model (same singleton as Module 1).  The result
   is a ``(num_domains, embedding_dim)`` float32 matrix stored in memory.
   With only ~20 domains this is tiny (~20 × 384 × 4 bytes ≈ 30 KB).
   No FAISS index is needed; plain NumPy dot product is instant.

3. At query time:
   a. Concatenate the user's input texts (topics, conversations, projects).
   b. Embed the concatenated text → query vector (1 × D, L2-normalised).
   c. Compute dot product with domain matrix → scores vector (1 × num_domains).
      Because both query and domain anchors are L2-normalised,
      dot product == cosine similarity.
   d. Filter by threshold, sort descending, return top-k.

Design notes
------------
* Domain anchor embeddings are computed once at startup and cached as a
  plain NumPy array — no disk persistence needed given the tiny size.
* Adding a new interest domain requires only editing ``data/interests.json``
  and restarting (no retraining, no index rebuild).
* The predictor deliberately returns ALL domains above the threshold
  (up to top_k), not just one — the consumer decides how to present them.
"""

from __future__ import annotations

import json
import logging
from typing import Any, NamedTuple

import numpy as np

from app.core.config import settings
from ml.embeddings import embedder

logger = logging.getLogger(__name__)

# Type alias for a raw domain record dict
DomainRecord = dict[str, Any]


# ── Result Type ───────────────────────────────────────────────────────────────

class InterestResult(NamedTuple):
    """
    A single predicted interest domain.

    Attributes
    ----------
    id : str
        Unique domain identifier (e.g. ``"interest_ml_ai"``).
    name : str
        Human-readable domain name (e.g. ``"Machine Learning & AI"``).
    description : str
        Brief description of the domain.
    keywords : list[str]
        Representative keywords for the domain.
    score : float
        Cosine similarity score in [0, 1] — higher is more relevant.
    rank : int
        1-based rank in the returned list (1 = best match).
    """

    id: str
    name: str
    description: str
    keywords: list[str]
    score: float
    rank: int


# ── Interest Predictor ────────────────────────────────────────────────────────

class InterestPredictor:
    """
    Embedding-based interest prediction engine.

    Typical usage (managed by the service layer)::

        predictor = InterestPredictor()
        predictor.initialise()          # embed domain anchors
        results = predictor.predict("I love building ML models with PyTorch")
    """

    def __init__(self) -> None:
        self._domains: list[DomainRecord] = []
        self._domain_embeddings: np.ndarray | None = None  # (N, D) float32
        self._ready = False

    # ── Initialisation ────────────────────────────────────────────────────────

    def initialise(self) -> None:
        """
        Load domain definitions and pre-compute their embeddings.

        Called once during application startup.  Subsequent calls are no-ops.
        """
        if self._ready:
            return

        data_path = settings.interests_data_path
        if not data_path.exists():
            raise FileNotFoundError(
                f"Interest domain file not found: {data_path}. "
                "Ensure data/interests.json exists."
            )

        with data_path.open("r", encoding="utf-8") as fh:
            domains: list[DomainRecord] = json.load(fh)

        if not domains:
            raise ValueError("data/interests.json is empty — cannot initialise predictor.")

        logger.info("Embedding %d interest domains …", len(domains))
        anchor_texts = [d["anchor_text"] for d in domains]
        embeddings = embedder.embed_batch(anchor_texts)  # (N, D) float32, L2-normalised

        self._domains = domains
        self._domain_embeddings = embeddings
        self._ready = True

        logger.info("InterestPredictor ready ✓ (%d domains)", len(domains))

    # ── Prediction ────────────────────────────────────────────────────────────

    def predict(
        self,
        user_text: str,
        top_k: int | None = None,
        threshold: float | None = None,
    ) -> list[InterestResult]:
        """
        Predict the user's top learning interests from free-form text.

        Parameters
        ----------
        user_text:
            Concatenated user input (topics, conversations, projects).
        top_k:
            Maximum number of domains to return.  Defaults to ``settings.top_k_interests``.
        threshold:
            Minimum cosine similarity for a domain to be included.
            Defaults to ``settings.interest_score_threshold``.

        Returns
        -------
        list[InterestResult]
            Ranked list of interest domains, best match first.  May be empty
            if nothing exceeds the threshold.

        Raises
        ------
        RuntimeError
            If ``initialise()`` has not been called.
        ValueError
            If ``user_text`` is empty.
        """
        if not self._ready or self._domain_embeddings is None:
            raise RuntimeError(
                "InterestPredictor.initialise() must be called before predict()."
            )
        if not user_text or not user_text.strip():
            raise ValueError("user_text must be non-empty.")

        k = top_k if top_k is not None else settings.top_k_interests
        min_score = threshold if threshold is not None else settings.interest_score_threshold

        # Embed the user's text → 1-D L2-normalised vector
        query_vec = embedder.embed_text(user_text)  # (D,) float32

        # Cosine similarity = dot product of L2-normalised vectors
        # scores shape: (num_domains,)
        scores: np.ndarray = self._domain_embeddings @ query_vec

        # Build (domain, score) pairs and filter by threshold
        scored = [
            (self._domains[i], float(scores[i]))
            for i in range(len(self._domains))
            if float(scores[i]) >= min_score
        ]

        # Sort descending by score
        scored.sort(key=lambda x: x[1], reverse=True)

        # Take top_k and wrap in InterestResult
        results: list[InterestResult] = []
        for rank, (domain, score) in enumerate(scored[:k], start=1):
            results.append(
                InterestResult(
                    id=str(domain["id"]),
                    name=str(domain["name"]),
                    description=str(domain["description"]),
                    keywords=[str(kw) for kw in domain.get("keywords", [])],
                    score=round(score, 4),
                    rank=rank,
                )
            )

        return results
