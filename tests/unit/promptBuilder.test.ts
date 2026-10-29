import { describe, it, expect } from "vitest";
import { buildPlanPrompt, buildRebalancePrompt, UTSAV_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { PlanGenerationRequest } from "@/types";

describe("Prompt Builder & System Directives", () => {
  it("enforces safety and persona constraints in UTSAV_SYSTEM_PROMPT", () => {
    expect(UTSAV_SYSTEM_PROMPT).toContain("Utsav AI");
    expect(UTSAV_SYSTEM_PROMPT).toContain("CRITICAL SAFETY & OPERATIONAL DIRECTIVES");
    expect(UTSAV_SYSTEM_PROMPT).toContain("unstructured DATA");
    expect(UTSAV_SYSTEM_PROMPT).toContain("RFC 8259 JSON");
  });

  it("builds detailed plan prompt with all user parameters formatted", () => {
    const req: PlanGenerationRequest = {
      type: "wedding",
      name: "Radhika & Aman's Wedding",
      date: "2026-12-25",
      city: "Jodhpur",
      guestCount: 400,
      totalBudget: 5000000,
      vibe: ["Royal Heritage", "Marigold Glow"],
      dietaryPreferences: ["Pure Veg"],
      culturalTraditions: ["Haldi", "Sangeet"],
      notes: "Eco-friendly decor",
    };

    const prompt = buildPlanPrompt(req);
    expect(prompt).toContain("Radhika & Aman's Wedding");
    expect(prompt).toContain("Jodhpur");
    expect(prompt).toContain("400");
    expect(prompt).toContain("₹50,00,000");
    expect(prompt).toContain("Royal Heritage");
    expect(prompt).toContain("categories");
    expect(prompt).toContain("timeline");
    expect(prompt).toContain("vendors");
    expect(prompt).toContain("ideas");
  });

  it("builds rebalance prompt including current allocations and spent amounts", () => {
    const prompt = buildRebalancePrompt({
      totalBudget: 2000000,
      guestCount: 200,
      categories: [
        { name: "Venue", allocatedPercent: 50, allocatedAmount: 1000000, spentAmount: 900000 },
        { name: "Catering", allocatedPercent: 50, allocatedAmount: 1000000, spentAmount: 1100000 },
      ],
    });

    expect(prompt).toContain("₹20,00,000");
    expect(prompt).toContain("Venue");
    expect(prompt).toContain("Catering");
    expect(prompt).toContain("₹11,00,000");
    expect(prompt).toContain("adjustmentReason");
  });
});

