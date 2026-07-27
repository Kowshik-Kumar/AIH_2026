/**
 * lib/store.ts
 * ─────────────
 * Zustand global state store for MentorSphere.
 *
 * Persists profile data, recommendation results, and selected mentor
 * across page navigations without requiring prop drilling or context.
 *
 * State flow:
 *   /upload or /profile-builder → sets profileData
 *   /analysis          → calls API, sets recommendationResult
 *   /recommendation    → user picks mentor, sets selectedMentor
 *   /chats             → reads selectedMentor, stores chatHistory
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type LearningStyle = "visual" | "reading" | "hands-on" | "auditory";
export type Difficulty = "easy" | "medium" | "hard";

/** Profile data collected via upload or manual builder */
export interface ProfileData {
  user_goal: string;
  experience_level: ExperienceLevel;
  current_skills: string[];
  learning_style: LearningStyle;
  preferred_difficulty: Difficulty;
  resume_text?: string;   // only set when coming from PDF upload
}

/** A single mentor record from the API */
export interface MentorResult {
  id: string;
  name: string;
  title: string;
  expertise_areas: string[];
  skills: string[];
  teaching_style: string;
  difficulty_level: ExperienceLevel;
  years_experience: number;
  languages: string[];
  bio: string;
}

/** Full recommendation API response */
export interface RecommendationResult {
  best_mentor: MentorResult;
  recommendation_score: number;
  reason: string;
  alternative_mentors: MentorResult[];
}

/** A single chat turn */
export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: number;
}

// ── Store interface ───────────────────────────────────────────────────────────

interface AppStore {
  // Profile (set by upload or manual builder)
  profileData: ProfileData | null;
  setProfileData: (data: ProfileData) => void;

  // Recommendation result (set by analysis page after API call)
  recommendationResult: RecommendationResult | null;
  setRecommendationResult: (result: RecommendationResult) => void;

  // Selected mentor (set on recommendation page)
  selectedMentor: MentorResult | null;
  setSelectedMentor: (mentor: MentorResult) => void;

  // Chat history for the current session
  chatHistory: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, "timestamp">) => void;
  clearChat: () => void;

  // Reset everything (new session)
  reset: () => void;
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
  profileData: null,
  recommendationResult: null,
  selectedMentor: null,
  chatHistory: [],
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

      setProfileData: (data) => set({ profileData: data }),

      setRecommendationResult: (result) =>
        set({ recommendationResult: result }),

      setSelectedMentor: (mentor) => set({ selectedMentor: mentor }),

      addMessage: (msg) =>
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            { ...msg, timestamp: Date.now() },
          ],
        })),

      clearChat: () => set({ chatHistory: [] }),

      reset: () => set(initialState),
    }),
    {
      name: "mentorsphere-session",
      // Only persist profile + selected mentor; chat history is session-only
      partialize: (state) => ({
        profileData: state.profileData,
        recommendationResult: state.recommendationResult,
        selectedMentor: state.selectedMentor,
      }),
    }
  )
);
