"use client";

import React from "react";
import { UserCheck, UserX, Mail, Plus, Minus } from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import { formatINR, calculateBudgetTotals, calculatePerGuestCost } from "@/lib/budget/math";

export function GuestsSection() {
  const { activeEvent, updateActiveEvent } = useUtsav();

  if (!activeEvent) return null;

  const guests = activeEvent.guests;
  const totals = calculateBudgetTotals(activeEvent.categories, activeEvent.totalBudget);

  // Per-guest budget based on confirmed guests (if > 0, else total invited)
  const baseCount = guests.confirmed > 0 ? guests.confirmed : guests.invited;
  const perGuestSpent = calculatePerGuestCost(totals.totalSpent, baseCount);
  const perGuestAllocated = calculatePerGuestCost(totals.totalBudget, baseCount);

  const updateGuests = (partial: Partial<typeof guests>) => {
    updateActiveEvent((prev) => ({
      ...prev,
      guests: { ...prev.guests, ...partial },
    }));
  };

  const attendanceRate =
    guests.invited > 0 ? Math.round((guests.confirmed / guests.invited) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100">
          Atithi &amp; Guest Counters
        </h1>
        <p className="text-xs text-ivory-300 mt-1">
          Manage RSVPs to dynamically recalculate catering and per-guest expenditure
        </p>
      </div>

      {/* 3 Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Invited */}
        <div className="p-6 rounded-2xl bg-plum-900/40 border border-plum-700/50 backdrop-blur-md shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
              Total Invited
            </span>
            <div className="p-2 rounded-xl bg-plum-950 border border-plum-800 text-saffron-400">
              <Mail className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <p className="font-display text-4xl font-bold text-ivory-100">{guests.invited}</p>
            <p className="text-xs text-ivory-400 mt-1">Target invitations planned</p>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-plum-800/80">
            <button
              type="button"
              onClick={() => updateGuests({ invited: Math.max(5, guests.invited - 10) })}
              className="p-2 rounded-lg bg-plum-950 hover:bg-plum-800 text-ivory-300 border border-plum-800"
              aria-label="Decrease invited guests by 10"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => updateGuests({ invited: guests.invited + 10 })}
              className="p-2 rounded-lg bg-plum-950 hover:bg-plum-800 text-ivory-300 border border-plum-800"
              aria-label="Increase invited guests by 10"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-xs text-ivory-400 ml-auto">±10 quick step</span>
          </div>
        </div>

        {/* Confirmed */}
        <div className="p-6 rounded-2xl bg-plum-900/40 border border-emerald-500/40 backdrop-blur-md shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Confirmed RSVPs
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <p className="font-display text-4xl font-bold text-emerald-300">
              {guests.confirmed}
            </p>
            <p className="text-xs text-ivory-400 mt-1">{attendanceRate}% acceptance rate</p>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-plum-800/80">
            <button
              type="button"
              onClick={() => updateGuests({ confirmed: Math.max(0, guests.confirmed - 5) })}
              className="p-2 rounded-lg bg-plum-950 hover:bg-plum-800 text-ivory-300 border border-plum-800"
              aria-label="Decrease confirmed guests by 5"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => updateGuests({ confirmed: guests.confirmed + 5 })}
              className="p-2 rounded-lg bg-plum-950 hover:bg-plum-800 text-ivory-300 border border-plum-800"
              aria-label="Increase confirmed guests by 5"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-xs text-emerald-400 ml-auto font-medium">Attending</span>
          </div>
        </div>

        {/* Declined */}
        <div className="p-6 rounded-2xl bg-plum-900/40 border border-plum-700/50 backdrop-blur-md shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
              Declined with Blessings
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <UserX className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <p className="font-display text-4xl font-bold text-rose-400">{guests.declined}</p>
            <p className="text-xs text-ivory-400 mt-1">Unable to attend in person</p>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-plum-800/80">
            <button
              type="button"
              onClick={() => updateGuests({ declined: Math.max(0, guests.declined - 1) })}
              className="p-2 rounded-lg bg-plum-950 hover:bg-plum-800 text-ivory-300 border border-plum-800"
              aria-label="Decrease declined guests by 1"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => updateGuests({ declined: guests.declined + 1 })}
              className="p-2 rounded-lg bg-plum-950 hover:bg-plum-800 text-ivory-300 border border-plum-800"
              aria-label="Increase declined guests by 1"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-xs text-rose-400 ml-auto font-medium">Declined</span>
          </div>
        </div>
      </div>

      {/* Impact on Budget Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-plum-950 via-plum-900 to-rose-950/60 border border-plum-700/50 backdrop-blur-md shadow-glass">
        <h2 className="font-display text-lg font-bold text-ivory-100 mb-2">
          Per-Guest Financial Impact
        </h2>
        <p className="text-xs text-ivory-300 leading-relaxed mb-6">
          Indian hospitality prioritizes generous feasting. As your confirmed count updates, Utsav
          dynamically monitors your cost per head.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-plum-950/60 border border-plum-800">
            <span className="text-xs text-ivory-400">Target Budget Per Guest</span>
            <p className="font-display text-2xl font-bold text-saffron-300 mt-1">
              {formatINR(perGuestAllocated)}
            </p>
            <p className="text-[11px] text-ivory-400 mt-1">
              Based on {baseCount} {guests.confirmed > 0 ? "confirmed" : "invited"} guests
            </p>
          </div>

          <div className="p-4 rounded-xl bg-plum-950/60 border border-plum-800">
            <span className="text-xs text-ivory-400">Actual Committed Per Guest</span>
            <p className="font-display text-2xl font-bold text-rose-400 mt-1">
              {formatINR(perGuestSpent)}
            </p>
            <p className="text-[11px] text-ivory-400 mt-1">
              Total booked vendor contracts / {baseCount} guests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

