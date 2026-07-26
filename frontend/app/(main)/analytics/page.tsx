"use client";

import { motion } from "framer-motion";
import { Activity, Target, Zap, Clock, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  // Mock Data for Heatmap (7 days x 4 weeks approx)
  const heatmapData = Array.from({ length: 28 }).map(() => Math.floor(Math.random() * 4));

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Learning Analytics</h1>
        <p className="text-muted-foreground">Track your progress, velocity, and AI mentor interactions.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Learning Velocity", value: "+24%", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Mentor Usage", value: "14 hrs", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
          { title: "Goals Met", value: "8/10", icon: Target, color: "text-success", bg: "bg-success/10" },
          { title: "Current Streak", value: "12 Days", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#111111] border border-white/5 rounded-3xl p-6 flex items-center space-x-4"
          >
            <div className={`w-14 h-14 rounded-2xl ${kpi.bg} flex items-center justify-center`}>
              <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Growth Timeline (Bar Chart Simulation) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111111] border border-white/5 rounded-3xl p-6"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-white">Growth Timeline</h3>
              <select className="bg-[#09090B] border border-white/10 text-white text-sm rounded-xl px-3 py-1.5 outline-none">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
            
            <div className="h-64 flex items-end justify-between space-x-2">
              {[40, 60, 30, 80, 100, 50, 70, 90, 60, 85].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-md relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}h
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-muted-foreground border-t border-white/5 pt-4">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </motion.div>

          {/* Activity Heatmap */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111111] border border-white/5 rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6">Learning Heatmap</h3>
            <div className="flex space-x-2">
              <div className="flex flex-col justify-between text-xs text-muted-foreground py-1 pr-2">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>
              <div className="flex-1 grid grid-cols-7 gap-2">
                {heatmapData.map((level, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`aspect-square rounded-md ${
                      level === 0 ? "bg-white/5" :
                      level === 1 ? "bg-primary/30" :
                      level === 2 ? "bg-primary/60" :
                      "bg-primary"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          
          {/* Conversation Topics (Doughnut Simulation) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#111111] border border-white/5 rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6">Conversation Topics</h3>
            
            <div className="relative w-48 h-48 mx-auto mb-6">
              {/* Fake SVG Doughnut */}
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="40 60" />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="30 70" strokeDashoffset="-40" />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-70" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">124</span>
                <span className="text-xs text-muted-foreground">Prompts</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Python/Code", color: "bg-blue-500", val: "40%" },
                { label: "Theory/Math", color: "bg-purple-500", val: "30%" },
                { label: "Career Advice", color: "bg-emerald-500", val: "20%" },
                { label: "Other", color: "bg-white/20", val: "10%" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${item.color}`} />
                    <span className="text-white/80">{item.label}</span>
                  </div>
                  <span className="text-white font-medium">{item.val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Insights Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-3xl p-6"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-white">Velocity Insight</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              Your engagement with interactive coding tasks is yielding higher retention compared to video lectures. 
            </p>
            <button className="text-primary text-sm font-bold flex items-center hover:underline">
              Adjust Learning Path
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
