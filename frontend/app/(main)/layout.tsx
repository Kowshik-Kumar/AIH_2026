"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Compass, 
  Map, 
  MessageSquare, 
  Clock, 
  Bookmark, 
  BarChart2, 
  Settings,
  BrainCircuit
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mentors", href: "/mentors", icon: Users },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Learning Paths", href: "/learning-paths", icon: Map },
  { name: "Chats", href: "/chats", icon: MessageSquare },
  { name: "History", href: "/history", icon: Clock },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#09090B] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#111111]/50 backdrop-blur-xl flex flex-col relative z-20">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">MentorSphere</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                  ${isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"}
                `}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Mini */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center bg-[#111111] border border-white/5 rounded-xl p-3 hover:border-white/20 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              U
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">User</p>
              <p className="text-xs text-muted-foreground truncate capitalize">Learner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
