"""
tests/test_recommend_mentor.py
────────────────────────────────
Tests for the Mentor Recommendation Engine (Module 1).

Test categories
---------------
Unit tests
  - mentor_to_text: text serialiser produces expected output
  - user_profile_to_text: user serialiser produces expected output
  - MentorRecommender.recommend: returns correct structure with mock data

Integration tests
  - POST /api/v1/recommend-mentor: full HTTP round-trip via TestClient

Notes
-----
* The MentorRecommender is instantiated with a tiny in-memory dataset
  to avoid requiring real FAISS files or real embeddings on disk.
* We patch ``app.services.mentor_service._get_recommender`` so the
  FastAPI lifespan doesn't attempt to build/load a real index.
"""

from __future__ import annotations

import json
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pytest
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Unit tests — text serialisers
# ---------------------------------------------------------------------------

class TestTextSerialisers:
    """Tests for the profile → text conversion helpers."""

    def test_mentor_to_text_contains_name(self):
        """mentor_to_text must include the mentor's name."""
        from ml.mentor_recommender import mentor_to_text

        mentor = {
            "id": "m1",
            "name": "Alice Smith",
            "title": "ML Engineer",
            "expertise_areas": ["Machine Learning"],
            "skills": ["Python", "TensorFlow"],
            "teaching_style": "hands-on",
            "difficulty_level": "intermediate",
            "years_experience": 5,
            "languages": ["English"],
            "bio": "Loves teaching ML.",
        }
        text = mentor_to_text(mentor)
        assert "Alice Smith" in text

    def test_mentor_to_text_contains_skills(self):
        """mentor_to_text must include skills in the output."""
        from ml.mentor_recommender import mentor_to_text

        mentor = {
            "id": "m2",
            "name": "Bob Jones",
            "title": "Backend Dev",
            "expertise_areas": ["Backend Engineering"],
            "skills": ["Go", "PostgreSQL"],
            "teaching_style": "project-based",
            "difficulty_level": "advanced",
            "years_experience": 8,
            "languages": ["English"],
            "bio": "Expert in Go.",
        }
        text = mentor_to_text(mentor)
        assert "Go" in text
        assert "PostgreSQL" in text

    def test_user_profile_to_text_contains_goal(self):
        """user_profile_to_text must embed the user's goal."""
        from ml.mentor_recommender import user_profile_to_text

        text = user_profile_to_text(
            user_goal="Become a data scientist",
            experience_level="beginner",
            current_skills=["Excel", "SQL"],
            learning_style="visual",
            preferred_difficulty="easy",
        )
        assert "Become a data scientist" in text
        assert "beginner" in text
        assert "Excel" in text

    def test_user_profile_to_text_multiple_skills(self):
        """Multiple current skills must all appear in the output string."""
        from ml.mentor_recommender import user_profile_to_text

        skills = ["Python", "NumPy", "Pandas"]
        text = user_profile_to_text(
            user_goal="Learn deep learning",
            experience_level="intermediate",
            current_skills=skills,
            learning_style="hands-on",
            preferred_difficulty="medium",
        )
        for skill in skills:
            assert skill in text


# ---------------------------------------------------------------------------
# Unit tests — MentorRecommender with mock data
# ---------------------------------------------------------------------------

MOCK_MENTORS = [
    {
        "id": "mock_001",
        "name": "Dr. ML Expert",
        "title": "Machine Learning Engineer",
        "expertise_areas": ["Machine Learning", "Deep Learning"],
        "skills": ["Python", "TensorFlow", "PyTorch"],
        "teaching_style": "hands-on project-based",
        "difficulty_level": "advanced",
        "years_experience": 10,
        "languages": ["English"],
        "bio": "Expert in ML and deep learning.",
    },
    {
        "id": "mock_002",
        "name": "Web Dev Pro",
        "title": "Full-Stack Developer",
        "expertise_areas": ["Web Development"],
        "skills": ["JavaScript", "React", "Node.js"],
        "teaching_style": "visual code walkthroughs",
        "difficulty_level": "intermediate",
        "years_experience": 6,
        "languages": ["English"],
        "bio": "Builds web apps from scratch.",
    },
    {
        "id": "mock_003",
        "name": "Data Scientist",
        "title": "Data Science Lead",
        "expertise_areas": ["Data Science", "Statistics"],
        "skills": ["Python", "R", "SQL"],
        "teaching_style": "structured reading-based",
        "difficulty_level": "intermediate",
        "years_experience": 7,
        "languages": ["English"],
        "bio": "Expert in data analysis and modeling.",
    },
    {
        "id": "mock_004",
        "name": "DevOps Engineer",
        "title": "Platform Engineer",
        "expertise_areas": ["DevOps", "Cloud"],
        "skills": ["Kubernetes", "Terraform", "AWS"],
        "teaching_style": "hands-on lab-based",
        "difficulty_level": "advanced",
        "years_experience": 9,
        "languages": ["English"],
        "bio": "Cloud infrastructure specialist.",
    },
]


