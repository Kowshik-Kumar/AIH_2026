"use client";

import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Target, Clock, Trophy, Star } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profileData, selectedMentor } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!profileData) {
      router.push("/welcome");
    }
  }, [profileData, router]);

  if (!mounted || !profileData) return null;

  return (
    <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Ready to continue your journey towards: <span className="text-white font-medium">{profileData.user_goal}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Goal Stats */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Target} label="Current Goal" value={profileData.user_goal} small />
            <StatCard icon={Trophy} label="Experience" value={profileData.experience_level} small />
            <StatCard icon={Clock} label="Time Spent" value="12h 45m" small />
            <StatCard icon={Star} label="Avg Rating" value="4.8/5" small />
          </div>

          <div className="bg-[#111111]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary" /> Current Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {profileData.current_skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/80">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Active Mentor */}
        <div className="col-span-1">
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-white/10 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
            <h3 className="text-lg font-bold text-white mb-6">Active Mentor</h3>
            
            {selectedMentor ? (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-[2px]">
                      <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center font-bold text-xl text-white">
                        {selectedMentor.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{selectedMentor.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedMentor.title}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 line-clamp-3 mb-6">
                    {selectedMentor.bio}
                  </p>
                </div>
                
                <Link href="/chats" className="w-full flex items-center justify-center space-x-2 bg-white text-black py-3 rounded-xl font-medium hover:bg-white/90 transition-colors">
                  <span>Continue Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground mb-6">You haven't selected a mentor yet.</p>
                <Link href="/recommendation" className="px-6 py-2 bg-primary/20 text-primary rounded-xl font-medium hover:bg-primary/30 transition-colors">
                  Find a Mentor
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Mock */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { title: "Completed React Basics", time: "2 hours ago", type: "module" },
            { title: "Chat session with AI Mentor", time: "Yesterday", type: "chat" },
            { title: "Uploaded new resume", time: "3 days ago", type: "system" },
          ].map((activity, i) => (
            <div key={i} className="bg-[#111111]/30 border border-white/5 rounded-xl p-4 flex justify-between items-center hover:bg-[#111111]/50 transition-colors">
              <span className="text-white/80 text-sm">{activity.title}</span>
              <span className="text-muted-foreground text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, small = false }: any) {
  return (
    <div className="bg-[#111111]/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-bold text-white truncate ${small ? 'text-lg capitalize' : 'text-2xl'}`}>{value}</p>
    </div>
  );
}
