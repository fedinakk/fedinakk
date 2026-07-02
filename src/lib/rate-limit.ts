/**
 * Sliding-window rate limiter (per-process). Good enough for a single
 * instance; for horizontal scaling move the window to Redis.
 */

const globalForRl = globalThis as unknown as { __rlWindows?: Map<string, number[]> };

const windows: Map<string, number[]> = globalForRl.__rlWindows ?? new Map();
if (process.env.NODE_ENV !== "production") globalForRl.__rlWindows = windows;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (windows.get(key) ?? []).filter((t) => t > cutoff);

  if (hits.length >= limit) {
    windows.set(key, hits);
    const retryAfterSec = Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000));
    return { ok: false, remaining: 0, retryAfterSec };
  }

  hits.push(now);
  windows.set(key, hits);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (windows.size > 2000) {
    for (const [k, v] of windows) {
      if (v.every((t) => t <= cutoff)) windows.delete(k);
    }
  }

  return { ok: true, remaining: limit - hits.length, retryAfterSec: 0 };
}

export function clientIpFrom(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
