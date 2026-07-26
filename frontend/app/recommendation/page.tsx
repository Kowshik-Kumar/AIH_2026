"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Star, Check, ArrowRight, ShieldCheck, TrendingUp, Sparkles, BookOpen } from "lucide-react";

type Mentor = {
  id: string;
  name: string;
  profession: string;
  score: number;
  confidence: number;
  reasons: string[];
  style: string;
  expertise: string[];
  experience: string;
  popularity: string;
  isTopMatch?: boolean;
};

const mockMentors: Mentor[] = [
  {
    id: "1",
    name: "Andrew Ng",
    profession: "AI Researcher & Educator",
    score: 98,
    confidence: 99,
    reasons: [
      "Wants to become an ML Engineer",
      "Matches your preferred 'Video Tutorials' learning style",
      "Requires a strong Machine Learning foundation"
    ],
    style: "Academic, Beginner-friendly",
    expertise: ["Machine Learning", "Deep Learning", "AI Strategy"],
    experience: "Expert (20+ years)",
    popularity: "Exceptional",
    isTopMatch: true
  },
  {
    id: "2",
    name: "Lex Fridman",
    profession: "AI Researcher @ MIT",
    score: 92,
    confidence: 94,
    reasons: [
      "Interests in Artificial Intelligence and Robotics",
      "Great for deep, philosophical understanding"
    ],
    style: "Conversational, Deep Dive",
    expertise: ["Robotics", "Autonomous Vehicles", "Deep Learning"],
    experience: "Advanced (10+ years)",
    popularity: "Very High"
  },
  {
    id: "3",
    name: "Andrej Karpathy",
    profession: "AI Hacker & Educator",
    score: 95,
    confidence: 96,
    reasons: [
      "Matches your 'Hands-on projects' learning style",
      "Excellent for practical neural network implementation"
    ],
    style: "Code-first, Practical",
    expertise: ["Neural Networks", "Computer Vision", "PyTorch"],
    experience: "Expert (15+ years)",
    popularity: "Exceptional",
    isTopMatch: true
  },
  {
    id: "4",
    name: "Harrison Kinsley",
    profession: "Python & AI Developer",
    score: 85,
    confidence: 88,
    reasons: [
      "Strong focus on Python-based AI",
      "Great for intermediate project building"
    ],
    style: "Tutorial-based, Casual",
    expertise: ["Python", "Data Science", "Web3"],
    experience: "Intermediate (8+ years)",
    popularity: "High"
  }
];

export default function RecommendationPage() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sel => sel !== id));
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedMentors = mockMentors.filter(m => selectedIds.includes(m.id));
  const unselectedMentors = mockMentors.filter(m => !selectedIds.includes(m.id));

  return (
    <div className="min-h-screen bg-[#09090B] pb-24 pt-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-success/10 text-success border border-success/20 rounded-full px-4 py-1.5 mb-6"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Analysis Complete</span>
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
            Select up to 3 mentors to build your personalized learning squad.
          </motion.p>
        </div>

        {/* Selected Mentors Header */}
        <AnimatePresence>
          {selectedMentors.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12"
            >
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                Selected Mentors ({selectedMentors.length}/3)
              </h3>
              <div className="flex flex-wrap gap-4">
                {selectedMentors.map(mentor => (
                  <motion.div
                    key={`selected-${mentor.id}`}
                    layoutId={`mentor-card-${mentor.id}`}
                    className="flex items-center space-x-3 bg-primary/10 border border-primary/30 rounded-full pl-2 pr-4 py-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      {mentor.name.charAt(0)}
                    </div>
                    <span className="text-white font-medium text-sm">{mentor.name}</span>
                    <button 
                      onClick={() => toggleSelection(mentor.id)}
                      className="ml-2 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors"
                    >
                      <Check className="w-3 h-3 text-primary" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {unselectedMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                layoutId={`mentor-card-${mentor.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-6 transition-all duration-300 border bg-[#111111] hover:border-white/20`}
              >
                {mentor.isTopMatch && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Top Match
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                  {/* Avatar & Basic Info */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-3xl font-bold text-white shadow-inner mb-4">
                      {mentor.name.charAt(0)}
                    </div>
                    <div className="flex items-center space-x-1 text-success font-bold text-xl">
                      <span>{mentor.score}%</span>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Match Score</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">{mentor.name}</h3>
                    <p className="text-primary font-medium text-sm mb-4">{mentor.profession}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start">
                        <BookOpen className="w-4 h-4 text-muted-foreground mr-2 mt-0.5" />
                        <span className="text-sm text-foreground/80">{mentor.style}</span>
                      </div>
                      <div className="flex items-start">
                        <Star className="w-4 h-4 text-muted-foreground mr-2 mt-0.5" />
                        <span className="text-sm text-foreground/80">{mentor.experience}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map(skill => (
                        <span key={skill} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-[#09090B] rounded-2xl p-4 border border-white/5 mb-6">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center">
                    <BrainCircuit className="w-3 h-3 mr-1.5" /> AI Recommendation Reasoning
                  </div>
                  <ul className="space-y-2">
                    {mentor.reasons.map((reason, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-white/30 mr-2">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Select Action */}
                <button
                  onClick={() => toggleSelection(mentor.id)}
                  disabled={selectedIds.length >= 3 && !selectedIds.includes(mentor.id)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center ${
                    selectedIds.length >= 3
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
                  }`}
                >
                  Select Mentor
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Floating Continue Action */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <button 
                onClick={() => router.push("/dashboard")}
                className="flex items-center px-8 py-4 bg-white text-black rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-all"
              >
                Continue with {selectedIds.length} Mentor{selectedIds.length > 1 ? 's' : ''}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
