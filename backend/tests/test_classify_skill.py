"""
tests/test_classify_skill.py
──────────────────────────────
Tests for the Skill Classifier (Module 2).

Test categories
---------------
Unit tests
  - _merge_inputs: text concatenation helper
  - SkillClassifier.classify: core ML classification logic
  - ClassificationResult: structure and value constraints
  - at_least_one_field_provided: Pydantic model validator

Integration tests
  - POST /api/v1/classify-skill: full HTTP round-trip via TestClient

Notes
-----
* SkillClassifier is trained on the real data/skills.json dataset
  inside a tmp_path fixture so tests are isolated from production files.
* The FastAPI integration tests patch _get_classifier to inject the
  pre-trained test classifier, avoiding a re-train per test.
"""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def trained_classifier(tmp_path_factory):
    """
    Train a SkillClassifier on the real data/skills.json and return it.
    Scoped to module so training happens once for all unit tests.
    """
    from app.core.config import settings
    from ml.skill_classifier import SkillClassifier

    tmp_path = tmp_path_factory.mktemp("skill_clf")
    model_path = tmp_path / "skill_classifier.joblib"

    clf = SkillClassifier()

    with patch.object(settings, "skill_classifier_path", model_path):
        clf.initialise()

    return clf


# ---------------------------------------------------------------------------
# Unit tests — _merge_inputs
# ---------------------------------------------------------------------------

class TestMergeInputs:
    """Unit tests for the text merging helper in the service layer."""

    def test_resume_only(self):
        from app.schemas.skill import SkillClassifyRequest
        from app.services.skill_service import _merge_inputs

        req = SkillClassifyRequest(resume_text="Five years of Python experience.")
        merged = _merge_inputs(req)
        assert "Five years of Python experience." in merged

    def test_all_fields_merged(self):
        from app.schemas.skill import SkillClassifyRequest
        from app.services.skill_service import _merge_inputs

        req = SkillClassifyRequest(
            resume_text="Senior engineer.",
            projects=["Built a microservice", "Designed a data pipeline"],
            github_summary="500 contributions",
            conversation="I love distributed systems",
        )
        merged = _merge_inputs(req)
        assert "Senior engineer." in merged
        assert "Built a microservice" in merged
        assert "Designed a data pipeline" in merged
        assert "500 contributions" in merged
        assert "I love distributed systems" in merged

    def test_empty_project_strings_skipped(self):
        from app.schemas.skill import SkillClassifyRequest
        from app.services.skill_service import _merge_inputs

        req = SkillClassifyRequest(
            resume_text="Some resume text here.",
            projects=["   ", "Valid project description"],
        )
        merged = _merge_inputs(req)
        assert "Valid project description" in merged
        # Whitespace-only entries should not leave double newlines
        assert "\n\n" not in merged


# ---------------------------------------------------------------------------
# Unit tests — SkillClassifyRequest validator
# ---------------------------------------------------------------------------

class TestSkillClassifyRequestValidator:
    """Test the model-level validator enforcing at-least-one-field."""

    def test_no_fields_raises_validation_error(self):
        from pydantic import ValidationError
        from app.schemas.skill import SkillClassifyRequest

        with pytest.raises(ValidationError):
            SkillClassifyRequest()

    def test_resume_only_valid(self):
        from app.schemas.skill import SkillClassifyRequest

        req = SkillClassifyRequest(resume_text="I have three years of experience.")
        assert req.resume_text is not None

    def test_conversation_only_valid(self):
        from app.schemas.skill import SkillClassifyRequest

        req = SkillClassifyRequest(conversation="I work with Python and data science daily.")
        assert req.conversation is not None

    def test_whitespace_only_all_fields_fails(self):
        from pydantic import ValidationError
        from app.schemas.skill import SkillClassifyRequest

        with pytest.raises(ValidationError):
            SkillClassifyRequest(
                resume_text="   ",
                github_summary="  ",
                conversation="",
                projects=[],
            )


# ---------------------------------------------------------------------------
# Unit tests — SkillClassifier core logic
# ---------------------------------------------------------------------------

class TestSkillClassifier:
    """Unit tests for the ML classifier using the real trained model."""

    def test_not_ready_raises_runtime_error(self):
        from ml.skill_classifier import SkillClassifier

        clf = SkillClassifier()
        with pytest.raises(RuntimeError, match="initialise"):
            clf.classify("some text")

    def test_classify_returns_named_tuple(self, trained_classifier):
        from ml.skill_classifier import ClassificationResult

        result = trained_classifier.classify("I am just starting to learn Python.")
        assert isinstance(result, ClassificationResult)

    def test_skill_level_is_valid_class(self, trained_classifier):
        result = trained_classifier.classify("I have three years of React experience.")
        assert result.skill_level in {"beginner", "intermediate", "advanced"}

    def test_confidence_in_range(self, trained_classifier):
        result = trained_classifier.classify("I built a complex distributed system.")
        assert 0.0 <= result.confidence <= 1.0

    def test_confidence_scores_has_all_classes(self, trained_classifier):
        result = trained_classifier.classify("Learning Python basics from a tutorial.")
        assert set(result.confidence_scores.keys()) == {"beginner", "intermediate", "advanced"}

    def test_confidence_scores_sum_to_one(self, trained_classifier):
        result = trained_classifier.classify("I am a principal engineer with 10 years.")
        total = sum(result.confidence_scores.values())
        assert abs(total - 1.0) < 0.01  # allow small floating-point error

    def test_key_indicators_is_list(self, trained_classifier):
        result = trained_classifier.classify("Deep learning researcher with PhD.")
        assert isinstance(result.key_indicators, list)

    def test_beginner_text_classified_correctly(self, trained_classifier):
        """Clearly beginner text should not be classified as advanced."""
        result = trained_classifier.classify(
            "I just completed my first Python tutorial. "
            "I am a complete beginner and learning basic variables and loops."
        )
        assert result.skill_level in {"beginner", "intermediate"}  # not advanced

    def test_advanced_text_classified_correctly(self, trained_classifier):
        """Clearly senior text should not be classified as beginner."""
        result = trained_classifier.classify(
            "Principal machine learning engineer with ten years of experience. "
            "I have designed production ML systems serving billions of predictions. "
            "I led teams of fifteen engineers and published research at NeurIPS."
        )
        assert result.skill_level in {"intermediate", "advanced"}  # not beginner

    def test_empty_text_raises_value_error(self, trained_classifier):
        with pytest.raises(ValueError, match="non-empty"):
            trained_classifier.classify("   ")

    def test_custom_top_n_indicators(self, trained_classifier):
        result = trained_classifier.classify(
            "Expert in Kubernetes, Terraform, and AWS infrastructure.",
            top_n_indicators=3,
        )
        assert len(result.key_indicators) <= 3


