"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { ExperienceLevel, LearningStyle, Difficulty } from "@/lib/store";

type SelectionState = Record<string, string[]>;

const steps = [
  {
    id: "experience",
    title: "What is your current experience level?",
    options: ["Beginner", "Intermediate", "Advanced"],
    multi: false,
  },
  {
    id: "goal",
    title: "Describe your primary learning goal",
    type: "text",
    placeholder: "e.g. Become a machine learning engineer, build production-ready web apps...",
  },
  {
    id: "skills",
    title: "What are your current skills?",
    options: [
      "JavaScript", "Python", "React", "Node.js", "Machine Learning",
      "System Design", "UI/UX", "SQL", "AWS", "Go", "C++", "TypeScript",
      "Docker", "Kubernetes", "Swift", "Kotlin", "Data Science",
    ],
    multi: true,
  },
  {
    id: "style",
    title: "How do you learn best?",
    options: [
      "Hands-on projects",
      "Video tutorials",
      "Reading documentation",
      "Auditory / Podcasts",
    ],
    multi: false,
  },
  {
    id: "difficulty",
    title: "Preferred challenge level?",
    options: ["Easy", "Medium", "Hard"],
    multi: false,
  },
];

const styleMap: Record<string, LearningStyle> = {
  "Hands-on projects": "hands-on",
  "Video tutorials": "visual",
  "Reading documentation": "reading",
  "Auditory / Podcasts": "auditory",
};

export default function ProfileBuilderPage() {
  const router = useRouter();
  const setProfileData = useAppStore((s) => s.setProfileData);

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<SelectionState>({});
  const [goalText, setGoalText] = useState("");

  const step = steps[currentStep];

  const handleSelect = (option: string) => {
    setSelections((prev) => {
      const current = prev[step.id] || [];
      if (step.multi) {
        if (current.includes(option)) {
          return { ...prev, [step.id]: current.filter((o) => o !== option) };
        }
        return { ...prev, [step.id]: [...current, option] };
      } else {
        return { ...prev, [step.id]: [option] };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Build profile and store in Zustand
      const experienceRaw = (selections["experience"]?.[0] ?? "intermediate").toLowerCase();
      const levelMap: Record<string, ExperienceLevel> = {
        beginner: "beginner",
        intermediate: "intermediate",
        advanced: "advanced",
      };

      const styleRaw = selections["style"]?.[0] ?? "Hands-on projects";
      const diffRaw = (selections["difficulty"]?.[0] ?? "medium").toLowerCase();
      const diffApiMap: Record<string, Difficulty> = {
        easy: "easy", medium: "medium", hard: "hard",
      };

      setProfileData({
        user_goal: goalText.trim() || "Improve my software engineering skills",
        experience_level: levelMap[experienceRaw] ?? "intermediate",
        current_skills: selections["skills"] ?? [],
        learning_style: styleMap[styleRaw] ?? "hands-on",
        preferred_difficulty: diffApiMap[diffRaw] ?? "medium",
      });

      router.push("/analysis");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    else router.push("/welcome");
  };

  const currentSelection = selections[step.id] || [];
  const isTextStep = "type" in step && step.type === "text";
  const canProceed = isTextStep
    ? goalText.trim().length >= 5
    : currentSelection.length > 0;

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-4">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span className="flex items-center text-primary/80">
              <Sparkles className="w-4 h-4 mr-1" /> Personalizing
            </span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Question Area */}
        <div className="min-h-[380px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex-1"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                {step.title}
              </h2>

              {/* Text input step */}
              {isTextStep ? (
                <div className="relative">
                  <textarea
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    placeholder={step.placeholder}
                    rows={4}
                    className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-white placeholder:text-muted-foreground resize-none outline-none focus:border-primary/50 focus:shadow-[0_0_20px_-8px_rgba(59,130,246,0.4)] transition-all text-base"
                  />
                  <div className="mt-2 text-xs text-muted-foreground text-right">
                    {goalText.length} / 300
                  </div>
                </div>
              ) : (
                /* Option cards */
                <div className="flex flex-wrap gap-4">
                  {step.options?.map((option) => {
                    const isSelected = currentSelection.includes(option);
                    return (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(option)}
                        className={`
                          relative px-6 py-4 rounded-2xl text-left border transition-all duration-300 overflow-hidden
                          ${isSelected
                            ? "bg-primary/10 border-primary shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
                            : "bg-[#111111] border-white/10 hover:border-white/20 hover:bg-white/5"}
                        `}
                      >
                        <div className="flex items-center justify-between space-x-4">
                          <span className={`font-medium ${isSelected ? "text-white" : "text-muted-foreground"}`}>
                            {option}
                          </span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between pt-8 border-t border-white/10">
          <button
            onClick={handleBack}
            className="flex items-center px-6 py-3 text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`
              flex items-center px-8 py-3 rounded-2xl font-semibold transition-all duration-300
              ${canProceed
                ? "bg-primary text-white hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]"
                : "bg-white/5 text-white/30 cursor-not-allowed"}
            `}
          >
            {currentStep === steps.length - 1 ? "Find My Mentors" : "Next"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
