import { cacheGet, cacheSet } from "@/lib/cache";
import { AppError } from "@/lib/errors";
import { prisma, safeDb } from "@/lib/prisma";
import type { HeroMap, OpenDotaHero, OpenDotaPlayer, OpenDotaPlayerMatch } from "./types";

const BASE_URL = "https://api.opendota.com/api";
const RANKED_LOBBY = 7;
const MATCH_LIMIT = 200;
const REQUEST_TIMEOUT_MS = 25_000;

/** Extra per-match fields we ask OpenDota to project into the response. */
const MATCH_PROJECTIONS = [
  "hero_id",
  "start_time",
  "duration",
  "game_mode",
  "lobby_type",
  "version",
  "kills",
  "deaths",
  "assists",
  "average_rank",
  "leaver_status",
  "party_size",
  "gold_per_min",
  "xp_per_min",
  "hero_damage",
  "tower_damage",
  "hero_healing",
  "last_hits",
  "lane",
  "lane_role",
  "is_roaming",
];

async function openDota<T>(path: string, params: Record<string, string | string[]> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, v));
    else url.searchParams.set(key, value);
  }
  if (process.env.OPENDOTA_API_KEY) {
    url.searchParams.set("api_key", process.env.OPENDOTA_API_KEY);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[mmr-oracle] OpenDota request failed: ${path}`, error);
    throw new AppError("UPSTREAM_ERROR");
  }

  if (res.status === 429) throw new AppError("UPSTREAM_RATE_LIMITED");
  if (res.status === 404) throw new AppError("ACCOUNT_NOT_FOUND");
  if (!res.ok) {
    console.error(`[mmr-oracle] OpenDota ${path} responded ${res.status}`);
    throw new AppError("UPSTREAM_ERROR");
  }

  return (await res.json()) as T;
}

export async function fetchPlayer(accountId: number): Promise<OpenDotaPlayer> {
  return openDota<OpenDotaPlayer>(`/players/${accountId}`);
}

/** Last 200 ranked matches, newest first, with all projected stats. */
export async function fetchRankedMatches(accountId: number): Promise<OpenDotaPlayerMatch[]> {
  const matches = await openDota<OpenDotaPlayerMatch[]>(`/players/${accountId}/matches`, {
    limit: String(MATCH_LIMIT),
    lobby_type: String(RANKED_LOBBY),
    project: MATCH_PROJECTIONS,
  });
  return matches.sort((a, b) => b.start_time - a.start_time);
}

/** Cheap probe used to distinguish "private profile" from "no ranked games". */
export async function hasAnyMatches(accountId: number): Promise<boolean> {
  const matches = await openDota<Array<{ match_id: number }>>(`/players/${accountId}/matches`, {
    limit: "1",
  });
  return matches.length > 0;
}

const HEROES_CACHE_KEY = "opendota:heroes:v1";
const HEROES_TTL_MS = 24 * 60 * 60 * 1000;

/** Hero constants (names, roles, portraits), cached in memory + DB for 24h. */
export async function fetchHeroes(): Promise<HeroMap> {
  const memory = cacheGet<HeroMap>(HEROES_CACHE_KEY);
  if (memory) return memory;

  const fromDb = await safeDb(() =>
    prisma.apiCache.findUnique({ where: { key: HEROES_CACHE_KEY } }),
  );
  if (fromDb && fromDb.expiresAt.getTime() > Date.now()) {
    const map = fromDb.value as unknown as HeroMap;
    cacheSet(HEROES_CACHE_KEY, map, HEROES_TTL_MS);
    return map;
  }

  const raw = await openDota<Record<string, OpenDotaHero>>("/constants/heroes");
  const map: HeroMap = {};
  for (const hero of Object.values(raw)) map[hero.id] = hero;

  cacheSet(HEROES_CACHE_KEY, map, HEROES_TTL_MS);
  await safeDb(() =>
    prisma.apiCache.upsert({
      where: { key: HEROES_CACHE_KEY },
      create: {
        key: HEROES_CACHE_KEY,
        value: map as object,
        expiresAt: new Date(Date.now() + HEROES_TTL_MS),
      },
      update: {
        value: map as object,
        expiresAt: new Date(Date.now() + HEROES_TTL_MS),
      },
    }),
  );

  return map;
}

const HERO_CDN = "https://cdn.cloudflare.steamstatic.com";

export function heroImageUrl(hero: OpenDotaHero | undefined): string | null {
  if (!hero) return null;
  if (hero.img) return `${HERO_CDN}${hero.img}`;
  const short = hero.name.replace("npc_dota_hero_", "");
  return `${HERO_CDN}/apps/dota2/images/dota_react/heroes/${short}.png`;
}
