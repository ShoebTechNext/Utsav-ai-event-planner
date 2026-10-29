"use client";

import React from "react";
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import { CountdownFlip } from "@/components/ui/CountdownFlip";
import { ReadinessRing } from "@/components/ui/ReadinessRing";
import { TiltCard } from "@/components/effects/TiltCard";
import { formatINR, calculateBudgetTotals } from "@/lib/budget/math";
import { formatDatePretty } from "@/lib/utils/date";
import { NavTab } from "@/components/layout/Sidebar";

interface HomeOverviewProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenWizard: () => void;
}

export function HomeOverview({ onSelectTab, onOpenWizard }: HomeOverviewProps) {
  const { activeEvent, toggleTaskCompletion } = useUtsav();

  if (!activeEvent) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-ivory-100">
          No Celebration Active
        </h2>
        <p className="text-sm text-ivory-300 mt-2">
          Create a new event or load the sample royal wedding.
        </p>
        <button
          type="button"
          onClick={onOpenWizard}
          className="mt-4 px-5 py-2.5 rounded-xl bg-saffron-500 text-plum-950 font-bold"
        >
          Start Planning
        </button>
      </div>
    );
  }

  const { totalBudget, totalSpent, remaining, percentSpent } = calculateBudgetTotals(
    activeEvent.categories,
    activeEvent.totalBudget,
  );

  const completedTasks = activeEvent.timeline.filter((t) => t.completed).length;
  const totalTasks = activeEvent.timeline.length;
  const readinessPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Next 3 pending tasks
  const nextTasks = activeEvent.timeline.filter((t) => !t.completed).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner: Celebration Headline + Flip Countdown */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-plum-950 via-plum-900 to-rose-950/80 border border-plum-700/60 shadow-glass overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-saffron-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/30 text-saffron-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 fill-saffron-400" />
              <span>{activeEvent.type.toUpperCase()} CELEBRATION</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold text-ivory-100 tracking-tight leading-tight">
              {activeEvent.name}
            </h1>

            <p className="text-sm text-ivory-300/90 mt-2 flex items-center gap-2 flex-wrap">
              <span>{formatDatePretty(activeEvent.date)}</span>
              <span>•</span>
              <span>{activeEvent.city}</span>
              <span>•</span>
              <span>{activeEvent.guestCount} Guests</span>
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {activeEvent.vibe.map((v) => (
                <span
                  key={v}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-plum-800/80 border border-plum-600/50 text-ivory-200"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* Flip-digit Countdown */}
          <div className="shrink-0">
            <p className="text-xs font-semibold text-ivory-300 mb-2 uppercase tracking-wider">
              Countdown to Muhurat
            </p>
            <CountdownFlip eventDate={activeEvent.date} />
          </div>
        </div>
      </div>

      {/* Grid: 3 Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Readiness Ring Card */}
        <TiltCard className="p-5 flex items-center gap-5">
          <ReadinessRing
            percentage={readinessPercent}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
          />
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-ivory-100">
              Celebration Readiness
            </h3>
            <p className="text-xs text-ivory-300 mt-1">
              {completedTasks} of {totalTasks} milestones completed
            </p>
            <button
              type="button"
              onClick={() => onSelectTab("timeline")}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-400 hover:text-saffron-300"
            >
              <span>View Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </TiltCard>

        {/* Budget Summary Card */}
        <TiltCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-ivory-400 mb-1">
              <span>Total Budget</span>
              <span className="font-semibold text-saffron-400">{percentSpent}% committed</span>
            </div>
            <p className="font-display text-2xl font-bold text-ivory-100">
              {formatINR(totalBudget)}
            </p>

            <div className="w-full bg-plum-950/80 h-2 rounded-full overflow-hidden mt-3 border border-plum-800">
              <div
                style={{ width: `${percentSpent}%` }}
                className="h-full bg-gradient-to-r from-saffron-500 to-rose-500 rounded-full transition-all duration-500"
              />
            </div>

            <div className="flex justify-between items-center text-xs mt-3">
              <span className="text-ivory-300">
                Spent: <span className="font-semibold text-ivory-100">{formatINR(totalSpent)}</span>
              </span>
              <span className="text-ivory-300">
                Left: <span className="font-semibold text-emerald-400">{formatINR(remaining)}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab("budget")}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-400 hover:text-saffron-300"
          >
            <span>Manage Budget Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </TiltCard>

        {/* Guest & Vendor Counter Card */}
        <TiltCard className="p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs text-ivory-400">Atithi & Vendors</span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded-xl bg-plum-950/60 border border-plum-800/80">
                <span className="text-[11px] text-ivory-400">Guests Confirmed</span>
                <p className="text-xl font-bold text-saffron-300 mt-0.5">
                  {activeEvent.guests.confirmed} / {activeEvent.guestCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-plum-950/60 border border-plum-800/80">
                <span className="text-[11px] text-ivory-400">Vendors Booked</span>
                <p className="text-xl font-bold text-rose-300 mt-0.5">
                  {activeEvent.vendors.filter((v) => v.status === "booked").length} /{" "}
                  {activeEvent.vendors.length}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => onSelectTab("guests")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-400 hover:text-saffron-300"
            >
              <span>Guests</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("vendors")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              <span>Vendors</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </TiltCard>
      </div>

      {/* Two Column Section: Upcoming Tasks & Cultural Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Next 3 Tasks (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-plum-900/40 border border-plum-700/50 backdrop-blur-md shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-ivory-100">
                Next Critical Milestones
              </h2>
              <p className="text-xs text-ivory-300">Focus on these upcoming event tasks</p>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab("timeline")}
              className="text-xs font-semibold text-saffron-400 hover:underline"
            >
              View All ({activeEvent.timeline.length})
            </button>
          </div>

          {nextTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-ivory-400">
              🎉 All planned tasks have been completed!
            </div>
          ) : (
            <div className="space-y-3">
              {nextTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-plum-950/60 border border-plum-800/80 hover:border-plum-700 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="mt-0.5 w-5 h-5 rounded-md border border-plum-600 hover:border-saffron-400 flex items-center justify-center text-transparent hover:text-saffron-400 transition-colors shrink-0 focus:outline-none focus:ring-1 focus:ring-saffron-400"
                      aria-label={`Mark task completed: ${task.title}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ivory-100 truncate">{task.title}</p>
                      <p className="text-xs text-ivory-300/80 line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[11px] font-medium text-saffron-400">
                      Due {formatDatePretty(task.dueDate)}
                    </span>
                    <div className="text-[10px] text-ivory-400 uppercase tracking-wider mt-0.5">
                      {task.phase}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI & Cultural Inspiration (1 Col) */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-plum-950 via-plum-900 to-rose-950/60 border border-plum-700/50 backdrop-blur-md shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-saffron-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 fill-saffron-400" />
              <span>Utsav AI Director&apos;s Tip</span>
            </div>

            <h3 className="font-display text-base font-bold text-ivory-100">
              Sustainable Fragrance & Lighting
            </h3>

            <p className="text-xs text-ivory-200/85 leading-relaxed mt-2">
              Infuse your venue with the warmth of brass urlis and locally-sourced tuberose (rajnigandha).
              Post-event, partner with local floral upcyclers to compost holy blossoms into organic incense!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-plum-800/80 flex items-center justify-between">
            <span className="text-[11px] text-ivory-400">Explore creative ideas</span>
            <button
              type="button"
              onClick={() => onSelectTab("ideas")}
              className="px-3 py-1.5 rounded-lg bg-saffron-500 hover:bg-saffron-400 text-plum-950 text-xs font-bold transition-colors"
            >
              Open Ideas Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

