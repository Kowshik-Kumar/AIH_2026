"use client";

import { motion } from "framer-motion";
import { 
  Play, 
  Flame, 
  Target, 
  BookOpen, 
  Lightbulb, 
  MessageSquare,
  ArrowRight,
  Clock
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, User!</h1>
          <p className="text-muted-foreground">Ready to continue your AI engineering journey?</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-[#111111] border border-white/5 rounded-2xl px-4 py-2">
            <Flame className="w-5 h-5 text-orange-500 mr-2" />
            <span className="text-white font-bold">12 Day Streak</span>
          </div>
          <div className="flex items-center bg-[#111111] border border-white/5 rounded-2xl px-4 py-2">
            <Target className="w-5 h-5 text-primary mr-2" />
            <span className="text-white font-bold">45/60 Mins Today</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Continue Learning Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 to-purple-600/20 border border-white/10 p-8"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center space-x-2 text-primary font-medium text-sm mb-3">
                  <Play className="w-4 h-4 fill-current" />
                  <span>Up Next</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Understanding Transformers</h2>
                <p className="text-white/70 max-w-md text-sm">
                  Dive into the architecture of attention mechanisms and build a mini-transformer from scratch with Andrej Karpathy.
                </p>
              </div>
              <button className="flex-shrink-0 bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Resume Session
              </button>
            </div>
          </motion.div>

          {/* Grid for Topics & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upcoming Topics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111111] border border-white/5 rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Upcoming Topics
              </h3>
              <ul className="space-y-4">
                {['Self-Attention Mechanisms', 'Positional Encoding', 'GPT Architecture'].map((topic, i) => (
                  <li key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-white/20 mr-3 group-hover:bg-primary transition-colors" />
                      <span className="text-muted-foreground group-hover:text-white transition-colors">{topic}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/0 group-hover:text-primary transition-colors" />
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Learning Insights */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111111] border border-white/5 rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-success/10 rounded-full blur-[40px] pointer-events-none" />
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-success" />
                AI Insights
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                You're learning Python concepts 40% faster than average. Your AI mentor suggests focusing more on mathematical foundations before moving to deep learning to maintain this velocity.
              </p>
              <button className="text-success text-sm font-medium hover:underline">View detailed report</button>
            </motion.div>

          </div>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="space-y-6">
          
          {/* Current Mentor */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#111111] border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-4">
              A
            </div>
            <h3 className="text-xl font-bold text-white">Andrej Karpathy</h3>
            <p className="text-primary text-sm font-medium mb-4">AI Hacker & Educator</p>
            <button className="w-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-2.5 rounded-xl font-medium">
              Start Conversation
            </button>
          </motion.div>

          {/* Skill Progress */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111111] border border-white/5 rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Skill Progress</h3>
            <div className="space-y-5">
              {[
                { name: 'Python', p: 85, color: 'bg-blue-500' },
                { name: 'Machine Learning', p: 40, color: 'bg-purple-500' },
                { name: 'Linear Algebra', p: 65, color: 'bg-emerald-500' }
              ].map(skill => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/80">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.p}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.p}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Conversations */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111111] border border-white/5 rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-primary" />
              Recent Chats
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Explain Backpropagation', time: '2h ago' },
                { title: 'Best resources for PyTorch', time: 'Yesterday' }
              ].map((chat, i) => (
                <div key={i} className="flex items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                  <Clock className="w-4 h-4 text-muted-foreground mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-muted-foreground">{chat.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
