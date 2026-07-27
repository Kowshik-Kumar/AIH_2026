"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FileUp, FileText, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";
import { parseResume } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { ExperienceLevel, LearningStyle, Difficulty } from "@/lib/store";

export default function UploadResumePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setProfileData = useAppStore((s) => s.setProfileData);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }

    setError(null);
    setFileName(file.name);
    setIsUploading(true);
    setProgress(0);

    // Animate progress bar while waiting for the real API call
    const fakeInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) { clearInterval(fakeInterval); return 85; }
        return prev + Math.random() * 8;
      });
    }, 200);

    try {
      const result = await parseResume(file);

      // Map API result to the profile shape the recommendation engine expects
      const levelMap: Record<string, ExperienceLevel> = {
        beginner: "beginner",
        intermediate: "intermediate",
        advanced: "advanced",
      };
      const styleMap: LearningStyle = "hands-on";
      const diffMap: Difficulty = result.skill_level === "advanced" ? "hard"
        : result.skill_level === "intermediate" ? "medium" : "easy";

      setProfileData({
        user_goal: result.suggested_goal,
        experience_level: levelMap[result.skill_level] ?? "intermediate",
        current_skills: result.extracted_skills.slice(0, 10),
        learning_style: styleMap,
        preferred_difficulty: diffMap,
        resume_text: result.resume_text,
      });

      clearInterval(fakeInterval);
      setProgress(100);

      setTimeout(() => router.push("/analysis"), 1200);
    } catch (err: unknown) {
      clearInterval(fakeInterval);
      setIsUploading(false);
      setProgress(0);
      const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-3xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Upload your Resume
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Our AI will analyze your experience and tailor the mentorship to you.
          </motion.p>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`relative group border-2 border-dashed rounded-3xl p-12 transition-all duration-500 ease-out flex flex-col items-center justify-center min-h-[300px]
            ${isDragging ? "border-primary bg-primary/5" : "border-white/10 bg-[#111111]/50 hover:border-white/20"}
            ${isUploading ? "pointer-events-none" : "cursor-pointer"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {/* hidden real file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileInput}
          />

          {/* Glow */}
          <div className={`absolute inset-0 rounded-3xl bg-primary/20 blur-[100px] transition-opacity duration-500 ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-30"}`} />

          <AnimatePresence mode="wait">
            {!isUploading ? (
              <motion.div
                key="upload-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center relative z-10"
              >
                <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <FileUp className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drag &amp; drop your PDF here
                </h3>
                <p className="text-muted-foreground mb-6">
                  or click to browse from your computer
                </p>
                <span className="text-xs font-medium text-white/40 bg-white/5 px-3 py-1 rounded-full">
                  PDF format only, up to 10MB
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="upload-progress"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center relative z-10"
              >
                <div className="relative mb-6">
                  {progress < 100 ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-20 w-20 rounded-full border-2 border-primary/20 border-t-primary"
                    />
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-10 w-10 text-success" />
                    </motion.div>
                  )}
                  {progress < 100 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-white/50" />
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-2 max-w-xs text-center truncate">
                  {fileName}
                </p>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {progress < 100 ? "Analyzing resume with AI..." : "Analysis Complete!"}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {progress < 100
                    ? "Extracting skills and building your profile..."
                    : "Navigating to mentor recommendations..."}
                </p>

                <div className="w-full max-w-md bg-white/5 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-purple-500"
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="mt-3 text-sm font-medium text-muted-foreground">
                  {Math.round(Math.min(progress, 100))}%
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-3 bg-danger/10 border border-danger/30 text-danger rounded-2xl px-5 py-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex items-center justify-center"
        >
          <button
            onClick={() => router.push("/profile-builder")}
            className="flex items-center text-muted-foreground hover:text-white transition-colors duration-300 font-medium group"
          >
            <span>Or continue manually without a resume</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
