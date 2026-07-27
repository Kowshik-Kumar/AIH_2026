"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDashed, BrainCircuit, AlertCircle, RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { recommendMentors } from "@/lib/api";

const analysisSteps = [
  "Reading your profile",
  "Detecting core skills",
  "Analyzing goals & interests",
  "Generating vector embeddings",
  "Querying mentor database",
  "Running ML matching algorithm",
  "Ranking mentor compatibility",
  "Building recommendation list",
  "Finalizing personalization",
];

export default function AnalysisPage() {
  const router = useRouter();
  const profileData = useAppStore((s) => s.profileData);
  const setRecommendationResult = useAppStore((s) => s.setRecommendationResult);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiCalled, setApiCalled] = useState(false);

  // Fire the real API call once the animation has progressed past step 4
  useEffect(() => {
    if (currentStepIndex < 4 || apiCalled) return;
    if (!profileData) {
      // No profile — send them back to welcome
      router.replace("/welcome");
      return;
    }

    setApiCalled(true);

    recommendMentors(profileData)
      .then((result) => {
        setRecommendationResult(result);
        // Let the animation finish naturally
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to get recommendations.";
        setError(msg);
      });
  }, [currentStepIndex, apiCalled, profileData, router, setRecommendationResult]);

  // Advance animation steps
  useEffect(() => {
    if (error) return;  // stop advancing on error
    if (currentStepIndex < analysisSteps.length) {
      const duration = 400 + Math.random() * 600;
      const timer = setTimeout(
        () => setCurrentStepIndex((prev) => prev + 1),
        duration
      );
      return () => clearTimeout(timer);
    } else {
      // All steps done — wait a beat then go to recommendations
      const t = setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => router.push("/recommendation"), 1200);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [currentStepIndex, error, router]);

  if (error) {
    return (
      <div className="relative min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="h-24 w-24 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="h-12 w-12 text-danger" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Analysis Failed</h2>
          <p className="text-muted-foreground mb-2">
            Could not reach the recommendation engine.
          </p>
          <p className="text-sm text-danger/80 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 mb-8 font-mono text-left">
            {error}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Make sure the backend is running:{" "}
            <code className="text-primary">uvicorn app.main:app --reload --port 8000</code>
          </p>
          <button
            onClick={() => {
              setError(null);
              setApiCalled(false);
              setCurrentStepIndex(0);
            }}
            className="flex items-center mx-auto px-6 py-3 bg-primary rounded-2xl text-white font-semibold hover:scale-105 transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Dynamic animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="w-[800px] h-[800px] rounded-full border border-primary/20 border-dashed"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], rotate: [360, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] rounded-full border border-purple-500/20 border-dashed"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1], rotate: [0, -360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[400px] h-[400px] rounded-full border border-primary/10 border-dashed"
        />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Brain Icon / Header */}
        <div className="flex flex-col items-center mb-12">
          <motion.div
            animate={{
              boxShadow: isComplete
                ? "0 0 60px 20px rgba(34,197,94,0.3)"
                : "0 0 60px 20px rgba(59,130,246,0.2)",
            }}
            className="h-24 w-24 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center mb-8 relative"
          >
            <BrainCircuit className={`h-12 w-12 ${isComplete ? "text-success" : "text-primary"}`} />
            {!isComplete && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/50 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </motion.div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {isComplete ? "Match Found!" : "AI Analysis Engine"}
          </h2>
          <p className="text-muted-foreground mt-2 font-light">
            {isComplete
              ? "Navigating to your personalized mentor recommendations..."
              : "Building your custom learning profile..."}
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="space-y-3">
          <AnimatePresence>
            {analysisSteps.map((step, index) => {
              const isPast = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isFuture = index > currentStepIndex;

              if (isFuture && index > currentStepIndex + 2) return null;

              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{
                    opacity: isFuture ? 0.3 : 1,
                    y: 0,
                    filter: "blur(0px)",
                    scale: isCurrent ? 1.02 : 1,
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center p-4 rounded-2xl border transition-colors duration-500 ${
                    isCurrent
                      ? "bg-primary/10 border-primary/30"
                      : "bg-[#111111] border-white/5"
                  }`}
                >
                  <div className="mr-4 flex-shrink-0">
                    {isPast ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      </motion.div>
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <CircleDashed className="h-6 w-6 text-primary" />
                      </motion.div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border border-white/20" />
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      isPast ? "text-muted-foreground" : isCurrent ? "text-white" : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>

                  {isCurrent && (
                    <motion.div
                      className="ml-auto flex space-x-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
