"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  Plus,
  Command,
  Sun,
  Moon,
  Laptop,
  Check,
  Calendar,
  Flame,
} from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import { EventType } from "@/types";

interface HeaderProps {
  onOpenWizard: () => void;
  onOpenCommandPalette: () => void;
}

export function Header({ onOpenWizard, onOpenCommandPalette }: HeaderProps) {
  const { events, activeEvent, setActiveEvent, settings, updateSettings, aiMode } = useUtsav();
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const eventMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Esc
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsEventDropdownOpen(false);
        setIsThemeDropdownOpen(false);
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (eventMenuRef.current && !eventMenuRef.current.contains(e.target as Node)) {
        setIsEventDropdownOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getEventBadgeColor = (type?: EventType) => {
    switch (type) {
      case "wedding":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "birthday":
        return "bg-saffron-500/20 text-saffron-300 border-saffron-500/30";
      case "community":
        return "bg-plum-500/30 text-plum-200 border-plum-400/30";
      default:
        return "bg-white/10 text-ivory-200 border-white/20";
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-plum-800/40 bg-plum-950/75 backdrop-blur-xl transition-colors">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 max-w-7xl mx-auto gap-3">
        {/* Brand & Active Event */}
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-plum-700 to-saffron-500 p-0.5 flex items-center justify-center shadow-glass-glow">
              <div className="w-full h-full bg-plum-950 rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-saffron-400 fill-saffron-400/30 animate-pulse-glow" aria-hidden="true" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-bold tracking-tight text-ivory-100 flex items-center gap-1.5">
                Utsav
                <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-saffron-400 bg-saffron-500/10 border border-saffron-500/20 px-1.5 py-0.5 rounded">
                  AI
                </span>
              </span>
            </div>
          </div>

          {/* Event Switcher Dropdown */}
          <div className="relative" ref={eventMenuRef}>
            <button
              type="button"
              onClick={() => setIsEventDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isEventDropdownOpen}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-plum-900/60 hover:bg-plum-900 border border-plum-700/50 text-ivory-100 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-saffron-400 max-w-[200px] sm:max-w-xs truncate"
            >
              <Calendar className="w-4 h-4 text-saffron-400 shrink-0" aria-hidden="true" />
              <span className="truncate">{activeEvent?.name || "Select Event"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-ivory-400 shrink-0" aria-hidden="true" />
            </button>

            {isEventDropdownOpen && (
              <div
                role="listbox"
                className="absolute left-0 mt-2 w-72 rounded-xl bg-plum-950/95 border border-plum-700/60 shadow-elevation-3 backdrop-blur-xl p-1.5 z-50 flex flex-col gap-1"
              >
                <div className="px-2.5 py-1.5 text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Switch Celebration
                </div>
                {events.map((event) => {
                  const isSelected = event.id === activeEvent?.id;
                  return (
                    <button
                      key={event.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setActiveEvent(event.id);
                        setIsEventDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-plum-800 text-saffron-300 font-medium"
                          : "text-ivory-200 hover:bg-plum-900/70 hover:text-ivory-100"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{event.name}</div>
                        <div className="text-xs text-ivory-400 flex items-center gap-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] border ${getEventBadgeColor(event.type)}`}>
                            {event.type}
                          </span>
                          <span>• {event.city}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-saffron-400 shrink-0" />}
                    </button>
                  );
                })}

                <div className="my-1 border-t border-plum-800/80" />

                <button
                  type="button"
                  onClick={() => {
                    setIsEventDropdownOpen(false);
                    onOpenWizard();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm text-saffron-400 hover:bg-saffron-500/10 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Celebration</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* AI Mode Badge */}
          <div
            title={aiMode.mode === "live" ? `Powered by Live ${aiMode.provider}` : "Simulated Zero-Config Demo Mode"}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              aiMode.mode === "live"
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-saffron-500/10 text-saffron-300 border-saffron-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                aiMode.mode === "live" ? "bg-emerald-400 animate-pulse" : "bg-saffron-400"
              }`}
            />
            <span>{aiMode.mode === "live" ? "Live AI Active" : "Demo Mode"}</span>
          </div>

          {/* Command Palette Button */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-plum-900/50 hover:bg-plum-900 border border-plum-700/40 text-ivory-300 hover:text-ivory-100 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-saffron-400"
            aria-label="Open command palette (Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Commands</span>
            <kbd className="hidden md:inline px-1 py-0.5 bg-plum-950/80 border border-plum-700 rounded text-[10px]">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => setIsThemeDropdownOpen((prev) => !prev)}
              aria-label="Change theme"
              className="p-2 rounded-lg bg-plum-900/50 hover:bg-plum-900 border border-plum-700/40 text-ivory-300 hover:text-ivory-100 transition-colors focus:outline-none focus:ring-2 focus:ring-saffron-400"
            >
              {settings.theme === "dark" && <Moon className="w-4 h-4 text-saffron-400" />}
              {settings.theme === "light" && <Sun className="w-4 h-4 text-saffron-500" />}
              {settings.theme === "system" && <Laptop className="w-4 h-4 text-ivory-300" />}
            </button>

            {isThemeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-plum-950 border border-plum-700/60 shadow-elevation-3 backdrop-blur-xl p-1 z-50 flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ theme: "dark" });
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                    settings.theme === "dark" ? "bg-plum-800 text-saffron-300 font-semibold" : "text-ivory-200 hover:bg-plum-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-saffron-400" /> Dark
                  </span>
                  {settings.theme === "dark" && <Check className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ theme: "light" });
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                    settings.theme === "light" ? "bg-plum-800 text-saffron-300 font-semibold" : "text-ivory-200 hover:bg-plum-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-saffron-500" /> Light
                  </span>
                  {settings.theme === "light" && <Check className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ theme: "system" });
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                    settings.theme === "system" ? "bg-plum-800 text-saffron-300 font-semibold" : "text-ivory-200 hover:bg-plum-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5 text-ivory-300" /> System
                  </span>
                  {settings.theme === "system" && <Check className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>

          {/* New Plan Button */}
          <button
            type="button"
            onClick={onOpenWizard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 via-rose-500 to-saffron-500 text-plum-950 font-semibold text-xs tracking-wide shadow-glass hover:brightness-110 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-400"
          >
            <Sparkles className="w-3.5 h-3.5 fill-plum-950" aria-hidden="true" />
            <span>Plan Celebration</span>
          </button>
        </div>
      </div>
    </header>
  );
}

