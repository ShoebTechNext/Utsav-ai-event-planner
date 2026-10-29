import { describe, it, expect } from "vitest";
import {
  PlanGenerationRequestSchema,
  RebalanceRequestSchema,
  ChatRequestSchema,
} from "@/lib/security/schemas";

describe("Zod Security Schemas", () => {
  it("validates valid plan generation request", () => {
    const valid = {
      type: "wedding",
      name: "Simran & Raj's Wedding",
      date: "2026-11-20",
      city: "Udaipur",
      guestCount: 300,
      totalBudget: 3500000,
      vibe: ["Royal Heritage"],
      dietaryPreferences: ["Pure Veg"],
      culturalTraditions: ["Sangeet"],
      notes: "Courtyard lighting",
    };

    const parsed = PlanGenerationRequestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid date format or out-of-range budget", () => {
    const invalidDate = {
      type: "wedding",
      name: "Wedding",
      date: "20-11-2026", // Wrong format
      city: "Delhi",
      guestCount: 100,
      totalBudget: 1000, // Below minimum 5,000
      vibe: ["Royal"],
    };

    const parsed = PlanGenerationRequestSchema.safeParse(invalidDate);
    expect(parsed.success).toBe(false);
  });

  it("validates rebalance request schema", () => {
    const validRebalance = {
      totalBudget: 1000000,
      guestCount: 150,
      categories: [
        {
          id: "c1",
          name: "Venue",
          allocatedPercent: 40,
          allocatedAmount: 400000,
          spentAmount: 380000,
        },
      ],
    };

    const parsed = RebalanceRequestSchema.safeParse(validRebalance);
    expect(parsed.success).toBe(true);
  });

  it("validates chat request schema and enforces length bounds", () => {
    const validChat = {
      message: "Suggest 3 entertainment ideas for Sangeet night",
    };
    expect(ChatRequestSchema.safeParse(validChat).success).toBe(true);

    const emptyChat = { message: "" };
    expect(ChatRequestSchema.safeParse(emptyChat).success).toBe(false);

    const tooLongChat = { message: "a".repeat(1500) };
    expect(ChatRequestSchema.safeParse(tooLongChat).success).toBe(false);
  });
});

