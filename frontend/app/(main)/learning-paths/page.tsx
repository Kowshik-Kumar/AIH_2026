"use client";

import { CheckCircle2, Circle, Lock, Play, Trophy, Award } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function LearningPathsPage() {
  const { profileData } = useAppStore();

  const paths = [
    {
      id: 1,
      title: "Foundations & Environment Setup",
      description: "Get your development environment ready and understand the core principles.",
      status: "completed", // completed, current, locked
      modules: 4,
      duration: "2 hours",
    },
    {
      id: 2,
      title: "Core Concepts Masterclass",
      description: `Deep dive into the fundamental concepts necessary to achieve: ${profileData?.user_goal || 'your goal'}.`,
      status: "current",
      modules: 8,
      duration: "5 hours",
    },
    {
      id: 3,
      title: "Advanced Patterns & Architecture",
      description: "Learn how the pros structure large-scale applications.",
      status: "locked",
      modules: 6,
      duration: "4 hours",
    },
    {
      id: 4,
      title: "Capstone Project",
      description: "Build a real-world application with your mentor's guidance.",
      status: "locked",
      modules: 1,
      duration: "10+ hours",
    }
  ];

  return (
    <div className="p-8 pb-20 space-y-10 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Your Learning Path</h1>
        <p className="text-muted-foreground">A curated roadmap designed to take you from {profileData?.experience_level || 'beginner'} to expert.</p>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-white/10 before:to-transparent">
        
        {paths.map((path, index) => {
          const isCompleted = path.status === "completed";
          const isCurrent = path.status === "current";
          const isLocked = path.status === "locked";

          return (
            <div key={path.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Icon */}
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#09090B] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10
                ${isCompleted ? "bg-primary text-[#09090B]" : isCurrent ? "bg-white text-[#09090B]" : "bg-[#111] text-muted-foreground border-white/10"}
              `}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isCurrent ? <Play className="w-5 h-5 ml-1" /> : <Lock className="w-5 h-5" />}
              </div>

              {/* Card */}
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border transition-all duration-300
                ${isCurrent ? "bg-gradient-to-br from-[#111] to-[#1a1a1a] border-primary/50 shadow-lg shadow-primary/5" : "bg-[#111111]/50 border-white/5"}
                ${isLocked ? "opacity-60 grayscale" : ""}
              `}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                    Phase {index + 1}
                  </span>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground font-medium">
                    <span>{path.modules} modules</span>
                    <span>•</span>
                    <span>{path.duration}</span>
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isLocked ? 'text-white/60' : 'text-white'}`}>{path.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{path.description}</p>
                
                {isCurrent && (
                  <button className="mt-6 w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors">
                    Continue Learning
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-8 bg-gradient-to-r from-[#111] to-primary/10 border border-primary/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Earn Your Certificate</h3>
            <p className="text-muted-foreground">Complete all phases and pass the final review with your mentor to earn a verified certificate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
