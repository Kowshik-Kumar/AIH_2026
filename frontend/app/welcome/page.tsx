"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { UploadCloud, PenLine, Sparkles } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#09090B] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground/80 font-medium">Welcome to MentorSphere</span>
        </motion.div>

        {/* Hero Section */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Your Personalized AI <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Learning Companion
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-16 font-light leading-relaxed"
        >
          Learn faster through AI-powered mentorship personalized to your goals, skills and experience.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          {/* Upload Resume Button */}
          <button 
            onClick={() => router.push("/upload")}
            className="group relative flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-2xl" />
            <UploadCloud className="w-5 h-5 mr-3 relative z-10 group-hover:-translate-y-0.5 transition-transform" />
            <span className="relative z-10">Upload Resume</span>
          </button>

          {/* Build Profile Button */}
          <button 
            onClick={() => router.push("/profile-builder")}
            className="group relative flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-[#111111] text-foreground border border-white/10 rounded-2xl font-semibold transition-all hover:scale-105 hover:bg-white/5 hover:border-white/20"
          >
            <PenLine className="w-5 h-5 mr-3 group-hover:-translate-y-0.5 transition-transform text-muted-foreground group-hover:text-foreground" />
            <span>Build Profile Manually</span>
          </button>
        </motion.div>
      </div>
      
      {/* Abstract Illustration/Geometry */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 2 }}
        className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#09090B] via-transparent to-transparent z-0 pointer-events-none"
      >
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-[2px]" />
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[100%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-[1px]" />
      </motion.div>
    </div>
  );
}
