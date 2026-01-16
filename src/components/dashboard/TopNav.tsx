import { Bell, Settings, LayoutDashboard, Mail, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopNavProps {
  activeTab: "dashboard" | "inbox";
  onTabChange: (tab: "dashboard" | "inbox") => void;
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
          <Zap className="w-5 h-5 text-primary" fill="currentColor" />
        </div>
        <span className="text-xl font-semibold text-foreground">Magus AI</span>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 backdrop-blur-sm">
        <button
          onClick={() => onTabChange("dashboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeTab === "dashboard"
              ? "nav-tab-active text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => onTabChange("inbox")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeTab === "inbox"
              ? "nav-tab-active text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Mail className="w-4 h-4" />
          Inbox
        </button>
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full pulse-live" />
        </button>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300">
          <Settings className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-border/50">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">Alex Chen</p>
            <p className="text-xs text-muted-foreground">Logistics Manager</p>
          </div>
          <Avatar className="w-9 h-9 ring-2 ring-primary/30">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
            <AvatarFallback className="bg-primary/20 text-primary">AC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
