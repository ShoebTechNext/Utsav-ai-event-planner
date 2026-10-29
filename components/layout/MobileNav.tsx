"use client";

import React from "react";
import {
  LayoutDashboard,
  PieChart,
  CalendarDays,
  Store,
  Lightbulb,
  Users,
} from "lucide-react";
import { NavTab } from "./Sidebar";

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export function MobileNav({ currentTab, onSelectTab }: MobileNavProps) {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "overview", label: "Home", icon: LayoutDashboard },
    { id: "budget", label: "Budget", icon: PieChart },
    { id: "timeline", label: "Timeline", icon: CalendarDays },
    { id: "vendors", label: "Vendors", icon: Store },
    { id: "ideas", label: "Ideas", icon: Lightbulb },
    { id: "guests", label: "Guests", icon: Users },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-plum-950/95 border-t border-plum-800/60 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 min-w-[44px] h-[52px] rounded-lg transition-colors relative ${
                isActive ? "text-saffron-300 font-semibold" : "text-ivory-400 hover:text-ivory-200"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? "text-saffron-400 scale-110" : ""
                }`}
              />
              <span className="text-[10px] mt-1 truncate">{tab.label}</span>

              {isActive && (
                <span
                  className="absolute top-1 w-1 h-1 rounded-full bg-saffron-400 shadow-[0_0_6px_#FFB000]"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

