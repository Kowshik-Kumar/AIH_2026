"use client";

import { Search, TrendingUp, Code, Laptop, Database, Globe } from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "Frontend Development", icon: Globe, count: 1250 },
  { name: "Backend Architecture", icon: Database, count: 850 },
  { name: "Machine Learning", icon: Code, count: 620 },
  { name: "System Design", icon: Laptop, count: 430 },
];

const trendingTopics = [
  { title: "Mastering React 19 Compiler", mentor: "Sarah J.", views: "12k" },
  { title: "Building RAG applications with LangChain", mentor: "Alex K.", views: "8.5k" },
  { title: "Advanced System Design for Interviews", mentor: "David M.", views: "15k" },
  { title: "The ultimate guide to Next.js App Router", mentor: "Elena P.", views: "10k" },
];

export default function ExplorePage() {
  return (
    <div className="p-8 pb-20 space-y-10 animate-in fade-in duration-700">
      
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Explore</h1>
          <p className="text-muted-foreground">Discover new learning paths, mentors, and trending tech.</p>
        </div>
        <div className="w-full md:w-72 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input 
            type="text" 
            placeholder="Search for skills, mentors..." 
            className="w-full bg-[#111111]/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.name} className="bg-[#111111]/30 border border-white/5 rounded-2xl p-5 hover:bg-[#111111]/80 transition-colors cursor-pointer group">
              <category.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-medium mb-1">{category.name}</h3>
              <p className="text-xs text-muted-foreground">{category.count} resources</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-white">Trending Topics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trendingTopics.map((topic, idx) => (
            <div key={idx} className="bg-gradient-to-r from-[#111111]/80 to-[#1a1a1a]/80 border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all flex justify-between items-center cursor-pointer">
              <div>
                <h3 className="text-white font-medium mb-2">{topic.title}</h3>
                <p className="text-sm text-muted-foreground">Mentored by {topic.mentor}</p>
              </div>
              <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {topic.views} views
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended for you mock */}
      <section>
        <div className="bg-gradient-to-br from-primary/10 via-purple-600/10 to-transparent border border-white/10 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Want personalized recommendations?</h2>
            <p className="text-white/70 mb-6">Take our AI-powered assessment to find the perfect learning path and mentor tailored exactly to your skill level and goals.</p>
            <Link href="/recommendation" className="px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors inline-block">
              Get Matched
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