class TestMentorRecommender:
    """Unit tests for MentorRecommender using a small in-memory dataset."""

    @pytest.fixture
    def recommender_with_mock_data(self, tmp_path):
        """
        Build a MentorRecommender with mock data written to a temp directory.
        The FAISS index is built and saved to tmp_path.
        """
        from app.core.config import settings
        from ml.mentor_recommender import MentorRecommender

        # Write mock mentor data to a temp JSON file
        data_file = tmp_path / "mentors.json"
        data_file.write_text(json.dumps(MOCK_MENTORS), encoding="utf-8")

        # Point settings to temp paths
        with (
            patch.object(settings, "mentors_data_path", data_file),
            patch.object(settings, "mentor_index_path", tmp_path / "mentor_index.faiss"),
            patch.object(settings, "mentor_records_path", tmp_path / "mentor_records.json"),
            patch.object(settings, "top_k_mentors", 3),
        ):
            rec = MentorRecommender()
            rec.initialise()
            yield rec

    def test_recommend_returns_list(self, recommender_with_mock_data):
        """recommend() must return a non-empty list of (dict, float) tuples."""
        results = recommender_with_mock_data.recommend(
            "I want to learn machine learning with Python"
        )
        assert isinstance(results, list)
        assert len(results) > 0

    def test_recommend_tuple_structure(self, recommender_with_mock_data):
        """Each result must be a (dict, float) tuple with valid score range."""
        results = recommender_with_mock_data.recommend(
            "I want to learn machine learning with Python", top_k=2
        )
        for mentor_dict, score in results:
            assert isinstance(mentor_dict, dict)
            assert isinstance(score, float)
            assert 0.0 <= score <= 1.0

    def test_recommend_respects_top_k(self, recommender_with_mock_data):
        """recommend() must return at most top_k results."""
        results = recommender_with_mock_data.recommend(
            "I want to build web applications", top_k=2
        )
        assert len(results) <= 2

    def test_recommend_result_has_required_fields(self, recommender_with_mock_data):
        """Each mentor dict in results must have the required JSON fields."""
        results = recommender_with_mock_data.recommend("Learn cloud infrastructure")
        required_fields = {"id", "name", "title", "skills", "teaching_style"}
        for mentor_dict, _ in results:
            assert required_fields.issubset(mentor_dict.keys())

    def test_recommend_ml_query_returns_ml_mentor_first(self, recommender_with_mock_data):
        """
        A clearly ML-focused query should rank the ML mentor highest.
        This is a semantic sanity check — not guaranteed to pass with every model,
        but all-MiniLM-L6-v2 reliably scores ML content highest for ML queries.
        """
        results = recommender_with_mock_data.recommend(
            "Deep learning PyTorch neural networks machine learning research", top_k=4
        )
        top_mentor = results[0][0]
        assert "Machine Learning" in top_mentor.get("expertise_areas", [])

    def test_recommender_not_ready_raises(self):
        """Calling recommend() before initialise() must raise RuntimeError."""
        from ml.mentor_recommender import MentorRecommender

        rec = MentorRecommender()
        # Force _ready = False (default)
        with pytest.raises(RuntimeError, match="initialise"):
            rec.recommend("any query")


# ---------------------------------------------------------------------------
# Integration tests — HTTP round-trip via FastAPI TestClient
# ---------------------------------------------------------------------------

VALID_PAYLOAD = {
    "user_goal": "I want to become a machine learning engineer",
    "experience_level": "intermediate",
    "current_skills": ["Python", "NumPy", "Pandas"],
    "learning_style": "hands-on",
    "preferred_difficulty": "medium",
}


