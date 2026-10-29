"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  LayoutDashboard,
  PieChart,
  CalendarDays,
  Store,
  Lightbulb,
  Users,
  Download,
  Settings,
  Plus,
  Sun,
  Moon,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import { NavTab } from "@/components/layout/Sidebar";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenWizard: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navigation" | "Actions" | "Tasks" | "Vendors";
  icon: React.ComponentType<{ className?: string }>;
  perform: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onOpenWizard,
}: CommandPaletteProps) {
  const { activeEvent, settings, updateSettings, resetToDemoData, toggleTaskCompletion } = useUtsav();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via document event or props
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Build commands
  const allCommands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Navigation
      {
        id: "nav-overview",
        title: "Go to Dashboard Overview",
        category: "Navigation",
        icon: LayoutDashboard,
        perform: () => {
          onSelectTab("overview");
          onClose();
        },
      },
      {
        id: "nav-budget",
        title: "Go to Budget & Expenses",
        category: "Navigation",
        icon: PieChart,
        perform: () => {
          onSelectTab("budget");
          onClose();
        },
      },
      {
        id: "nav-timeline",
        title: "Go to Timeline & Schedule",
        category: "Navigation",
        icon: CalendarDays,
        perform: () => {
          onSelectTab("timeline");
          onClose();
        },
      },
      {
        id: "nav-vendors",
        title: "Go to Vendor Directory",
        category: "Navigation",
        icon: Store,
        perform: () => {
          onSelectTab("vendors");
          onClose();
        },
      },
      {
        id: "nav-ideas",
        title: "Go to AI Ideas Studio",
        category: "Navigation",
        icon: Lightbulb,
        perform: () => {
          onSelectTab("ideas");
          onClose();
        },
      },
      {
        id: "nav-guests",
        title: "Go to Guest Tracker",
        category: "Navigation",
        icon: Users,
        perform: () => {
          onSelectTab("guests");
          onClose();
        },
      },
      {
        id: "nav-export",
        title: "Go to Export & Print Summary",
        category: "Navigation",
        icon: Download,
        perform: () => {
          onSelectTab("export");
          onClose();
        },
      },
      {
        id: "nav-settings",
        title: "Go to Preferences & Settings",
        category: "Navigation",
        icon: Settings,
        perform: () => {
          onSelectTab("settings");
          onClose();
        },
      },

      // Actions
      {
        id: "act-create",
        title: "Create New Celebration Masterplan",
        subtitle: "Launch the 3-step AI wizard",
        category: "Actions",
        icon: Plus,
        perform: () => {
          onClose();
          onOpenWizard();
        },
      },
      {
        id: "act-theme",
        title: `Switch Theme to ${settings.theme === "dark" ? "Light" : "Dark"}`,
        category: "Actions",
        icon: settings.theme === "dark" ? Sun : Moon,
        perform: () => {
          updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
          onClose();
        },
      },
      {
        id: "act-demo",
        title: "Load Sample Royal Jaipur Wedding",
        subtitle: "Aarav & Meera full celebration",
        category: "Actions",
        icon: RotateCcw,
        perform: () => {
          resetToDemoData();
          onClose();
        },
      },
      {
        id: "act-print",
        title: "Print or Save as PDF",
        subtitle: "Opens browser print dialog",
        category: "Actions",
        icon: Download,
        perform: () => {
          onClose();
          setTimeout(() => window.print(), 200);
        },
      },
    ];

    // Search tasks in active event
    if (activeEvent?.timeline) {
      for (const t of activeEvent.timeline) {
        items.push({
          id: `task-${t.id}`,
          title: t.title,
          subtitle: `${t.phase} • ${t.completed ? "Completed" : "Pending"}`,
          category: "Tasks",
          icon: CheckCircle,
          perform: () => {
            toggleTaskCompletion(t.id);
            onSelectTab("timeline");
            onClose();
          },
        });
      }
    }

    // Search vendors in active event
    if (activeEvent?.vendors) {
      for (const v of activeEvent.vendors) {
        items.push({
          id: `ven-${v.id}`,
          title: v.name,
          subtitle: `${v.category} • Status: ${v.status}`,
          category: "Vendors",
          icon: Store,
          perform: () => {
            onSelectTab("vendors");
            onClose();
          },
        });
      }
    }

    return items;
  }, [
    activeEvent,
    settings.theme,
    onSelectTab,
    onClose,
    onOpenWizard,
    updateSettings,
    resetToDemoData,
    toggleTaskCompletion,
  ]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands.slice(0, 14);
    const q = query.toLowerCase();
    return allCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q),
    );
  }, [query, allCommands]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredCommands.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current) current.perform();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-plum-950/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl rounded-2xl bg-gradient-to-b from-plum-900 to-plum-950 border border-plum-700/60 shadow-elevation-3 overflow-hidden text-ivory-100"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-plum-800/80">
          <Search className="w-5 h-5 text-saffron-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, task, vendor, or tab..."
            className="w-full bg-transparent text-sm text-ivory-100 placeholder:text-ivory-400/50 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-plum-950 border border-plum-700 text-[10px] text-ivory-400">
            Esc
          </kbd>
        </div>

        {/* Command List */}
        <div role="listbox" className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-ivory-400">
              No matching commands or celebration items found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={cmd.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => cmd.perform()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-plum-800 text-saffron-300 font-semibold"
                      : "text-ivory-200 hover:bg-plum-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? "text-saffron-400" : "text-ivory-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm">{cmd.title}</p>
                      {cmd.subtitle && (
                        <p className="truncate text-[11px] text-ivory-400/80 font-normal">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-semibold text-ivory-400/60 px-1.5 py-0.5 rounded bg-plum-950/60 border border-plum-800 shrink-0 ml-2">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-plum-800/80 bg-plum-950/60 text-[11px] text-ivory-400">
          <span>Use ↑ and ↓ to navigate</span>
          <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  );
}

