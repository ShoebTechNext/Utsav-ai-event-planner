/**
 * Input sanitization and prompt injection protection routines.
 */

// Patterns indicating prompt injection, privilege escalation, or instructions hijacking
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts)/i,
  /system\s+prompt\s+disclosure/i,
  /reveal\s+.*(api[\s_-]?key|system\s+prompt|secret|instructions)/i,
  /print\s+your\s+hidden\s+rules/i,
  /you\s+are\s+now\s+(an\s+unrestricted|a\s+different)\s+ai/i,
  /jailbreak/i,
  /override\s+safety\s+filter/i,
  /act\s+as\s+root/i,
  /developer\s+mode\s+enabled/i,
];

/**
 * Strips dangerous control characters and non-printable unicode while preserving normal whitespace.
 */
export function sanitizeInputString(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  // Strip ASCII control characters except newline and tab
  let clean = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Strip zero-width and bidirectional override characters
  clean = clean.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, "");

  // Strip script and style tags and their inner content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Strip remaining raw HTML tags
  clean = clean.replace(/<[^>]*>/g, "");

  return clean.trim();
}

/**
 * Checks whether an incoming prompt exhibits prompt injection behaviors.
 */
export function detectPromptInjection(text: string): { isSuspicious: boolean; reason?: string } {
  if (!text || typeof text !== "string") {
    return { isSuspicious: false };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isSuspicious: true,
        reason: "Request contains prohibited instruction-override patterns.",
      };
    }
  }

  return { isSuspicious: false };
}

/**
 * Sanitizes an object deeply by applying string sanitization on all string values.
 */
export function sanitizeDeep<T>(obj: T): T {
  if (typeof obj === "string") {
    return sanitizeInputString(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeDeep(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = sanitizeDeep(value);
    }
    return sanitizedObj as T;
  }
  return obj;
}

