/**
 * Tiny in-memory TTL cache. Survives hot reloads in dev via globalThis.
 * For multi-instance deployments swap this for Redis — the call sites
 * only use get/set, so the surface is intentionally minimal.
 */

type Entry = { value: unknown; expiresAt: number };

const globalForCache = globalThis as unknown as { __memCache?: Map<string, Entry> };

const store: Map<string, Entry> = globalForCache.__memCache ?? new Map();
if (process.env.NODE_ENV !== "production") globalForCache.__memCache = store;

const MAX_ENTRIES = 500;

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  if (store.size >= MAX_ENTRIES) {
    // Drop the oldest entries (Map preserves insertion order).
    const overflow = store.size - MAX_ENTRIES + 1;
    let i = 0;
    for (const k of store.keys()) {
      store.delete(k);
      if (++i >= overflow) break;
    }
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}
