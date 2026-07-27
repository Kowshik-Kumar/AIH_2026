"use client";

import { Bookmark, ExternalLink, Code as CodeIcon, FileText, Trash2 } from "lucide-react";
import Link from "next/link";

const bookmarks = [
  {
    id: 1,
    title: "Understanding React Server Components",
    type: "article",
    source: "Mentor Session: Elena P.",
    date: "2 days ago",
    content: "A great breakdown of how RSCs differ from traditional SSR and when to use them.",
    link: "#",
  },
  {
    id: 2,
    title: "System Design Framework",
    type: "snippet",
    source: "Mentor Session: David M.",
    date: "1 week ago",
    content: "1. Requirements Clarification\n2. Back-of-the-envelope Estimation\n3. System Interface Definition\n4. Defining Data Model\n5. High-level Design\n6. Detailed Design\n7. Bottlenecks",
  },
  {
    id: 3,
    title: "Optimizing PostgreSQL Queries",
    type: "article",
    source: "Mentor Session: Alex K.",
    date: "2 weeks ago",
    content: "Always use EXPLAIN ANALYZE to understand the query plan before adding indexes.",
    link: "#",
  },
];

export default function BookmarksPage() {
  return (
    <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Bookmark className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-white">Bookmarks</h1>
          </div>
          <p className="text-muted-foreground">Saved insights, code snippets, and resources from your mentors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="bg-[#111111]/50 border border-white/5 rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/5 rounded-lg text-primary">
                {bookmark.type === 'snippet' ? <CodeIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <button className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="font-bold text-white text-lg mb-2">{bookmark.title}</h3>
            
            {bookmark.type === 'snippet' ? (
              <pre className="bg-black/50 p-3 rounded-xl text-xs text-green-400 font-mono mb-4 overflow-x-auto border border-white/5">
                {bookmark.content}
              </pre>
            ) : (
              <p className="text-sm text-white/70 mb-4 line-clamp-3">
                {bookmark.content}
              </p>
            )}

            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <p>{bookmark.source}</p>
                <p>{bookmark.date}</p>
              </div>
              
              {bookmark.link && (
                <Link href={bookmark.link} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {bookmarks.length === 0 && (
        <div className="text-center py-20 bg-[#111111]/30 border border-white/5 rounded-3xl">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-white mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground">Save important messages and resources during your chats to see them here.</p>
        </div>
      )}
    </div>
  );
}
