import { NextRequest, NextResponse } from "next/server";
import { PlanGenerationRequestSchema } from "@/lib/security/schemas";
import { checkRateLimit, extractClientIp, generateCorrelationId } from "@/lib/security/rateLimit";
import { sanitizeDeep, detectPromptInjection } from "@/lib/security/sanitizer";
import { generateEventPlan } from "@/lib/ai/provider";
import { planCache } from "@/lib/ai/cache";

export async function POST(req: NextRequest) {
  const correlationId = generateCorrelationId();
  const clientIp = extractClientIp(req.headers);

  // Rate Limiting
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait a moment before generating another plan.",
        correlationId,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSec || 1) },
      },
    );
  }

  try {
    const rawBody = await req.json();

    // Deep Sanitization
    const sanitizedBody = sanitizeDeep(rawBody);

    // Prompt Injection Check
    if (typeof sanitizedBody.notes === "string") {
      const injectionCheck = detectPromptInjection(sanitizedBody.notes);
      if (injectionCheck.isSuspicious) {
        return NextResponse.json(
          {
            error: "Prohibited instruction pattern detected in input.",
            correlationId,
          },
          { status: 400 },
        );
      }
    }

    // Validation
    const validated = PlanGenerationRequestSchema.safeParse(sanitizedBody);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Invalid plan generation parameters.",
          details: validated.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
          correlationId,
        },
        { status: 400 },
      );
    }

    // Check LRU Cache for identical requests
    const cacheKey = JSON.stringify(validated.data);
    const cached = planCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        data: cached,
        source: "cache",
        correlationId,
      });
    }

    // Generate Plan
    const result = await generateEventPlan(validated.data);

    // Cache valid result
    planCache.set(cacheKey, result.data);

    return NextResponse.json({
      data: result.data,
      source: result.source,
      correlationId,
    });
  } catch (error) {
    console.error(`[${correlationId}] Plan generation route error:`, error);
    return NextResponse.json(
      {
        error: "Unable to generate plan. Please try again or switch to demo mode.",
        correlationId,
      },
      { status: 500 },
    );
  }
}

