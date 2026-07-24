"""
ml/skill_classifier.py
───────────────────────
Module 2 — Skill Classifier.

Algorithm
---------
1. Training data is loaded from ``data/skills.json`` — a list of
   ``{"label": "beginner|intermediate|advanced", "text": "..."}`` records.
2. A Scikit-learn Pipeline is built:
       TF-IDF vectorizer  (unigrams + bigrams, top 8 000 features)
       →  LogisticRegression  (multinomial, L2 regularisation)
3. The pipeline is trained once and persisted to
   ``models/trained/skill_classifier.joblib`` so subsequent starts
   skip retraining.
4. At inference time, the caller passes free-form text (resume,
   GitHub summary, project descriptions, conversation snippets).
   All supplied texts are concatenated into a single document and
   classified.
5. The predicted class, per-class probabilities, and the top N
   TF-IDF features that most influenced the prediction are returned.

Design notes
------------
* All training data is bundled with the repository in ``data/skills.json``
  so the service can bootstrap without an external database.
* ``explain()`` uses the vectorizer's feature log-probabilities and the
  classifier's coefficient matrix to surface interpretable key indicators
  — no black-box explanations.
* Thread-safety: Scikit-learn predict() is stateless and thread-safe
  once the pipeline is fitted.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import NamedTuple

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from app.core.config import settings

logger = logging.getLogger(__name__)

# Ordered class labels — must stay consistent with training data
CLASSES = ["beginner", "intermediate", "advanced"]


# ── Result Type ───────────────────────────────────────────────────────────────

class ClassificationResult(NamedTuple):
    """
    Typed result from a single classification call.

    Attributes
    ----------
    skill_level : str
        Predicted class — one of "beginner", "intermediate", "advanced".
    confidence : float
        Probability of the predicted class, in [0, 1].
    confidence_scores : dict[str, float]
        Per-class probabilities summing to 1.0.
    key_indicators : list[str]
        Top TF-IDF n-gram features that most support the predicted class.
    """

    skill_level: str
    confidence: float
    confidence_scores: dict[str, float]
    key_indicators: list[str]


# ── Skill Classifier ──────────────────────────────────────────────────────────

class SkillClassifier:
    """
    Scikit-learn skill level classifier.

    Typical usage (handled by the service layer)::

        classifier = SkillClassifier()
        classifier.initialise()          # train or load from disk
        result = classifier.classify(text="I have five years of React...")
    """

    def __init__(self) -> None:
        self._pipeline: Pipeline | None = None
        self._ready = False

    # ── Initialisation ────────────────────────────────────────────────────────

    def initialise(self) -> None:
        """
        Load a saved pipeline from disk, or train a new one.

        Called once during application startup via the FastAPI lifespan hook.
        """
        model_path = settings.skill_classifier_path

        if model_path.exists():
            logger.info("Loading saved skill classifier from %s", model_path)
            self._pipeline = joblib.load(model_path)
            self._ready = True
            logger.info("SkillClassifier loaded from disk ✓")
        else:
            logger.info("No saved classifier found — training from %s", settings.skills_data_path)
            self._train()

    def _train(self) -> None:
        """Train the TF-IDF + LogisticRegression pipeline on ``data/skills.json``."""
        data_path = settings.skills_data_path
        if not data_path.exists():
            raise FileNotFoundError(
                f"Training data not found: {data_path}. "
                "Ensure data/skills.json exists."
            )

        with data_path.open("r", encoding="utf-8") as fh:
            raw: list[dict] = json.load(fh)

        if len(raw) < 6:
            raise ValueError(
                f"Training data too small ({len(raw)} samples). "
                "Add more labeled examples to data/skills.json."
            )

        texts = [item["text"] for item in raw]
        labels = [item["label"] for item in raw]

        logger.info(
            "Training SkillClassifier on %d samples "
            "(beginner=%d, intermediate=%d, advanced=%d)",
            len(texts),
            labels.count("beginner"),
            labels.count("intermediate"),
            labels.count("advanced"),
        )

        pipeline = Pipeline(
            steps=[
                (
                    "tfidf",
                    TfidfVectorizer(
                        ngram_range=(1, 2),
                        max_features=8_000,
                        sublinear_tf=True,       # log(1+tf) dampens high-freq terms
                        min_df=1,
                        strip_accents="unicode",
                        analyzer="word",
                        token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z0-9+#.]*\b",
                    ),
                ),
                (
                    "clf",
                    LogisticRegression(
                        solver="lbfgs",
                        C=1.0,
                        max_iter=1_000,
                        class_weight="balanced",
                        random_state=42,
                    ),
                ),
            ]
        )
        pipeline.fit(texts, labels)
        self._pipeline = pipeline
        self._ready = True

        # Persist for future startups
        self._save(pipeline)

        logger.info("SkillClassifier trained and saved ✓")

    def _save(self, pipeline: Pipeline) -> None:
        model_path = settings.skill_classifier_path
        model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipeline, model_path)
        logger.info("Saved skill classifier to %s", model_path)

    # ── Inference ─────────────────────────────────────────────────────────────

    def classify(self, text: str, top_n_indicators: int = 5) -> ClassificationResult:
        """
        Classify a free-form text into a skill level.

        Parameters
        ----------
        text:
            Concatenated user input (resume + projects + GitHub + conversation).
        top_n_indicators:
            Number of TF-IDF key phrases to return as explanation.

        Returns
        -------
        ClassificationResult
            Predicted class, confidence, per-class scores, key indicators.

        Raises
        ------
        RuntimeError
            If ``initialise()`` has not been called.
        ValueError
            If ``text`` is empty.
        """
        if not self._ready or self._pipeline is None:
            raise RuntimeError(
                "SkillClassifier.initialise() must be called before classify()."
            )
        if not text or not text.strip():
            raise ValueError("Input text must be non-empty.")

        # Predict probabilities
        proba: np.ndarray = self._pipeline.predict_proba([text])[0]
        classes: list[str] = [str(c) for c in self._pipeline.classes_]  # cast numpy.str_ → str

        # Map class → probability
        scores = {cls: float(round(p, 4)) for cls, p in zip(classes, proba)}
        predicted_class = str(classes[int(np.argmax(proba))])  # ensure native str
        confidence = float(round(max(proba), 4))

        # Extract key indicators for the predicted class
        indicators = self._extract_indicators(text, predicted_class, top_n=top_n_indicators)

        return ClassificationResult(
            skill_level=predicted_class,
            confidence=confidence,
            confidence_scores=scores,
            key_indicators=indicators,
        )

    def _extract_indicators(
        self,
        text: str,
        predicted_class: str,
        top_n: int = 5,
    ) -> list[str]:
        """
        Return the top n TF-IDF features from the input text that most
        strongly support the predicted class.

        Method
        ------
        1. Convert the sparse TF-IDF vector to a dense 1-D array
           (shape: n_features) — avoids NumPy ambiguous-truth-value errors
           from sparse matrix fancy indexing.
        2. Compute a combined score: tfidf_weight × classifier_coefficient.
        3. Zero out features that don't appear in the input text (tfidf == 0).
        4. Return feature names for the top_n positive-scoring positions.
        """
        if self._pipeline is None:
            return []

        vectorizer: TfidfVectorizer = self._pipeline.named_steps["tfidf"]
        clf: LogisticRegression = self._pipeline.named_steps["clf"]

        # Convert sparse (1, n_features) to dense 1-D float array
        tfidf_vec = vectorizer.transform([text])
        tfidf_dense: np.ndarray = np.asarray(tfidf_vec.todense()).flatten()

        feature_names: np.ndarray = np.array(vectorizer.get_feature_names_out())
        classes: list[str] = list(clf.classes_)

        if predicted_class not in classes:
            return []

        class_idx: int = classes.index(predicted_class)
        coef: np.ndarray = clf.coef_[class_idx]  # shape (n_features,)

        # Score = TF-IDF weight × class coefficient (only non-zero TF-IDF features matter)
        combined: np.ndarray = tfidf_dense * coef

        # Mask out features absent from the input text
        present_mask: np.ndarray = tfidf_dense > 0.0
        combined_masked: np.ndarray = np.where(present_mask, combined, 0.0)

        if not combined_masked.any():
            return []

        # Sort by descending combined score and pick top_n positive entries
        sorted_idx: np.ndarray = np.argsort(combined_masked)[::-1]
        top_idx = [
            int(i) for i in sorted_idx
            if float(combined_masked[i]) > 0.0
        ][:top_n]

        return [str(feature_names[i]) for i in top_idx]

