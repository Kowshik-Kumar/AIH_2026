import Link from "next/link";
import { LayoutDashboard, Users, Compass, Map, Clock, Bookmark, Settings } from "lucide-react";

export function Sidebar() {
  const routes = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Mentors", path: "/mentors", icon: Users },
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Learning Paths", path: "/paths", icon: Map },
    { name: "History", path: "/history", icon: Clock },
    { name: "Bookmarks", path: "/bookmarks", icon: Bookmark },
  ];

  return (
    <aside className="w-64 border-r border-border bg-background flex-col hidden md:flex h-full relative z-10">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-primary">MentorSphere</h1>
      </div>
      <div className="flex-1 px-4 space-y-1">
        {routes.map((route) => (
          <Link
            key={route.name}
            href={route.path}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <route.icon className="h-5 w-5" />
            <span>{route.name}</span>
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-border mt-auto">
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
