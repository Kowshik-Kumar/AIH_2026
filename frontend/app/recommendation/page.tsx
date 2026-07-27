"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Star, ArrowRight, ShieldCheck, TrendingUp, Sparkles,
  BookOpen, BrainCircuit, Users, Clock, AlertCircle
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { MentorResult } from "@/lib/store";

// ── Helpers ───────────────────────────────────────────────────────────────────

function scorePercent(score: number) {
  return Math.round(score * 100);
}

function Avatar({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const letter = name.charAt(0).toUpperCase();
  const colors = [
    "from-blue-500 to-purple-600",
    "from-emerald-500 to-cyan-600",
    "from-orange-500 to-pink-600",
    "from-violet-500 to-indigo-600",
    "from-rose-500 to-red-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const cls = size === "lg"
    ? "w-20 h-20 rounded-2xl text-3xl"
    : "w-10 h-10 rounded-full text-sm";

  return (
    <div className={`${cls} bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}>
      {letter}
    </div>
  );
}

// ── Mentor Card ───────────────────────────────────────────────────────────────

function MentorCard({
  mentor,
  score,
  reason,
  isSelected,
  isTopMatch,
  onSelect,
}: {
  mentor: MentorResult;
  score: number;
  reason?: string;
  isSelected: boolean;
  isTopMatch: boolean;
  onSelect: () => void;
}) {
  const pct = scorePercent(score);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-3xl p-6 border transition-all duration-300 cursor-pointer
        ${isSelected
          ? "bg-primary/10 border-primary shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]"
          : "bg-[#111111] border-white/10 hover:border-white/20 hover:bg-[#161616]"}
      `}
      onClick={onSelect}
    >
      {/* Top Match Badge */}
      {isTopMatch && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg z-10">
          <Sparkles className="w-3 h-3 mr-1" />
          Best Match
        </div>
      )}

      {/* Selected ring */}
      {isSelected && (
        <motion.div
          layoutId="selected-ring"
          className="absolute inset-0 rounded-3xl border-2 border-primary pointer-events-none"
          initial={false}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-5 mb-5">
        {/* Avatar + Score */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <Avatar name={mentor.name} size="lg" />
          <div className="flex items-center gap-1 text-success font-bold text-lg">
            <span>{pct}%</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-xs text-muted-foreground">Match</span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-0.5 truncate">{mentor.name}</h3>
          <p className="text-primary font-medium text-sm mb-3 truncate">{mentor.title}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{mentor.teaching_style}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 flex-shrink-0" />
              <span>{mentor.difficulty_level} level</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{mentor.years_experience}+ years experience</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{mentor.languages.join(", ")}</span>
            </div>
          </div>

          {/* Expertise tags */}
          <div className="flex flex-wrap gap-1.5">
            {mentor.expertise_areas.slice(0, 4).map((area) => (
              <span key={area} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-muted-foreground">
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {mentor.bio}
      </p>

      {/* AI Reasoning */}
      {reason && (
        <div className="bg-[#09090B] rounded-2xl p-4 border border-white/5 mb-5">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5" />
            AI Recommendation Reason
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>
        </div>
      )}

      {/* Select Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm
          ${isSelected
            ? "bg-primary text-white shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
            : "bg-white/5 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-white/10 hover:border-primary/30"}
        `}
      >
        {isSelected ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"
            >
              ✓
            </motion.div>
            Selected
          </>
        ) : (
          "Select This Mentor"
        )}
      </button>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RecommendationPage() {
  const router = useRouter();
  const recommendationResult = useAppStore((s) => s.recommendationResult);
  const selectedMentor = useAppStore((s) => s.selectedMentor);
  const setSelectedMentor = useAppStore((s) => s.setSelectedMentor);
  const clearChat = useAppStore((s) => s.clearChat);

  // Guard: if no recommendation data, send back
  useEffect(() => {
    if (!recommendationResult) {
      router.replace("/welcome");
    }
  }, [recommendationResult, router]);

  if (!recommendationResult) return null;

  const { best_mentor, recommendation_score, reason, alternative_mentors } = recommendationResult;
  const allMentors: { mentor: MentorResult; score: number; reason?: string; isTopMatch: boolean }[] = [
    { mentor: best_mentor, score: recommendation_score, reason, isTopMatch: true },
    ...alternative_mentors.map((m, i) => ({
      mentor: m,
      score: Math.max(0.3, recommendation_score - (i + 1) * 0.06),
      isTopMatch: false,
    })),
  ];

  const handleSelect = (mentor: MentorResult) => {
    clearChat(); // fresh chat for new mentor
    setSelectedMentor(mentor);
  };

  const handleContinue = () => {
    router.push("/chats");
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-28 pt-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-success/10 text-success border border-success/20 rounded-full px-4 py-1.5 mb-6"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-medium">AI Analysis Complete</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Your Recommended Mentors
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Select one mentor to begin your personalized AI session.
          </motion.p>
        </div>

        {/* No results fallback */}
        {allMentors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">No mentors found. Please try again.</p>
            <button onClick={() => router.push("/welcome")} className="px-6 py-3 bg-primary rounded-2xl text-white font-semibold">
              Start Over
            </button>
          </div>
        )}

        {/* Mentor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {allMentors.map(({ mentor, score, reason: r, isTopMatch }, index) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MentorCard
                  mentor={mentor}
                  score={score}
                  reason={r}
                  isSelected={selectedMentor?.id === mentor.id}
                  isTopMatch={isTopMatch}
                  onSelect={() => handleSelect(mentor)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Continue CTA */}
      <AnimatePresence>
        {selectedMentor && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={handleContinue}
              className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:scale-105 transition-all"
            >
              <Avatar name={selectedMentor.name} size="sm" />
              <span>Chat with {selectedMentor.name.split(" ")[0]}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