# ---------------------------------------------------------------------------
# Integration tests — HTTP endpoint
# ---------------------------------------------------------------------------

BEGINNER_PAYLOAD = {
    "conversation": (
        "I am just starting to learn programming. "
        "I completed a Python basics tutorial and built a simple script. "
        "Still learning about variables, loops, and functions."
    )
}

ADVANCED_PAYLOAD = {
    "resume_text": (
        "Principal software engineer with twelve years of experience "
        "designing distributed systems for millions of users. "
        "Expert in Kafka, Kubernetes, system architecture, and leading engineering teams."
    ),
    "projects": [
        "Designed multi-region Kubernetes platform processing 10TB daily",
        "Led migration from monolith to microservices for a unicorn startup",
    ],
}

FULL_PAYLOAD = {
    "resume_text": "Three years of Python and machine learning engineering experience.",
    "projects": ["Built a sentiment analysis API using BERT fine-tuning"],
    "github_summary": "300 contributions, top repos: FastAPI service, NLP pipeline",
    "conversation": "I work with scikit-learn and HuggingFace Transformers daily.",
}


@pytest.fixture(scope="module")
def client_with_skill_service(trained_classifier, tmp_path_factory):
    """TestClient with the real trained classifier injected via patch."""
    from app.main import create_app

    with patch("app.services.skill_service._get_classifier", return_value=trained_classifier):
        with patch("app.services.mentor_service._get_recommender") as mock_rec:
            # Also mock the mentor recommender so lifespan doesn't build FAISS
            mock_rec.return_value.initialise.return_value = None
            mock_rec.return_value.recommend.return_value = []
            test_app = create_app()
            with TestClient(test_app, raise_server_exceptions=True) as c:
                yield c


class TestClassifySkillEndpoint:
    """Integration tests for POST /api/v1/classify-skill."""

    def test_returns_200_for_valid_payload(self, client_with_skill_service):
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill", json=BEGINNER_PAYLOAD
        )
        assert resp.status_code == 200

    def test_response_schema_complete(self, client_with_skill_service):
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill", json=BEGINNER_PAYLOAD
        )
        body = resp.json()
        assert "skill_level" in body
        assert "confidence" in body
        assert "confidence_scores" in body
        assert "key_indicators" in body

    def test_skill_level_is_valid_enum(self, client_with_skill_service):
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill", json=FULL_PAYLOAD
        )
        assert resp.json()["skill_level"] in {"beginner", "intermediate", "advanced"}

    def test_confidence_in_range(self, client_with_skill_service):
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill", json=FULL_PAYLOAD
        )
        score = resp.json()["confidence"]
        assert isinstance(score, float)
        assert 0.0 <= score <= 1.0

    def test_confidence_scores_all_three_classes(self, client_with_skill_service):
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill", json=FULL_PAYLOAD
        )
        scores = resp.json()["confidence_scores"]
        assert set(scores.keys()) == {"beginner", "intermediate", "advanced"}

    def test_key_indicators_is_list(self, client_with_skill_service):
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill", json=FULL_PAYLOAD
        )
        assert isinstance(resp.json()["key_indicators"], list)

    def test_no_fields_returns_422(self, client_with_skill_service):
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill", json={}
        )
        assert resp.status_code == 422

    def test_whitespace_only_fields_returns_422(self, client_with_skill_service):
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill",
            json={"resume_text": "   ", "conversation": ""},
        )
        assert resp.status_code == 422

    def test_resume_only_valid(self, client_with_skill_service):
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill",
            json={"resume_text": "Junior developer learning JavaScript and React."},
        )
        assert resp.status_code == 200

    def test_projects_only_valid(self, client_with_skill_service):
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill",
            json={"projects": ["Built a REST API using FastAPI and PostgreSQL."]},
        )
        assert resp.status_code == 200

    def test_advanced_payload_not_beginner(self, client_with_skill_service):
        """A clearly senior profile must not be classified as beginner."""
        resp = client_with_skill_service.post(
            "/api/v1/classify-skill", json=ADVANCED_PAYLOAD
        )
        assert resp.json()["skill_level"] != "beginner"
