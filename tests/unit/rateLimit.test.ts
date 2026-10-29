import { describe, it, expect } from "vitest";
import {
  checkRateLimit,
  generateCorrelationId,
  extractClientIp,
} from "@/lib/security/rateLimit";

describe("Rate Limiter & Security Headers", () => {
  it("allows bursts up to maxTokens and consumes tokens correctly", () => {
    const testIp = `test-ip-${Date.now()}`;
    const config = { maxTokens: 3, refillRatePerSec: 0.1 };

    expect(checkRateLimit(testIp, config).allowed).toBe(true);
    expect(checkRateLimit(testIp, config).allowed).toBe(true);
    expect(checkRateLimit(testIp, config).allowed).toBe(true);

    // 4th immediate request should be throttled
    const fourth = checkRateLimit(testIp, config);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.retryAfterSec).toBeGreaterThan(0);
  });

  it("generates unique correlation IDs with utsav prefix", () => {
    const id1 = generateCorrelationId();
    const id2 = generateCorrelationId();

    expect(id1).toMatch(/^utsav-[a-f0-9]{8}$/);
    expect(id2).toMatch(/^utsav-[a-f0-9]{8}$/);
    expect(id1).not.toBe(id2);
  });

  it("extracts client IP from headers safely", () => {
    const headers1 = new Headers();
    headers1.set("x-forwarded-for", "203.0.113.195, 70.41.3.18");
    expect(extractClientIp(headers1)).toBe("203.0.113.195");

    const headers2 = new Headers();
    headers2.set("x-real-ip", "198.51.100.1");
    expect(extractClientIp(headers2)).toBe("198.51.100.1");

    const headers3 = new Headers();
    expect(extractClientIp(headers3)).toBe("127.0.0.1");
  });
});

