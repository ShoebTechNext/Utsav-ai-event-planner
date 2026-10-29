import { BudgetCategory, VendorItem } from "@/types";

/**
 * Formats a currency amount into standard Indian Rupee notation (₹ Lakhs / Crores or comma grouped).
 */
export function formatINR(amount: number, format: "lakhs" | "standard" = "standard"): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₹0";
  }

  const rounded = Math.round(amount);

  if (format === "lakhs") {
    const absVal = Math.abs(rounded);
    const sign = rounded < 0 ? "-" : "";

    if (absVal >= 10000000) {
      // Crores
      const cr = (absVal / 10000000).toFixed(2).replace(/\.?0+$/, "");
      return `${sign}₹${cr} Cr`;
    }
    if (absVal >= 100000) {
      // Lakhs
      const lk = (absVal / 100000).toFixed(2).replace(/\.?0+$/, "");
      return `${sign}₹${lk} Lakh`;
    }
  }

  // Standard Indian Numbering System (e.g. 15,00,000)
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Computes cost per guest safely.
 */
export function calculatePerGuestCost(amount: number, guestCount: number): number {
  if (!guestCount || guestCount <= 0) return 0;
  return Math.round(amount / guestCount);
}

/**
 * Calculates budget summary totals: total allocated, total spent, remaining, and percentage spent.
 */
export function calculateBudgetTotals(categories: BudgetCategory[], totalBudget: number) {
  const totalAllocated = categories.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);
  const totalSpent = categories.reduce((sum, c) => sum + (c.spentAmount || 0), 0);
  const remaining = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const isOverBudget = totalSpent > totalBudget;

  return {
    totalBudget,
    totalAllocated,
    totalSpent,
    remaining,
    percentSpent,
    isOverBudget,
  };
}

/**
 * Identifies categories where spent amount strictly exceeds allocated amount.
 */
export function detectOverspentCategories(categories: BudgetCategory[]): BudgetCategory[] {
  return categories.filter((c) => c.spentAmount > c.allocatedAmount);
}

/**
 * Updates budget categories when vendors are added, updated, or booked.
 * Sums booked vendor prices into the corresponding budget category's spentAmount.
 */
export function syncVendorCostsToCategories(
  categories: BudgetCategory[],
  vendors: VendorItem[],
): BudgetCategory[] {
  // Group booked vendor prices by category
  const spentByCategory = new Map<string, number>();

  for (const v of vendors) {
    if (v.status === "booked" && v.quotedPrice > 0) {
      const normalizedCat = v.category.trim().toLowerCase();
      const current = spentByCategory.get(normalizedCat) || 0;
      spentByCategory.set(normalizedCat, current + v.quotedPrice);
    }
  }

  return categories.map((cat) => {
    const key = cat.name.trim().toLowerCase();
    const vendorSpent = spentByCategory.get(key);

    if (vendorSpent !== undefined) {
      return {
        ...cat,
        spentAmount: vendorSpent,
      };
    }
    return cat;
  });
}

/**
 * Validates and recalculates category percentage shares when total budget changes.
 */
export function recalculateAmountsFromPercents(
  categories: BudgetCategory[],
  newTotalBudget: number,
): BudgetCategory[] {
  return categories.map((c) => ({
    ...c,
    allocatedAmount: Math.round((c.allocatedPercent / 100) * newTotalBudget),
  }));
}

