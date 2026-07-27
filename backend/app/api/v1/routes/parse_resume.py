"""
app/api/v1/routes/parse_resume.py
───────────────────────────────────
POST /api/v1/parse-resume

Accepts a multipart PDF upload, extracts plain text with PyMuPDF,
then runs the skill classifier to infer the user's experience level
and extract key skills mentioned in the document.

Returns a structured profile that the frontend stores in Zustand
and passes directly to the mentor recommendation endpoint.
"""

from __future__ import annotations

import io
import logging
import re

from fastapi import APIRouter, HTTPException, UploadFile, File, status
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Resume"])

# Skills keyword list — quick lookup for extraction without an ML model call
SKILL_KEYWORDS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
    "React", "Next.js", "Vue", "Angular", "Node.js", "FastAPI", "Django", "Flask",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "scikit-learn",
    "NLP", "Computer Vision", "Data Science", "Statistics",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform", "CI/CD",
    "Git", "Linux", "REST", "Microservices", "System Design",
    "Swift", "SwiftUI", "React Native", "Flutter", "Kotlin", "Android",
    "Figma", "UI/UX", "CSS", "HTML", "TailwindCSS",
    "Spark", "Hadoop", "Kafka", "Airflow", "dbt", "Tableau",
    "DevOps", "SRE", "MLOps", "LLM", "LangChain", "RAG", "FAISS",
]


# ── Response Schema ───────────────────────────────────────────────────────────

class ResumeParseResponse(BaseModel):
    resume_text: str
    extracted_skills: list[str]
    skill_level: str          # "beginner" | "intermediate" | "advanced"
    suggested_goal: str
    character_count: int


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_text_from_pdf(file_bytes: bytes) -> str:
    """Use PyMuPDF to extract all text from a PDF."""
    try:
        import fitz  # PyMuPDF  # noqa: PLC0415
    except ImportError as exc:
        raise RuntimeError(
            "PyMuPDF is not installed. Run: pip install PyMuPDF"
        ) from exc

    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages_text = []
    for page in doc:
        pages_text.append(page.get_text())
    doc.close()
    return "\n".join(pages_text)


def _extract_skills(text: str) -> list[str]:
    """Case-insensitive keyword scan for known skills."""
    found: list[str] = []
    text_lower = text.lower()
    for skill in SKILL_KEYWORDS:
        if skill.lower() in text_lower:
            found.append(skill)
    return found


def _infer_experience_level(text: str, skills: list[str]) -> str:
    """
    Simple heuristic to guess experience level from the resume text.

    Signals of seniority:
    - Years of experience mentioned
    - Senior / Lead / Principal titles
    - Many distinct skill keywords
    """
    text_lower = text.lower()

    # Check for explicit year mentions
    year_matches = re.findall(r"(\d+)\+?\s*years?", text_lower)
    max_years = max((int(y) for y in year_matches), default=0)

    has_senior_title = any(
        word in text_lower
        for word in ["senior", "lead", "principal", "staff", "director", "head of", "architect"]
    )

    if max_years >= 7 or has_senior_title:
        return "advanced"
    elif max_years >= 3 or len(skills) >= 8:
        return "intermediate"
    else:
        return "beginner"


def _suggest_goal(skills: list[str], level: str) -> str:
    """Derive a default goal string from extracted skills."""
    ml_skills = {"Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP"}
    web_skills = {"React", "Next.js", "Node.js", "TypeScript", "JavaScript"}
    devops_skills = {"Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"}
    data_skills = {"SQL", "Spark", "dbt", "Tableau", "Data Science"}
    mobile_skills = {"Swift", "SwiftUI", "React Native", "Flutter", "Kotlin"}

    skill_set = set(skills)

    if skill_set & ml_skills:
        area = "Machine Learning Engineer"
    elif skill_set & devops_skills:
        area = "DevOps / Platform Engineer"
    elif skill_set & data_skills:
        area = "Data Scientist"
    elif skill_set & mobile_skills:
        area = "Mobile Developer"
    elif skill_set & web_skills:
        area = "Full-Stack Web Developer"
    else:
        area = "Software Engineer"

    return f"Become a {level.capitalize()}-level {area}"


# ── Route ─────────────────────────────────────────────────────────────────────

@router.post(
    "/parse-resume",
    response_model=ResumeParseResponse,
    status_code=status.HTTP_200_OK,
    summary="Parse a PDF resume and extract profile data",
    description=(
        "Accepts a PDF file upload, extracts plain text using PyMuPDF, "
        "scans for known skills, infers experience level, and suggests a career goal. "
        "The returned profile is used directly by the mentor recommendation endpoint."
    ),
)
async def parse_resume(
    file: UploadFile = File(..., description="PDF resume file (max 10 MB)"),
) -> ResumeParseResponse:
    """Extract skills and experience level from a PDF resume."""

    # Validate file type
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        # Also allow generic binary in case browser sends it that way
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Only PDF files are supported.",
            )

    # Read bytes
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10 MB
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds the 10 MB limit.",
        )

    logger.info("Parsing resume: %s (%d bytes)", file.filename, len(file_bytes))

    try:
        resume_text = _extract_text_from_pdf(file_bytes)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("PDF extraction failed")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not parse the PDF: {exc}",
        ) from exc

    if not resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded PDF appears to be empty or image-only (not machine-readable text).",
        )

    extracted_skills = _extract_skills(resume_text)
    skill_level = _infer_experience_level(resume_text, extracted_skills)
    suggested_goal = _suggest_goal(extracted_skills, skill_level)

    logger.info(
        "Resume parsed | skills=%d | level=%s | goal=%r",
        len(extracted_skills),
        skill_level,
        suggested_goal,
    )

    return ResumeParseResponse(
        resume_text=resume_text[:8000],   # cap for embedding
        extracted_skills=extracted_skills,
        skill_level=skill_level,
        suggested_goal=suggested_goal,
        character_count=len(resume_text),
    )