@pytest.fixture(scope="module")
def client_with_mock_recommender(tmp_path_factory):
    """
    Create a TestClient with the MentorRecommender patched to use mock data.
    Scope is 'module' to avoid re-building the index on every test.
    """
    from app.main import create_app
    from ml.mentor_recommender import MentorRecommender

    tmp_path = tmp_path_factory.mktemp("integration")
    data_file = tmp_path / "mentors.json"
    data_file.write_text(json.dumps(MOCK_MENTORS), encoding="utf-8")

    from app.core.config import settings

    mock_rec = MentorRecommender()

    def _init_mock():
        with (
            patch.object(settings, "mentors_data_path", data_file),
            patch.object(settings, "mentor_index_path", tmp_path / "idx.faiss"),
            patch.object(settings, "mentor_records_path", tmp_path / "rec.json"),
        ):
            mock_rec.initialise()

    _init_mock()

    with patch("app.services.mentor_service._get_recommender", return_value=mock_rec):
        # Patch lifespan too so it doesn't try to load a real index
        with patch("app.main._get_recommender", return_value=mock_rec, create=True):
            test_app = create_app()
            # Override lifespan recommender call
            with TestClient(test_app, raise_server_exceptions=True) as c:
                yield c


class TestRecommendMentorEndpoint:
    """Integration tests for POST /api/v1/recommend-mentor."""

    def test_health_check_ok(self, client_with_mock_recommender):
        """GET /health must return 200 with status=ok."""
        resp = client_with_mock_recommender.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_recommend_returns_200(self, client_with_mock_recommender):
        """Valid payload must return HTTP 200."""
        resp = client_with_mock_recommender.post(
            "/api/v1/recommend-mentor", json=VALID_PAYLOAD
        )
        assert resp.status_code == 200

    def test_recommend_response_schema(self, client_with_mock_recommender):
        """Response must include all required top-level fields."""
        resp = client_with_mock_recommender.post(
            "/api/v1/recommend-mentor", json=VALID_PAYLOAD
        )
        body = resp.json()
        assert "best_mentor" in body
        assert "recommendation_score" in body
        assert "reason" in body
        assert "alternative_mentors" in body

    def test_recommend_score_in_range(self, client_with_mock_recommender):
        """recommendation_score must be a float between 0 and 1."""
        resp = client_with_mock_recommender.post(
            "/api/v1/recommend-mentor", json=VALID_PAYLOAD
        )
        score = resp.json()["recommendation_score"]
        assert isinstance(score, float)
        assert 0.0 <= score <= 1.0

    def test_recommend_best_mentor_fields(self, client_with_mock_recommender):
        """best_mentor must contain all MentorResult fields."""
        resp = client_with_mock_recommender.post(
            "/api/v1/recommend-mentor", json=VALID_PAYLOAD
        )
        mentor = resp.json()["best_mentor"]
        for field in ("id", "name", "title", "skills", "teaching_style",
                      "difficulty_level", "years_experience", "bio"):
            assert field in mentor, f"Missing field: {field}"

    def test_recommend_reason_mentions_goal(self, client_with_mock_recommender):
        """The reason string should reference the user's stated goal."""
        resp = client_with_mock_recommender.post(
            "/api/v1/recommend-mentor", json=VALID_PAYLOAD
        )
        reason = resp.json()["reason"]
        assert "machine learning engineer" in reason.lower()

    def test_recommend_missing_required_field_returns_422(self, client_with_mock_recommender):
        """Missing required fields must return HTTP 422 Unprocessable Entity."""
        incomplete = {"user_goal": "Learn ML"}  # missing 4 required fields
        resp = client_with_mock_recommender.post(
            "/api/v1/recommend-mentor", json=incomplete
        )
        assert resp.status_code == 422

    def test_recommend_invalid_experience_level_returns_422(self, client_with_mock_recommender):
        """Invalid enum value for experience_level must return 422."""
        bad_payload = {**VALID_PAYLOAD, "experience_level": "expert"}
        resp = client_with_mock_recommender.post(
            "/api/v1/recommend-mentor", json=bad_payload
        )
        assert resp.status_code == 422

    def test_recommend_empty_skills_returns_422(self, client_with_mock_recommender):
        """Empty current_skills list must return 422 (min_length=1)."""
        bad_payload = {**VALID_PAYLOAD, "current_skills": []}
        resp = client_with_mock_recommender.post(
            "/api/v1/recommend-mentor", json=bad_payload
        )
        assert resp.status_code == 422

    def test_recommend_alternative_mentors_is_list(self, client_with_mock_recommender):
        """alternative_mentors must always be a list."""
        resp = client_with_mock_recommender.post(
            "/api/v1/recommend-mentor", json=VALID_PAYLOAD
        )
        alts = resp.json()["alternative_mentors"]
        assert isinstance(alts, list)
