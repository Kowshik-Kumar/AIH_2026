"use client";

import { Clock, MessageSquare, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

const historySessions = [
  {
    id: 1,
    mentor: "Sarah J.",
    topic: "React Context vs Redux",
    date: "Today, 2:30 PM",
    messages: 24,
    status: "completed",
  },
  {
    id: 2,
    mentor: "Alex K.",
    topic: "System Design: URL Shortener",
    date: "Yesterday, 10:15 AM",
    messages: 45,
    status: "completed",
  },
  {
    id: 3,
    mentor: "Elena P.",
    topic: "Next.js App Router Data Fetching",
    date: "July 24, 2026",
    messages: 12,
    status: "completed",
  },
  {
    id: 4,
    mentor: "Sarah J.",
    topic: "CSS Grid Masterclass",
    date: "July 22, 2026",
    messages: 38,
    status: "completed",
  },
];

export default function HistoryPage() {
  return (
    <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      <div className="flex items-center space-x-3 mb-2">
        <Clock className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-white">Session History</h1>
      </div>
      <p className="text-muted-foreground mb-8">Review your past mentoring sessions and pick up where you left off.</p>

      <div className="bg-[#111111]/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-sm font-medium text-muted-foreground uppercase tracking-wider bg-black/20">
          <div className="col-span-5 pl-4">Topic & Mentor</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-3">Interaction</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-white/5">
          {historySessions.map((session) => (
            <Link 
              key={session.id} 
              href="/chats"
              className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group cursor-pointer"
            >
              <div className="col-span-5 pl-4 flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-primary font-bold">{session.mentor.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-primary transition-colors">{session.topic}</h3>
                  <p className="text-sm text-muted-foreground">with {session.mentor}</p>
                </div>
              </div>
              
              <div className="col-span-3 flex items-center space-x-2 text-sm text-white/70">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{session.date}</span>
              </div>
              
              <div className="col-span-3 flex items-center space-x-2 text-sm text-white/70">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span>{session.messages} messages</span>
              </div>
              
              <div className="col-span-1 flex justify-end pr-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
