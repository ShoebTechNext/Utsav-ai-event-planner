import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LruCache, planCache } from "@/lib/ai/cache";
import { generateMockPlan, generateMockRebalance } from "@/lib/ai/mockGenerator";
import { getAiMode, generateEventPlan, rebalanceBudget } from "@/lib/ai/provider";
import { cn } from "@/lib/utils";
import { launchCelebrationConfetti } from "@/lib/motion/confetti";
import {
  springTransition,
  gentleTransition,
  instantTransition,
  staggerContainerVariants,
  itemFadeUpVariants,
  pageTransitionVariants,
  checkmarkVariants,
} from "@/lib/motion/config";
import { PlanGenerationRequest } from "@/types";

describe("Extra Coverage for Lib", () => {
  describe("Motion Config", () => {
    it("exports valid motion configs and variants", () => {
      expect(springTransition).toBeDefined();
      expect(gentleTransition).toBeDefined();
      expect(instantTransition).toBeDefined();
      expect(staggerContainerVariants.visible).toBeDefined();
      expect(itemFadeUpVariants.visible).toBeDefined();
      expect(pageTransitionVariants.animate).toBeDefined();
      expect(checkmarkVariants.visible).toBeDefined();
    });
  });
  describe("LRU Cache", () => {
    it("sets, gets, evicts oldest entry upon capacity and respects TTL", () => {
      const cache = new LruCache<string>(2, 100);
      cache.set("a", "1");
      cache.set("b", "2");
      expect(cache.get("a")).toBe("1");
      expect(cache.size()).toBe(2);

      // Exceed capacity
      cache.set("c", "3");
      expect(cache.get("b")).toBeNull(); // b was evicted as LRU
      expect(cache.get("a")).toBe("1");
      expect(cache.get("c")).toBe("3");

      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.get("a")).toBeNull();
    });

    it("expires entries after TTL", async () => {
      const cache = new LruCache<string>(5, 10); // 10ms TTL
      cache.set("temp", "val");
      expect(cache.get("temp")).toBe("val");

      await new Promise((r) => setTimeout(r, 20));
      expect(cache.get("temp")).toBeNull();
    });
  });

  describe("Mock Generator for Birthday and Community", () => {
    it("generates birthday mock plan with tailored categories", () => {
      const req: PlanGenerationRequest = {
        type: "birthday",
        name: "Ayaan's 5th Superhero Birthday",
        date: "2026-11-12",
        city: "Bengaluru",
        guestCount: 50,
        totalBudget: 150000,
        vibe: ["Modern High-Energy"],
        dietaryPreferences: ["Finger foods"],
        culturalTraditions: ["Cake Smash"],
      };

      const plan = generateMockPlan(req);
      expect(plan.categories.some((c) => c.name.includes("Play Arena") || c.name.includes("Venue"))).toBe(true);
      expect(plan.ideas.length).toBe(5);
      expect(plan.timeline.length).toBeGreaterThanOrEqual(4);
      expect(plan.vendors.length).toBeGreaterThanOrEqual(2);
    });

    it("generates community celebration mock plan", () => {
      const req: PlanGenerationRequest = {
        type: "community",
        name: "Gokuldham Dandiya Utsav",
        date: "2026-10-24",
        city: "Ahmedabad",
        guestCount: 800,
        totalBudget: 800000,
        vibe: ["Traditional Temple Classical"],
        dietaryPreferences: ["Satvik Traditional Spread"],
        culturalTraditions: ["Dandiya & Garba Raas"],
      };

      const plan = generateMockPlan(req);
      expect(plan.categories.some((c) => c.name.includes("Stage") || c.name.includes("Prasadam"))).toBe(true);
      expect(plan.timeline.length).toBeGreaterThanOrEqual(4);
    });

    it("generates mock rebalance when overspending exists", () => {
      const res = generateMockRebalance({
        totalBudget: 500000,
        guestCount: 100,
        categories: [
          { id: "1", name: "Venue", allocatedPercent: 50, allocatedAmount: 250000, spentAmount: 280000 },
          { id: "2", name: "Food", allocatedPercent: 50, allocatedAmount: 250000, spentAmount: 100000 },
        ],
      });

      expect(res.categories[0].adjustmentReason).toContain("overspend");
      expect(res.summary).toContain("successfully rebalanced");
    });
  });

  describe("AI Provider Mode & Fallback", () => {
    const originalGemini = process.env.GEMINI_API_KEY;
    const originalAnthropic = process.env.ANTHROPIC_API_KEY;

    afterEach(() => {
      process.env.GEMINI_API_KEY = originalGemini;
      process.env.ANTHROPIC_API_KEY = originalAnthropic;
    });

    it("detects demo mode when no keys are present", () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      const mode = getAiMode();
      expect(mode.mode).toBe("demo");
      expect(mode.provider).toBe("none");
    });

    it("detects gemini mode when GEMINI_API_KEY is present", () => {
      process.env.GEMINI_API_KEY = "dummy-gemini-key";
      delete process.env.ANTHROPIC_API_KEY;

      const mode = getAiMode();
      expect(mode.mode).toBe("live");
      expect(mode.provider).toBe("gemini");
    });

    it("detects anthropic mode when ANTHROPIC_API_KEY is present", () => {
      delete process.env.GEMINI_API_KEY;
      process.env.ANTHROPIC_API_KEY = "dummy-anthropic-key";

      const mode = getAiMode();
      expect(mode.mode).toBe("live");
      expect(mode.provider).toBe("anthropic");
    });

    it("falls back to demo mode on API network failure gracefully", async () => {
      process.env.GEMINI_API_KEY = "invalid-key";
      const planRes = await generateEventPlan({
        type: "wedding",
        name: "Test Wedding",
        date: "2026-12-10",
        city: "Delhi",
        guestCount: 100,
        totalBudget: 1000000,
        vibe: ["Royal Heritage"],
        dietaryPreferences: [],
        culturalTraditions: [],
      });

      expect(planRes.source).toBe("demo");
      expect(planRes.data.categories.length).toBeGreaterThan(0);
    });

    it("falls back to demo rebalance on error gracefully", async () => {
      process.env.GEMINI_API_KEY = "invalid-key";
      const reb = await rebalanceBudget({
        totalBudget: 100000,
        guestCount: 20,
        categories: [{ id: "1", name: "Decor", allocatedPercent: 100, allocatedAmount: 100000, spentAmount: 10000 }],
      });
      expect(reb.source).toBe("demo");
      expect(reb.data.categories.length).toBe(1);
    });
  });

  describe("Utility functions", () => {
    it("merges classNames correctly with cn", () => {
      expect(cn("px-2", "py-1", { "bg-red-500": true, "text-white": false })).toBe("px-2 py-1 bg-red-500");
    });

    it("invokes confetti launcher safely and respects reducedMotion", () => {
      // should return early without creating canvas if reduceMotion is true
      launchCelebrationConfetti({ reduceMotion: true });
      expect(document.querySelector("canvas")).toBeNull();

      // Launch without reduced motion
      launchCelebrationConfetti({ reduceMotion: false, particleCount: 5 });
      const canvas = document.querySelector("canvas");
      expect(canvas).toBeDefined();
    });
  });
});
