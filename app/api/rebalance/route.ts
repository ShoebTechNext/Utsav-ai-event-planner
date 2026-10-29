import { NextRequest, NextResponse } from "next/server";
import { RebalanceRequestSchema } from "@/lib/security/schemas";
import { checkRateLimit, extractClientIp, generateCorrelationId } from "@/lib/security/rateLimit";
import { sanitizeDeep } from "@/lib/security/sanitizer";
import { rebalanceBudget } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  const correlationId = generateCorrelationId();
  const clientIp = extractClientIp(req.headers);

  // Rate Limiting
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please wait a few seconds before rebalancing.",
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
    const sanitizedBody = sanitizeDeep(rawBody);

    const validated = RebalanceRequestSchema.safeParse(sanitizedBody);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Invalid rebalance parameters.",
          details: validated.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
          correlationId,
        },
        { status: 400 },
      );
    }

    const result = await rebalanceBudget(validated.data);

    return NextResponse.json({
      data: result.data,
      source: result.source,
      correlationId,
    });
  } catch (error) {
    console.error(`[${correlationId}] Rebalance route error:`, error);
    return NextResponse.json(
      {
        error: "Failed to rebalance budget. Please try again.",
        correlationId,
      },
      { status: 500 },
    );
  }
}

