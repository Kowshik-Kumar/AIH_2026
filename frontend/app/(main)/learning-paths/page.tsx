"use client";

import { motion } from "framer-motion";
import { Check, Lock, Play, Clock, TrendingUp } from "lucide-react";

export default function LearningPathPage() {
  const nodes = [
    {
      title: "Python Fundamentals",
      description: "Variables, data structures, loops, and functions.",
      status: "completed",
      duration: "2 Weeks"
    },
    {
      title: "Linear Algebra & Calculus Basics",
      description: "Vectors, matrices, derivatives, and gradients.",
      status: "completed",
      duration: "3 Weeks"
    },
    {
      title: "Introduction to Neural Networks",
      description: "Perceptrons, forward propagation, and activation functions.",
      status: "in-progress",
      duration: "2 Weeks",
      progress: 65
    },
    {
      title: "Backpropagation & Optimization",
      description: "Gradient descent, Adam optimizer, and loss functions.",
      status: "locked",
      duration: "2 Weeks"
    },
    {
      title: "Transformers & Attention",
      description: "Self-attention, multi-head attention, and encoder-decoder.",
      status: "locked",
      duration: "4 Weeks"
    }
  ];

  return (
    <div className="p-8 pb-24 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white">AI Engineer Track</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Learning Roadmap</h1>
          <p className="text-muted-foreground text-lg">Estimated completion: 13 Weeks</p>
        </div>

        <div className="relative z-10 bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center space-x-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Weekly Goal</p>
            <div className="flex items-end space-x-2">
              <span className="text-2xl font-bold text-white">4.5</span>
              <span className="text-sm text-muted-foreground mb-1">/ 5 hrs</span>
            </div>
          </div>
          <div className="w-16 h-16 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="text-white/10"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary"
                strokeDasharray="90, 100"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">90%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="relative">
        {/* Continuous Line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-gradient-to-b from-success via-primary to-white/10 rounded-full" />

        <div className="space-y-8">
          {nodes.map((node, index) => {
            const isCompleted = node.status === "completed";
            const isInProgress = node.status === "in-progress";
            const isLocked = node.status === "locked";

            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start group"
              >
                {/* Timeline Icon */}
                <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-[#09090B] transition-colors ${
                  isCompleted ? "bg-success text-white" :
                  isInProgress ? "bg-primary text-white" :
                  "bg-[#111111] text-muted-foreground border-white/10"
                }`}>
                  {isCompleted && <Check className="w-6 h-6" />}
                  {isInProgress && <Play className="w-6 h-6 ml-1" />}
                  {isLocked && <Lock className="w-5 h-5" />}
                  
                  {/* Pulse effect for in-progress */}
                  {isInProgress && (
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Node Card */}
                <div className={`ml-8 flex-1 rounded-3xl p-6 transition-all duration-300 ${
                  isLocked ? "bg-transparent border border-white/5 opacity-60" :
                  isInProgress ? "bg-[#111111] border border-primary/30 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]" :
                  "bg-[#111111] border border-white/5 hover:border-white/20"
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h3 className={`text-xl font-bold ${isLocked ? 'text-muted-foreground' : 'text-white'}`}>
                      {node.title}
                    </h3>
                    <div className="flex items-center text-sm font-medium mt-2 md:mt-0 text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {node.duration}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    {node.description}
                  </p>

                  {isInProgress && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium text-white mb-2">
                        <span>Progress</span>
                        <span>{node.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${node.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-primary rounded-full relative"
                        >
                          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                        </motion.div>
                      </div>
                      <div className="mt-6">
                        <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                          Continue Learning
                        </button>
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Lock className="w-3 h-3 mr-1.5" />
                        Complete previous modules to unlock
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
