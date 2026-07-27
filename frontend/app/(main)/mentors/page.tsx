"use client";

import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Shield, Book, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MentorsPage() {
  const { recommendationResult, selectedMentor, setSelectedMentor } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!recommendationResult) {
      router.push("/welcome");
    }
  }, [recommendationResult, router]);

  if (!mounted || !recommendationResult) return null;

  const allMentors = [
    recommendationResult.best_mentor,
    ...recommendationResult.alternative_mentors
  ];

  return (
    <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Mentor Directory</h1>
        <p className="text-muted-foreground">Discover expert mentors tailored to your goals and skills.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allMentors.map((mentor, idx) => {
          const isSelected = selectedMentor?.id === mentor.id;
          const isBest = mentor.id === recommendationResult.best_mentor.id;
          
          return (
            <div 
              key={mentor.id} 
              className={`
                relative bg-[#111111]/50 border rounded-2xl p-6 backdrop-blur-xl flex flex-col
                transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                ${isSelected ? "border-primary/50 shadow-primary/10" : "border-white/5 hover:border-white/20"}
              `}
            >
              {isBest && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Top Match
                </div>
              )}
              
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-xl text-white border border-white/10">
                  {mentor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{mentor.name}</h3>
                  <p className="text-sm text-primary">{mentor.title}</p>
                  <div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>4.9 (120 reviews)</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-white/60 line-clamp-3 mb-6 flex-1">
                {mentor.bio}
              </p>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise_areas.slice(0, 3).map((area) => (
                    <span key={area} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white/70">
                      {area}
                    </span>
                  ))}
                  {mentor.expertise_areas.length > 3 && (
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white/70">
                      +{mentor.expertise_areas.length - 3}
                    </span>
                  )}
                </div>

                {isSelected ? (
                  <Link href="/chats" className="w-full py-2.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message Mentor</span>
                  </Link>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedMentor(mentor);
                      router.push("/chats");
                    }}
                    className="w-full py-2.5 bg-white text-black hover:bg-white/90 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Select Mentor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
