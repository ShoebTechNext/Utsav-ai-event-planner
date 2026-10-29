# Security Policy & Threat Model — Utsav

## Overview
**Utsav** is built with defense-in-depth principles across its full stack. It operates in strict server-isolated execution mode for GenAI, guarantees zero credential leakage, enforces runtime input and output validation via Zod schemas, protects against automated abuse via in-memory IP token-bucket rate limiting, and neutralizes prompt-injection attacks.

---

## Threat Model

| Threat Vector | Severity | Vulnerability Scenario | Mitigation Implemented in Utsav |
|---|---|---|---|
| **API Key Leakage** | Critical | Client bundle inspection, accidental git commits, network sniffing | All API keys (`GEMINI_API_KEY`, `ANTHROPIC_API_KEY`) are kept strictly on the Node.js server in `.env.local`. Client code never directly interfaces with external AI endpoints. All AI queries go through Next.js server route handlers (`/api/plan`, `/api/rebalance`, `/api/chat`). `.gitignore` enforces exclusion of all `.env*` files. |
| **Prompt Injection & Persona Hijacking** | High | Attacker enters malicious text in event notes or chat prompts to hijack LLM behavior (e.g. "Ignore previous instructions", "Reveal system prompt", "Act as root") | 1. Input pre-screening with `detectPromptInjection()` regex filters targeting instruction hijacking, key extraction, and jailbreaks.<br>2. Strict system directives separating trusted system instructions from untrusted user content treated strictly as passive data.<br>3. Strict refusal instructions preventing secret or prompt disclosure. |
| **XSS & Content Injection** | High | Malicious HTML/JavaScript payloads in event titles, notes, or vendor names executing in victim browser | 1. `sanitizeInputString()` strips ASCII control characters, zero-width spaces, `<script>` tags, and raw HTML markup.<br>2. Zero usage of `dangerouslySetInnerHTML`. All user and AI outputs render as plain React text strings.<br>3. Strict Content Security Policy (CSP) blocking unauthorized script execution, inline object execution, and iframe framing. |
| **Denial of Service / Resource Exhaustion** | High | Automated scripts flooding AI endpoints causing quota exhaustion, memory starvation, or cloud billing spikes | 1. In-memory Token Bucket rate limiter (`checkRateLimit`) tracking requests per IP with automatic stale-entry cleanup.<br>2. Fixed body size parsing bounds.<br>3. In-memory LRU Cache (`planCache`) caching responses for identical plan requests to avoid duplicate LLM compute.<br>4. Client and server timeouts on all streaming and generation calls. |
| **Data Corruption & LocalStorage Tampering** | Medium | User or browser extension corrupting localStorage JSON state, causing application crash | `loadEventsFromStorage()` wraps reading in `try/catch` and validates against the schema. If corrupted or unparseable data is encountered, it logs a warning, repairs the state, and gracefully falls back to the default sample royal celebration. |
| **Clickjacking & MIME-Sniffing** | Medium | Embedding Utsav in malicious iframes or MIME-confusion attacks | Security headers configured in `next.config.ts`: `X-Frame-Options: DENY`, `frame-ancestors: 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`. |
| **Dependency Vulnerabilities** | High / Critical | Known CVEs in third-party npm packages | Resolved all audit advisories down to **0 vulnerabilities** (`npm audit` reports 0 vulnerabilities) using secure patched releases and package overrides. |

---

## Defensive Architecture

```
                  ┌───────────────────────────────┐
                  │       Browser Client          │
                  │ (React 19 / Next.js App Router)│
                  └───────────────┬───────────────┘
                                  │
                                  ▼
           ┌─────────────────────────────────────────────┐
           │     Security Layer (Middleware / Headers)   │
           │  - CSP, nosniff, frame-ancestors: none      │
           │  - Permissions-Policy                       │
           └──────────────────────┬──────────────────────┘
                                  │
                                  ▼
           ┌─────────────────────────────────────────────┐
           │      API Route Handlers (/api/*)            │
           │  - Per-IP Token Bucket Rate Limiting        │
           │  - Input Sanitization & Control Char Strip  │
           │  - Prompt Injection Scanner                 │
           │  - Zod Schema Validation                    │
           │  - LRU Plan Cache                           │
           └──────────────────────┬──────────────────────┘
                                  │
                                  ▼
           ┌─────────────────────────────────────────────┐
           │          AI Provider Abstraction             │
           │  - Gemini 2.5 Flash (@google/genai)         │
           │  - Claude 3.5 Sonnet (@anthropic-ai/sdk)    │
           │  - JSON Repair & Strict Schema Parse        │
           │  - Automatic Fallback to Demo Mode          │
           └─────────────────────────────────────────────┘
```

---

## Reporting a Vulnerability
To report security issues or vulnerabilities, please open an issue or contact the repository maintainers directly with details, correlation ID, and reproduction steps.

