"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, Zap, Target } from "lucide-react";
import { useAppStore } from "@/lib/store";

const activityData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.8 },
  { day: 'Wed', hours: 1.5 },
  { day: 'Thu', hours: 4.2 },
  { day: 'Fri', hours: 2.1 },
  { day: 'Sat', hours: 5.5 },
  { day: 'Sun', hours: 3.2 },
];

const progressData = [
  { week: 'W1', score: 45 },
  { week: 'W2', score: 52 },
  { week: 'W3', score: 68 },
  { week: 'W4', score: 74 },
  { week: 'W5', score: 85 },
];

export default function AnalyticsPage() {
  const { profileData } = useAppStore();

  return (
    <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Learning Analytics</h1>
        <p className="text-muted-foreground">Track your progress towards: <span className="text-white font-medium">{profileData?.user_goal || 'your goal'}</span></p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Weekly Hours" value="22.8h" trend="+12%" />
        <StatCard icon={TrendingUp} label="Skill Growth" value="Level Up" trend="Faster" />
        <StatCard icon={Target} label="Tasks Done" value="34" trend="+5" />
        <StatCard icon={Zap} label="Current Streak" value="7 Days" trend="Best: 14" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Activity Chart */}
        <div className="bg-[#111111]/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-6">Study Hours (This Week)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="hours" fill="currentColor" className="text-primary" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-[#111111]/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-6">Skill Proficiency Over Time</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#9333ea" strokeWidth={3} dot={{ r: 4, fill: "#9333ea", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend }: any) {
  return (
    <div className="bg-[#111111]/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <div>
        <h4 className="text-2xl font-bold text-white">{value}</h4>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
