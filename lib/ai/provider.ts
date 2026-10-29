import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import {
  PlanGenerationRequest,
  PlanGenerationResponse,
  RebalanceRequest,
  RebalanceResponse,
} from "@/types";
import { UTSAV_SYSTEM_PROMPT, buildPlanPrompt, buildRebalancePrompt } from "./prompts";
import { PlanGenerationResponseSchema, RebalanceResponseSchema } from "@/lib/security/schemas";
import { generateMockPlan, generateMockRebalance } from "./mockGenerator";

/**
 * Detects active AI provider configuration.
 */
export function getAiMode(): {
  mode: "live" | "demo";
  provider: "gemini" | "anthropic" | "none";
} {
  if (process.env.GEMINI_API_KEY) {
    return { mode: "live", provider: "gemini" };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return { mode: "live", provider: "anthropic" };
  }
  return { mode: "demo", provider: "none" };
}

/**
 * Attempts to repair malformed or markdown-wrapped JSON strings.
 */
export function cleanAndParseJson<T>(rawText: string): T {
  let text = rawText.trim();

  // Strip markdown code fences if present (```json ... ``` or ``` ...)
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  // Find outermost JSON object boundaries { ... }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // Attempt minor repair: remove trailing commas before closing braces/brackets
    const repaired = text
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
    return JSON.parse(repaired) as T;
  }
}

/**
 * Invokes Gemini or Anthropic to generate text content.
 */
async function callAiText(prompt: string, systemInstruction = UTSAV_SYSTEM_PROMPT): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (geminiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: `${systemInstruction}\n\n${prompt}`,
    });
    return response.text || "";
  }

  if (anthropicKey) {
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4000,
      system: systemInstruction,
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content[0];
    return block && block.type === "text" ? block.text : "";
  }

  throw new Error("No AI API keys configured.");
}

/**
 * Generates an event masterplan using Live AI or falls back seamlessly to Demo Mode.
 */
export async function generateEventPlan(
  req: PlanGenerationRequest,
): Promise<{ data: PlanGenerationResponse; source: "live" | "demo" }> {
  const mode = getAiMode();

  if (mode.mode === "live") {
    try {
      const prompt = buildPlanPrompt(req);
      const rawOutput = await callAiText(prompt);
      const parsedJson = cleanAndParseJson<PlanGenerationResponse>(rawOutput);
      const validated = PlanGenerationResponseSchema.parse(parsedJson);

      return {
        data: {
          ...validated,
          aiProviderUsed: mode.provider === "gemini" ? "gemini" : "anthropic",
        },
        source: "live",
      };
    } catch (error) {
      console.warn("Live AI generation failed, falling back to Demo Mode:", error);
      // Fallback gracefully
    }
  }

  // Demo mode mock plan
  return {
    data: generateMockPlan(req),
    source: "demo",
  };
}

/**
 * Rebalances a budget using Live AI or falls back seamlessly to Demo Mode.
 */
export async function rebalanceBudget(
  req: RebalanceRequest,
): Promise<{ data: RebalanceResponse; source: "live" | "demo" }> {
  const mode = getAiMode();

  if (mode.mode === "live") {
    try {
      const prompt = buildRebalancePrompt(req);
      const rawOutput = await callAiText(prompt);
      const parsedJson = cleanAndParseJson<RebalanceResponse>(rawOutput);
      const validated = RebalanceResponseSchema.parse(parsedJson);

      return {
        data: validated,
        source: "live",
      };
    } catch (error) {
      console.warn("Live AI rebalance failed, falling back to Demo Mode:", error);
    }
  }

  return {
    data: generateMockRebalance(req),
    source: "demo",
  };
}

