"use client";

import React, { useState, useMemo } from "react";
import {
  PieChart,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  Table,
  Check,
  Edit2,
  Loader2,
} from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import {
  formatINR,
  calculateBudgetTotals,
  calculatePerGuestCost,
  detectOverspentCategories,
} from "@/lib/budget/math";
import { Modal } from "@/components/ui/Modal";
import { RebalanceRequest } from "@/types";

const DONUT_COLORS = [
  "#FFB000", // Saffron
  "#E8457C", // Rose
  "#B875D3", // Plum light
  "#FFD314", // Gold
  "#00C49F", // Teal
  "#FF8042", // Orange
  "#A31548", // Wine
  "#6B2089", // Violet
];

export function BudgetSection() {
  const {
    activeEvent,
    updateBudgetCategory,
    addBudgetCategory,
    deleteBudgetCategory,
    updateActiveEvent,
    addToast,
  } = useUtsav();

  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // New Category Form
  const [newCatName, setNewCatName] = useState("");
  const [newCatAllocated, setNewCatAllocated] = useState<number>(100000);
  const [newCatNotes, setNewCatNotes] = useState("");

  const categories = useMemo(() => activeEvent?.categories || [], [activeEvent?.categories]);
  const totals = calculateBudgetTotals(categories, activeEvent?.totalBudget || 0);
  const perGuestCost = calculatePerGuestCost(totals.totalSpent, activeEvent?.guestCount || 0);
  const overspentCategories = detectOverspentCategories(categories);

  // SVG Donut calculation
  const totalAllocated = totals.totalAllocated || 1;

  const donutSlices = useMemo(() => {
    let currentOffset = 0;
    return categories.map((cat, idx) => {
      const share = (cat.allocatedAmount || 0) / totalAllocated;
      const strokePercent = share * 100;
      const strokeDash = `${strokePercent} ${100 - strokePercent}`;
      const strokeDashoffset = -currentOffset;
      currentOffset += strokePercent;

      return {
        ...cat,
        color: DONUT_COLORS[idx % DONUT_COLORS.length],
        strokeDash,
        strokeDashoffset,
      };
    });
  }, [categories, totalAllocated]);

  if (!activeEvent) return null;

  // AI Re-balance handler
  const handleAiRebalance = async () => {
    setIsRebalancing(true);
    try {
      const payload: RebalanceRequest = {
        totalBudget: activeEvent.totalBudget,
        guestCount: activeEvent.guestCount,
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          allocatedPercent: c.allocatedPercent,
          allocatedAmount: c.allocatedAmount,
          spentAmount: c.spentAmount,
        })),
      };

      const res = await fetch("/api/rebalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || "Rebalance failed");
      }

      const rebalancedList = json.data.categories;

      // Update active event categories
      updateActiveEvent((prev) => {
        const nextCategories = prev.categories.map((c) => {
          const matched = rebalancedList.find(
            (r: { name: string; allocatedPercent: number; allocatedAmount: number; adjustmentReason: string }) =>
              r.name.toLowerCase() === c.name.toLowerCase(),
          );
          if (matched) {
            return {
              ...c,
              allocatedPercent: matched.allocatedPercent,
              allocatedAmount: matched.allocatedAmount,
              notes: matched.adjustmentReason || c.notes,
            };
          }
          return c;
        });

        return { ...prev, categories: nextCategories };
      });

      addToast({
        type: "success",
        title: "Budget Rebalanced by AI",
        message: json.data.summary,
      });
    } catch (err: unknown) {
      console.warn("Rebalance error:", err);
      addToast({
        type: "error",
        title: "Rebalance Failed",
        message: "Could not automatically rebalance categories.",
      });
    } finally {
      setIsRebalancing(false);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const percent = Math.round((newCatAllocated / activeEvent.totalBudget) * 100);
    addBudgetCategory({
      name: newCatName.trim(),
      allocatedAmount: newCatAllocated,
      allocatedPercent: percent,
      spentAmount: 0,
      notes: newCatNotes.trim(),
    });

    setNewCatName("");
    setNewCatAllocated(100000);
    setNewCatNotes("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100">
            Celebration Budget
          </h1>
          <p className="text-xs text-ivory-300 mt-1">
            Real-time allocation, vendor spend sync, and AI rebalancing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Table / Donut toggle button */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-plum-900/60 border border-plum-700/50 text-xs font-semibold text-ivory-200 hover:text-ivory-100 transition-colors focus:outline-none focus:ring-2 focus:ring-saffron-400"
            aria-label={viewMode === "chart" ? "Switch to accessible data table" : "Switch to chart view"}
          >
            {viewMode === "chart" ? (
              <>
                <Table className="w-4 h-4 text-saffron-400" />
                <span>Data Table</span>
              </>
            ) : (
              <>
                <PieChart className="w-4 h-4 text-saffron-400" />
                <span>Donut Chart</span>
              </>
            )}
          </button>

          {/* AI Re-balance Button */}
          <button
            type="button"
            onClick={handleAiRebalance}
            disabled={isRebalancing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 text-plum-950 font-bold text-xs tracking-wide shadow-glass hover:brightness-110 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-400"
          >
            {isRebalancing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 fill-plum-950" />
            )}
            <span>AI Re-Balance</span>
          </button>

          {/* Add Category Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-plum-800 hover:bg-plum-700 text-ivory-100 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-saffron-400"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Overspend Alert Banner (if any) */}
      {overspentCategories.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-ivory-100"
        >
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-rose-300">Overspend Warning: </span>
            {overspentCategories.map((c) => c.name).join(", ")} exceeded their target allocation.
            Click <strong>AI Re-Balance</strong> to redistribute funds without busting your overall ceiling.
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-plum-900/50 border border-plum-700/50 backdrop-blur-md">
          <span className="text-xs text-ivory-400 font-medium">Total Budget</span>
          <p className="font-display text-xl sm:text-2xl font-bold text-ivory-100 mt-1">
            {formatINR(totals.totalBudget)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-plum-900/50 border border-plum-700/50 backdrop-blur-md">
          <span className="text-xs text-ivory-400 font-medium">Spent & Booked</span>
          <p className="font-display text-xl sm:text-2xl font-bold text-rose-400 mt-1">
            {formatINR(totals.totalSpent)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-plum-900/50 border border-plum-700/50 backdrop-blur-md">
          <span className="text-xs text-ivory-400 font-medium">Remaining Buffer</span>
          <p
            className={`font-display text-xl sm:text-2xl font-bold mt-1 ${
              totals.remaining >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatINR(totals.remaining)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-plum-900/50 border border-plum-700/50 backdrop-blur-md">
          <span className="text-xs text-ivory-400 font-medium">Estimated Per Guest</span>
          <p className="font-display text-xl sm:text-2xl font-bold text-saffron-300 mt-1">
            {formatINR(perGuestCost)}
          </p>
        </div>
      </div>

      {/* VISUAL DONUT OR DATA TABLE */}
      {viewMode === "chart" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-plum-900/40 border border-plum-700/50 backdrop-blur-md shadow-glass">
          {/* SVG Donut */}
          <div className="md:col-span-1 flex flex-col items-center justify-center relative">
            <div className="relative w-56 h-56">
              <svg viewBox="0 0 42 42" className="w-full h-full rotate-[-90deg]">
                {donutSlices.map((slice) => (
                  <circle
                    key={slice.id}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={hoveredSlice === slice.id ? "6" : "4.5"}
                    strokeDasharray={slice.strokeDash}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredSlice(slice.id)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                ))}
              </svg>

              {/* Donut Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                <span className="text-xs text-ivory-400 font-medium">
                  {hoveredSlice
                    ? categories.find((c) => c.id === hoveredSlice)?.name
                    : "Total Allocated"}
                </span>
                <span className="font-display text-base font-bold text-ivory-100 mt-0.5">
                  {hoveredSlice
                    ? formatINR(categories.find((c) => c.id === hoveredSlice)?.allocatedAmount || 0)
                    : formatINR(totals.totalAllocated)}
                </span>
              </div>
            </div>
          </div>

          {/* Color Legend List */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 content-center">
            {donutSlices.map((slice) => {
              const isHovered = hoveredSlice === slice.id;
              const percent = activeEvent.totalBudget > 0
                ? Math.round((slice.allocatedAmount / activeEvent.totalBudget) * 100)
                : slice.allocatedPercent;

              return (
                <div
                  key={slice.id}
                  onMouseEnter={() => setHoveredSlice(slice.id)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isHovered
                      ? "bg-plum-800/80 border-saffron-400 shadow-glass"
                      : "bg-plum-950/40 border-plum-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      style={{ backgroundColor: slice.color }}
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    />
                    <span className="text-xs font-semibold text-ivory-100 truncate">
                      {slice.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-saffron-300">
                      {formatINR(slice.allocatedAmount)}
                    </span>
                    <span className="text-[10px] text-ivory-400 block">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Accessible Data Table View */
        <div className="rounded-2xl border border-plum-700/60 overflow-hidden bg-plum-900/40 backdrop-blur-md">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Budget Category Allocations and Expenses</caption>
            <thead className="bg-plum-950/80 text-xs text-ivory-400 uppercase tracking-wider border-b border-plum-800">
              <tr>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Allocated (₹)</th>
                <th scope="col" className="px-4 py-3">Share (%)</th>
                <th scope="col" className="px-4 py-3">Spent (₹)</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-plum-800/60 text-ivory-200">
              {categories.map((c) => {
                const isOver = c.spentAmount > c.allocatedAmount;
                return (
                  <tr key={c.id} className="hover:bg-plum-900/60 transition-colors">
                    <th scope="row" className="px-4 py-3 font-medium text-ivory-100">
                      {c.name}
                    </th>
                    <td className="px-4 py-3">{formatINR(c.allocatedAmount)}</td>
                    <td className="px-4 py-3">{c.allocatedPercent}%</td>
                    <td className="px-4 py-3">{formatINR(c.spentAmount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          isOver
                            ? "bg-rose-500/20 text-rose-300"
                            : c.spentAmount > 0
                              ? "bg-saffron-500/20 text-saffron-300"
                              : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {isOver ? "Overspend" : c.spentAmount > 0 ? "In Progress" : "Available"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Cards with Inline Edit */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ivory-100">
          Category Allocations ({categories.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const isEditing = editingCategoryId === cat.id;
            const isOver = cat.spentAmount > cat.allocatedAmount;
            const progress = cat.allocatedAmount > 0
              ? Math.min(100, Math.round((cat.spentAmount / cat.allocatedAmount) * 100))
              : 0;

            return (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-plum-900/40 border border-plum-700/50 backdrop-blur-md shadow-glass flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-display text-base font-bold text-ivory-100">{cat.name}</h3>
                      {cat.notes && (
                        <p className="text-xs text-ivory-300/80 mt-0.5 line-clamp-1">{cat.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingCategoryId(isEditing ? null : cat.id)}
                        className="p-1.5 text-ivory-400 hover:text-ivory-100 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label={isEditing ? "Done editing" : `Edit ${cat.name}`}
                      >
                        {isEditing ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Edit2 className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteBudgetCategory(cat.id)}
                        className="p-1.5 text-rose-400/80 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
                        aria-label={`Delete ${cat.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Allocated vs Spent */}
                  {isEditing ? (
                    <div className="my-2 space-y-2">
                      <label htmlFor={`allocated-${cat.id}`} className="text-[11px] text-ivory-400">
                        Allocated Amount (₹)
                      </label>
                      <input
                        id={`allocated-${cat.id}`}
                        type="number"
                        value={cat.allocatedAmount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const percent = Math.round((val / activeEvent.totalBudget) * 100);
                          updateBudgetCategory({
                            ...cat,
                            allocatedAmount: val,
                            allocatedPercent: percent,
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-1 focus:ring-saffron-400"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-between items-baseline my-2">
                      <span className="text-xs text-ivory-400">
                        Spent:{" "}
                        <strong className={isOver ? "text-rose-400 font-bold" : "text-ivory-100"}>
                          {formatINR(cat.spentAmount)}
                        </strong>
                      </span>
                      <span className="text-xs text-ivory-300">
                        Allocated:{" "}
                        <strong className="text-saffron-300">{formatINR(cat.allocatedAmount)}</strong>
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="w-full bg-plum-950/80 h-2 rounded-full overflow-hidden border border-plum-800 my-1">
                    <div
                      style={{ width: `${progress}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? "bg-rose-500" : "bg-gradient-to-r from-saffron-500 to-rose-400"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-ivory-400 mt-2 pt-2 border-t border-plum-800/60">
                  <span>{progress}% utilized</span>
                  <span className={isOver ? "text-rose-400 font-bold" : "text-emerald-400"}>
                    {isOver
                      ? `Over by ${formatINR(cat.spentAmount - cat.allocatedAmount)}`
                      : `${formatINR(cat.allocatedAmount - cat.spentAmount)} remaining`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Budget Category"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ivory-200 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Fireworks & Special FX"
              className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ivory-200 mb-1">
              Allocated Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="1000"
              step="5000"
              value={newCatAllocated}
              onChange={(e) => setNewCatAllocated(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ivory-200 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={newCatNotes}
              onChange={(e) => setNewCatNotes(e.target.value)}
              placeholder="e.g. Cold pyro sparklers for entry"
              className="w-full px-3 py-2 rounded-xl bg-plum-950 border border-plum-700 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-plum-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-ivory-300 hover:text-ivory-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-saffron-500 hover:bg-saffron-400 text-plum-950"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

