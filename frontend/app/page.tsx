"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Particles } from "@/components/ui/particles";
import { Brain } from "lucide-react";

export default function SplashScreen() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Simulate initial loading time
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/welcome");
      }, 1000); // Wait for exit animation
    }, 3500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#09090B]"
        >
          {/* Subtle Ambient Gradients */}
          <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-purple-500/10 blur-[100px]" />

          <Particles />

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="flex items-center justify-center space-x-3 mb-6"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
                <Brain className="h-8 w-8 text-white" />
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-white/20"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                MentorSphere
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg text-muted-foreground tracking-wide font-light"
            >
              Learn from the world&apos;s greatest minds.
            </motion.p>

            {/* Loading Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-12 flex flex-col items-center space-y-4"
            >
              <div className="h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                />
              </div>
              <span className="text-xs text-muted-foreground/60 tracking-widest uppercase">
                Initializing AI Core
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
