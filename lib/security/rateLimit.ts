import { randomUUID } from "node:crypto";

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  maxTokens: number;
  refillRatePerSec: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 25, // Up to 25 bursts
  refillRatePerSec: 1, // 1 token per second
};

// In-memory store for IP rate limiting
const buckets = new Map<string, RateLimitBucket>();

// Periodic cleanup every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleBuckets(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const maxAge = 10 * 60 * 1000; // 10 minutes
  for (const [ip, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      buckets.delete(ip);
    }
  }
}

/**
 * Checks and consumes tokens from the token bucket for a given IP address.
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  cleanupStaleBuckets();

  const now = Date.now();
  const bucket = buckets.get(ip) || {
    tokens: config.maxTokens,
    lastRefill: now,
  };

  // Calculate refilled tokens based on time elapsed
  const elapsedSec = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(config.maxTokens, bucket.tokens + elapsedSec * config.refillRatePerSec);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    buckets.set(ip, bucket);
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
    };
  }

  buckets.set(ip, bucket);
  const neededTokens = 1 - bucket.tokens;
  const retryAfterSec = Math.ceil(neededTokens / config.refillRatePerSec);

  return {
    allowed: false,
    remaining: 0,
    retryAfterSec,
  };
}

/**
 * Generates a unique correlation ID for tracing and error isolation.
 */
export function generateCorrelationId(): string {
  return `utsav-${randomUUID().slice(0, 8)}`;
}

/**
 * Extracts client IP from standard reverse-proxy headers.
 */
export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") || "127.0.0.1";
}

