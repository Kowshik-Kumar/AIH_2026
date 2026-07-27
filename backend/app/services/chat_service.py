"""
app/services/chat_service.py
─────────────────────────────
Business logic for AI mentor chat powered by Google Gemini.

Each message is sent with a rich system prompt that instructs Gemini
to respond exactly as the selected mentor would — mirroring their
expertise, teaching style, and personality.

If GEMINI_API_KEY is not set or the API call fails, a graceful
fallback response is returned so the app stays functional.
"""

from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


# ── Mentor record loader ───────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_mentors() -> dict[str, dict[str, Any]]:
    """Load mentors.json and index by mentor id."""
    path = Path(settings.mentors_data_path)
    if not path.exists():
        logger.warning("mentors.json not found at %s", path)
        return {}
    with path.open(encoding="utf-8") as f:
        records: list[dict] = json.load(f)
    return {m["id"]: m for m in records}


def get_mentor_by_id(mentor_id: str) -> dict[str, Any] | None:
    """Return a mentor record dict or None if not found."""
    return _load_mentors().get(mentor_id)


# ── System prompt builder ─────────────────────────────────────────────────────

def build_system_prompt(mentor: dict[str, Any]) -> str:
    """
    Construct a detailed system prompt that gives Gemini the mentor's
    persona, expertise, teaching style, and behavioural constraints.
    """
    name = mentor["name"]
    title = mentor["title"]
    bio = mentor.get("bio", "")
    expertise = ", ".join(mentor.get("expertise_areas", []))
    skills = ", ".join(mentor.get("skills", []))
    teaching_style = mentor.get("teaching_style", "clear and structured")
    difficulty = mentor.get("difficulty_level", "intermediate")
    years = mentor.get("years_experience", 5)

    return f"""You are {name}, {title}.

BACKGROUND:
{bio}

YOUR EXPERTISE: {expertise}
YOUR SKILLS: {skills}
YOUR TEACHING STYLE: {teaching_style}
TARGET AUDIENCE: {difficulty}-level learners
YEARS OF EXPERIENCE: {years}

INSTRUCTIONS:
- Always respond in first person as {name}.
- Match the teaching style described above exactly.
- Give concrete, actionable advice relevant to the user's question.
- When explaining technical concepts, use analogies and examples.
- If you write code, add brief comments explaining each section.
- Keep responses focused and clear. Avoid unnecessary preamble.
- If asked about something outside your expertise, acknowledge it
  honestly and redirect to what you *can* help with.
- Be encouraging but honest — do not sugarcoat technical realities.
- Never break character or mention that you are an AI language model.
  You ARE {name} for this conversation.
"""


# ── Message schema ────────────────────────────────────────────────────────────

class ChatMessage:
    def __init__(self, role: str, content: str) -> None:
        self.role = role          # "user" or "model"
        self.content = content


# ── Chat Service ──────────────────────────────────────────────────────────────

class ChatService:
    """
    Sends a user message to Gemini with the mentor persona system prompt
    and returns the AI response.

    Falls back to a helpful placeholder when GEMINI_API_KEY is missing
    so the UI remains functional during development.
    """

    def __init__(self) -> None:
        self._client = None
        self._model = None
        self._ready = False
        self._init_gemini()

    def _init_gemini(self) -> None:
        """Lazily initialise the Gemini client."""
        api_key = settings.gemini_api_key
        if not api_key or api_key in ("placeholder", ""):
            logger.warning(
                "GEMINI_API_KEY not set — chat will use fallback responses. "
                "Add a real key to backend/.env to enable AI chat."
            )
            return

        try:
            import google.generativeai as genai  # noqa: PLC0415
            genai.configure(api_key=api_key)
            self._genai = genai
            self._ready = True
            logger.info("Gemini client initialised successfully.")
        except ImportError:
            logger.error(
                "google-generativeai is not installed. "
                "Run: pip install google-generativeai"
            )

    def chat(
        self,
        mentor_id: str,
        user_message: str,
        history: list[dict[str, str]],
    ) -> str:
        """
        Send a message and return the mentor's AI response.

        Parameters
        ----------
        mentor_id:
            ID matching a record in mentors.json.
        user_message:
            The user's latest message.
        history:
            Previous turns: [{"role": "user"|"model", "content": "..."}]

        Returns
        -------
        str
            The mentor's response text.
        """
        mentor = get_mentor_by_id(mentor_id)
        if mentor is None:
            logger.error("Mentor %s not found", mentor_id)
            return (
                "I'm sorry, I couldn't find the mentor profile for this session. "
                "Please go back and select a mentor again."
            )

        if not self._ready:
            return self._fallback_response(mentor, user_message)

        return self._gemini_chat(mentor, user_message, history)

    def _gemini_chat(
        self,
        mentor: dict[str, Any],
        user_message: str,
        history: list[dict[str, str]],
    ) -> str:
        """Call the Gemini API with the mentor persona."""
        try:
            system_prompt = build_system_prompt(mentor)

            # Build Gemini chat history format
            gemini_history = []
            for turn in history:
                role = turn.get("role", "user")
                # Gemini uses "model" not "assistant"
                if role == "assistant":
                    role = "model"
                gemini_history.append({
                    "role": role,
                    "parts": [turn.get("content", "")]
                })

            model = self._genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_prompt,
            )
            chat_session = model.start_chat(history=gemini_history)
            response = chat_session.send_message(user_message)
            return response.text

        except Exception as exc:
            logger.exception("Gemini API error: %s", exc)
            mentor_name = mentor.get("name", "your mentor")
            return (
                f"I'm having a moment of technical difficulty. "
                f"As {mentor_name}, I'd say: give it another try — "
                f"persistence is key in this field!"
            )

    def _fallback_response(
        self,
        mentor: dict[str, Any],
        user_message: str,
    ) -> str:
        """
        Rich template-based fallback when no Gemini key is configured.
        Provides a realistic mentor-voiced response.
        """
        name = mentor["name"]
        expertise = mentor.get("expertise_areas", ["technology"])
        primary_area = expertise[0] if expertise else "this field"
        teaching_style = mentor.get("teaching_style", "hands-on")

        return (
            f"Great question! As someone who has spent years working in {primary_area}, "
            f"I can tell you that the most important thing is to build strong fundamentals. "
            f"My approach ({teaching_style}) means I'd suggest you: "
            f"(1) Break the problem down into smaller pieces, "
            f"(2) Write code and experiment immediately, and "
            f"(3) Reflect on what you learned before moving on. "
            f"What specific aspect of your question would you like me to dive deeper into?\n\n"
            f"*(Note: Add your GEMINI_API_KEY to backend/.env to enable full AI responses from {name})*"
        )


# ── Dependency ────────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def get_chat_service() -> ChatService:
    """Return a cached singleton ChatService."""
    return ChatService()
