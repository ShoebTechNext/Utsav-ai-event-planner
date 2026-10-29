import { NextResponse } from "next/server";
import { getAiMode } from "@/lib/ai/provider";

export async function GET() {
  const mode = getAiMode();
  return NextResponse.json({
    mode: mode.mode,
    provider: mode.provider,
    timestamp: new Date().toISOString(),
  });
}

