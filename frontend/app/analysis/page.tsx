"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDashed, BrainCircuit } from "lucide-react";

const analysisSteps = [
  "Extracting Profile Data",
  "Detecting Core Skills",
  "Analyzing Interests & Goals",
  "Generating Vector Embeddings",
  "Querying Mentor Database",
  "Running ML Matching Algorithm",
  "Building Learning Graph",
  "Ranking Resources",
  "Finalizing Personalization"
];

export default function AnalysisPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStepIndex < analysisSteps.length) {
      const duration = Math.random() * 800 + 400; // Random delay between 400ms and 1200ms
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => router.push("/recommendation"), 1500);
      }, 500);
    }
  }, [currentStepIndex, router]);

  return (
    <div className="relative min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="w-[800px] h-[800px] rounded-full border border-primary/20 border-dashed"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [360, 270, 180, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] rounded-full border border-purple-500/20 border-dashed"
        />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Brain Icon / Header */}
        <div className="flex flex-col items-center mb-12">
          <motion.div
            animate={{
              boxShadow: isComplete 
                ? "0 0 60px 20px rgba(34,197,94,0.3)" 
                : "0 0 60px 20px rgba(59,130,246,0.2)"
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
            {isComplete ? "Profile Complete" : "AI Analysis Engine"}
          </h2>
          <p className="text-muted-foreground mt-2 font-light">
            {isComplete ? "Redirecting to your recommendations..." : "Building your custom learning graph..."}
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="space-y-4">
          <AnimatePresence>
            {analysisSteps.map((step, index) => {
              const isPast = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isFuture = index > currentStepIndex;

              if (isFuture && index > currentStepIndex + 2) return null; // Show only a few steps ahead

              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ 
                    opacity: isFuture ? 0.3 : 1, 
                    y: 0, 
                    filter: "blur(0px)",
                    scale: isCurrent ? 1.02 : 1
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
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <CircleDashed className="h-6 w-6 text-primary" />
                      </motion.div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border border-white/20" />
                    )}
                  </div>
                  <span className={`font-medium ${
                    isPast ? "text-muted-foreground" : isCurrent ? "text-white" : "text-muted-foreground"
                  }`}>
                    {step}
                  </span>
                  
                  {isCurrent && (
                    <motion.div 
                      className="ml-auto flex space-x-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[1, 2, 3].map(i => (
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
