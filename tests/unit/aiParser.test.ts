import { describe, it, expect } from "vitest";
import { cleanAndParseJson } from "@/lib/ai/provider";

describe("AI JSON Parser & Repair", () => {
  it("parses clean standard JSON", () => {
    const raw = '{"status": "ok", "count": 42}';
    const parsed = cleanAndParseJson<{ status: string; count: number }>(raw);
    expect(parsed.status).toBe("ok");
    expect(parsed.count).toBe(42);
  });

  it("strips markdown code blocks (```json ... ```)", () => {
    const raw = "```json\n{\n  \"theme\": \"Royal Saffron\",\n  \"rating\": 5\n}\n```";
    const parsed = cleanAndParseJson<{ theme: string; rating: number }>(raw);
    expect(parsed.theme).toBe("Royal Saffron");
    expect(parsed.rating).toBe(5);
  });

  it("handles conversational preamble before and after JSON", () => {
    const raw = "Here is the celebration masterplan you requested:\n\n{\"name\": \"Grand Wedding\"}\n\nHope this helps!";
    const parsed = cleanAndParseJson<{ name: string }>(raw);
    expect(parsed.name).toBe("Grand Wedding");
  });

  it("repairs trailing commas in objects and arrays", () => {
    const malformed = '{"categories": ["Venue", "Decor", ], "budget": 500000, }';
    const parsed = cleanAndParseJson<{ categories: string[]; budget: number }>(malformed);
    expect(parsed.categories.length).toBe(2);
    expect(parsed.budget).toBe(500000);
  });
});

