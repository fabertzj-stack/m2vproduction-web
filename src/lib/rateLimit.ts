/**
 * rateLimit.ts — minimal in-memory rate limiter for the /api/* form endpoints.
 *
 * This satisfies the Final Executive Audit's Cybersecurity finding ("no rate-limiting
 * specified for the /api form endpoints") as a real, working starting point.
 *
 * IMPORTANT limitation, stated plainly rather than hidden: this uses an in-memory Map,
 * which only works correctly on a single long-running server instance. Most modern
 * serverless hosts (Vercel, Netlify Functions, Cloudflare Workers) run multiple
 * short-lived instances, where this Map resets per instance and won't enforce a true
 * global limit. For production at scale, replace this with a shared store — Upstash
 * Redis is the standard low-effort choice for exactly this use case. This module is
 * written so that swap is a single-file change: everything else calls `isRateLimited()`
 * and doesn't need to know how it's implemented underneath.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = Number(import.meta.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const MAX_REQUESTS = Number(import.meta.env.RATE_LIMIT_MAX_REQUESTS ?? 5);

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(identifier, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}

/** Best-effort client identifier from a request — IP via common proxy headers. */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
