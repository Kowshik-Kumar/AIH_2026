"use client";

import { useAppStore } from "@/lib/store";
import { User, Bell, Shield, PaintBucket, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { profileData, reset } = useAppStore();
  const router = useRouter();

  const handleLogout = () => {
    reset();
    router.push("/welcome");
  };

  return (
    <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="col-span-1 space-y-1">
          <SettingsTab icon={User} label="Profile" active />
          <SettingsTab icon={Bell} label="Notifications" />
          <SettingsTab icon={Shield} label="Privacy & Security" />
          <SettingsTab icon={PaintBucket} label="Appearance" />
        </div>

        {/* Content */}
        <div className="col-span-1 md:col-span-3 space-y-8">
          
          <section className="bg-[#111111]/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-[2px]">
                  <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center font-bold text-2xl text-white">
                    U
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/5 text-white hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">
                  Change Avatar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                  <input type="text" defaultValue="User Name" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <input type="email" defaultValue="user@example.com" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Current Goal</label>
                <input type="text" defaultValue={profileData?.user_goal || ""} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" />
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <button className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors">
                Save Changes
              </button>
            </div>
          </section>

          <section className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-muted-foreground mb-6 text-sm">Irreversible actions for your account.</p>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-white font-medium">Log out of this session</h4>
                <p className="text-muted-foreground text-sm">This will clear your current profile and chat history.</p>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-medium flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon: Icon, label, active = false }: any) {
  return (
    <button className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
