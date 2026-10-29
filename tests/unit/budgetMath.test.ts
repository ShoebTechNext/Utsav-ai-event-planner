import { describe, it, expect } from "vitest";
import {
  formatINR,
  calculatePerGuestCost,
  calculateBudgetTotals,
  detectOverspentCategories,
  syncVendorCostsToCategories,
  recalculateAmountsFromPercents,
} from "@/lib/budget/math";
import { BudgetCategory, VendorItem } from "@/types";

describe("Budget Math Utilities", () => {
  it("formats Indian Rupees correctly in standard format", () => {
    expect(formatINR(0)).toMatch(/₹\s?0/);
    expect(formatINR(1500000)).toMatch(/₹\s?15,00,000/);
    expect(formatINR(45000)).toMatch(/₹\s?45,000/);
  });

  it("formats Indian Rupees in Lakhs/Crore notation when requested", () => {
    expect(formatINR(1500000, "lakhs")).toBe("₹15 Lakh");
    expect(formatINR(25000000, "lakhs")).toBe("₹2.5 Cr");
    expect(formatINR(50000, "lakhs")).toMatch(/₹\s?50,000/);
  });

  it("handles null/undefined/NaN safely", () => {
    expect(formatINR(NaN)).toBe("₹0");
    expect(calculatePerGuestCost(10000, 0)).toBe(0);
    expect(calculatePerGuestCost(10000, -5)).toBe(0);
  });

  it("calculates cost per guest correctly", () => {
    expect(calculatePerGuestCost(500000, 250)).toBe(2000);
    expect(calculatePerGuestCost(100000, 33)).toBe(3030);
  });

  it("calculates budget totals and percentages accurately", () => {
    const categories: BudgetCategory[] = [
      { id: "1", name: "Venue", allocatedPercent: 40, allocatedAmount: 400000, spentAmount: 420000 },
      { id: "2", name: "Food", allocatedPercent: 30, allocatedAmount: 300000, spentAmount: 250000 },
      { id: "3", name: "Decor", allocatedPercent: 30, allocatedAmount: 300000, spentAmount: 100000 },
    ];

    const result = calculateBudgetTotals(categories, 1000000);
    expect(result.totalAllocated).toBe(1000000);
    expect(result.totalSpent).toBe(770000);
    expect(result.remaining).toBe(230000);
    expect(result.percentSpent).toBe(77);
    expect(result.isOverBudget).toBe(false);
  });

  it("detects overspent categories", () => {
    const categories: BudgetCategory[] = [
      { id: "1", name: "Venue", allocatedPercent: 40, allocatedAmount: 400000, spentAmount: 450000 },
      { id: "2", name: "Decor", allocatedPercent: 30, allocatedAmount: 300000, spentAmount: 200000 },
    ];

    const overspent = detectOverspentCategories(categories);
    expect(overspent.length).toBe(1);
    expect(overspent[0].name).toBe("Venue");
  });

  it("syncs booked vendor costs to corresponding category spent amount", () => {
    const categories: BudgetCategory[] = [
      { id: "1", name: "Catering", allocatedPercent: 50, allocatedAmount: 500000, spentAmount: 0 },
      { id: "2", name: "Decor", allocatedPercent: 50, allocatedAmount: 500000, spentAmount: 0 },
    ];

    const vendors: VendorItem[] = [
      {
        id: "v1",
        name: "Chef Raj",
        category: "Catering",
        status: "booked",
        quotedPrice: 350000,
        estimatedRange: "",
        notes: "",
        questionsToAsk: [],
      },
      {
        id: "v2",
        name: "Decor Studio",
        category: "Decor",
        status: "to_contact",
        quotedPrice: 200000,
        estimatedRange: "",
        notes: "",
        questionsToAsk: [],
      },
    ];

    const synced = syncVendorCostsToCategories(categories, vendors);
    expect(synced[0].spentAmount).toBe(350000);
    // Unbooked vendor does not increase spent
    expect(synced[1].spentAmount).toBe(0);
  });

  it("recalculates amounts proportionally when total budget changes", () => {
    const categories: BudgetCategory[] = [
      { id: "1", name: "Venue", allocatedPercent: 50, allocatedAmount: 50000, spentAmount: 0 },
      { id: "2", name: "Food", allocatedPercent: 50, allocatedAmount: 50000, spentAmount: 0 },
    ];

    const updated = recalculateAmountsFromPercents(categories, 200000);
    expect(updated[0].allocatedAmount).toBe(100000);
    expect(updated[1].allocatedAmount).toBe(100000);
  });
});

