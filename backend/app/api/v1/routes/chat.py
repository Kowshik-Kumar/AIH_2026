"""
app/api/v1/routes/chat.py
──────────────────────────
POST /api/v1/chat

Accepts a message and conversation history, returns the selected
mentor's AI-generated response via Gemini 1.5 Flash.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.services.chat_service import ChatService, get_chat_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Chat"])


# ── Request / Response schemas ────────────────────────────────────────────────

class ChatTurn(BaseModel):
    role: str = Field(..., description="'user' or 'model'")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    mentor_id: str = Field(..., description="Mentor ID from recommendation response")
    message: str = Field(..., min_length=1, max_length=4000, description="User's message")
    history: list[ChatTurn] = Field(
        default_factory=list,
        description="Previous conversation turns",
    )


class ChatResponse(BaseModel):
    reply: str = Field(..., description="Mentor's AI response")
    mentor_id: str = Field(..., description="Echo of the mentor ID")


# ── Route ─────────────────────────────────────────────────────────────────────

@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Send a message to the selected AI mentor",
    description=(
        "Sends a user message to Gemini 1.5 Flash configured with the selected "
        "mentor's persona (name, expertise, teaching style, bio). Returns the "
        "mentor's AI-generated response. Requires GEMINI_API_KEY in backend/.env."
    ),
)
async def chat(
    request: ChatRequest,
    service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    """Chat with the AI mentor."""
    logger.info(
        "Chat request | mentor=%s | message_length=%d",
        request.mentor_id,
        len(request.message),
    )

    try:
        history_dicts = [
            {"role": t.role, "content": t.content}
            for t in request.history
        ]
        reply = service.chat(
            mentor_id=request.mentor_id,
            user_message=request.message,
            history=history_dicts,
        )
    except Exception as exc:
        logger.exception("Chat error for mentor %s", request.mentor_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate mentor response. Please try again.",
        ) from exc

    return ChatResponse(reply=reply, mentor_id=request.mentor_id)
