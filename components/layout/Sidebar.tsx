"use client";

import React from "react";
import {
  LayoutDashboard,
  PieChart,
  CalendarDays,
  Store,
  Lightbulb,
  Users,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import { getDaysRemaining } from "@/lib/utils/date";

export type NavTab =
  | "overview"
  | "budget"
  | "timeline"
  | "vendors"
  | "ideas"
  | "guests"
  | "export"
  | "settings";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { activeEvent } = useUtsav();
  const daysLeft = activeEvent ? getDaysRemaining(activeEvent.date) : 0;

  const navItems: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "budget", label: "Budget & Costs", icon: PieChart },
    { id: "timeline", label: "Timeline & Tasks", icon: CalendarDays },
    { id: "vendors", label: "Vendor Directory", icon: Store },
    { id: "ideas", label: "AI Ideas Studio", icon: Lightbulb },
    { id: "guests", label: "Guest Tracker", icon: Users },
    { id: "export", label: "Export & Print", icon: Download },
    { id: "settings", label: "Preferences", icon: Settings },
  ];

  return (
    <aside
      aria-label="Dashboard Navigation"
      className={`hidden md:flex flex-col border-r border-plum-800/40 bg-plum-950/80 backdrop-blur-xl transition-all duration-300 relative z-20 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Event summary banner (when expanded) */}
      {!isCollapsed && activeEvent && (
        <div className="p-4 mx-3 mt-3 rounded-xl bg-gradient-to-br from-plum-900/70 to-rose-950/40 border border-plum-700/40">
          <div className="flex items-center gap-2 text-saffron-400 text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-saffron-400" />
            <span>Celebration In</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-display font-bold text-ivory-100">
              {daysLeft > 0 ? daysLeft : "Today"}
            </span>
            <span className="text-xs text-ivory-300">
              {daysLeft > 0 ? "days left" : "is the day!"}
            </span>
          </div>
          <p className="text-[11px] text-ivory-400/80 truncate mt-0.5">{activeEvent.city}</p>
        </div>
      )}

      {/* Navigation items */}
      <nav className="flex-1 px-2.5 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? "bg-gradient-to-r from-saffron-500/20 via-rose-500/10 to-transparent text-saffron-300 font-semibold border-l-2 border-saffron-400"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-plum-900/50"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform ${
                  isActive ? "text-saffron-400 scale-105" : "text-ivory-400 group-hover:text-ivory-200"
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {/* Shared layout active glow indicator */}
              {isActive && (
                <span
                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-saffron-400 shadow-[0_0_8px_#FFB000]"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse / Expand toggle button */}
      <div className="p-3 border-t border-plum-800/40">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-ivory-400 hover:text-ivory-100 hover:bg-plum-900/60 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}

