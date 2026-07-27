/**
 * lib/api.ts
 * ───────────
 * Typed API client for the MentorSphere backend (FastAPI :8000).
 *
 * All functions throw on non-2xx responses with a human-readable message.
 */

import type { ProfileData, RecommendationResult, ChatMessage } from "./store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? JSON.stringify(body);
    } catch {
      /* ignore parse error */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

// ── Resume Parsing ────────────────────────────────────────────────────────────

export interface ParseResumeResponse {
  resume_text: string;
  extracted_skills: string[];
  skill_level: "beginner" | "intermediate" | "advanced";
  suggested_goal: string;
  character_count: number;
}

/**
 * Upload a PDF resume and get back extracted skills + suggested profile.
 */
export async function parseResume(file: File): Promise<ParseResumeResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/api/v1/parse-resume`, {
    method: "POST",
    body: form,
  });

  return handleResponse<ParseResumeResponse>(res);
}

// ── Mentor Recommendation ─────────────────────────────────────────────────────

/**
 * Send a user profile to the ML engine and receive ranked mentor matches.
 */
export async function recommendMentors(
  profile: ProfileData
): Promise<RecommendationResult> {
  const res = await fetch(`${BASE_URL}/api/v1/recommend-mentor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  return handleResponse<RecommendationResult>(res);
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatResponse {
  reply: string;
  mentor_id: string;
}

/**
 * Send a message to the selected AI mentor.
 */
export async function sendChatMessage(
  mentorId: string,
  message: string,
  history: Omit<ChatMessage, "timestamp">[]
): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mentor_id: mentorId,
      message,
      history: history.map((h) => ({ role: h.role, content: h.content })),
    }),
  });

  return handleResponse<ChatResponse>(res);
}
