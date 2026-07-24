"""
ml/embeddings.py
─────────────────
Shared embedding pipeline for the MentorSphere ML layer.

Responsibilities
----------------
* Load the Sentence-Transformers model **once** (singleton pattern).
* Expose ``embed_text`` and ``embed_batch`` that return L2-normalised
  float32 NumPy arrays ready for FAISS ``IndexFlatIP`` (inner-product
  on unit vectors == cosine similarity).

Design notes
------------
* The model is loaded at import time inside ``_EmbeddingModel.__init__``
  so all ML modules share a single warm model without dependency on
  FastAPI's lifecycle.
* L2 normalisation is always applied so callers never need to worry
  about it themselves.
* Thread-safety: SentenceTransformer.encode() releases the GIL during
  inference, so concurrent async FastAPI handlers are safe.
"""

from __future__ import annotations

import logging
from typing import ClassVar

import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.config import settings

logger = logging.getLogger(__name__)


class _EmbeddingModel:
    """
    Internal singleton wrapper around SentenceTransformer.

    Do not instantiate directly — use the module-level ``embedder``
    instance exported below.
    """

    _instance: ClassVar[_EmbeddingModel | None] = None

    def __new__(cls) -> _EmbeddingModel:  # noqa: PYI034
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialised = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialised:  # type: ignore[has-type]
            return
        model_name = settings.embedding_model
        logger.info("Loading embedding model: %s", model_name)
        self._model = SentenceTransformer(model_name)
        self._initialised = True
        logger.info("Embedding model loaded ✓")

    # ── Public API ────────────────────────────────────────────────────────────

    def embed_text(self, text: str) -> np.ndarray:
        """
        Embed a single string and return a 1-D L2-normalised float32 array.

        Parameters
        ----------
        text:
            Arbitrary UTF-8 string (max ~512 tokens for MiniLM).

        Returns
        -------
        np.ndarray
            Shape ``(embedding_dim,)`` — float32, L2-normalised.
        """
        vec = self._model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
        return vec.astype(np.float32)

    def embed_batch(self, texts: list[str], batch_size: int = 32) -> np.ndarray:
        """
        Embed a list of strings in mini-batches.

        Parameters
        ----------
        texts:
            List of strings to embed.
        batch_size:
            Mini-batch size passed to ``SentenceTransformer.encode``.

        Returns
        -------
        np.ndarray
            Shape ``(len(texts), embedding_dim)`` — float32, L2-normalised.
        """
        if not texts:
            raise ValueError("texts must contain at least one element")

        vecs = self._model.encode(
            texts,
            batch_size=batch_size,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return vecs.astype(np.float32)

    @property
    def embedding_dim(self) -> int:
        """Dimensionality of the embedding vectors."""
        return self._model.get_sentence_embedding_dimension()  # type: ignore[return-value]


# Module-level singleton — imported by other ML modules
embedder = _EmbeddingModel()
