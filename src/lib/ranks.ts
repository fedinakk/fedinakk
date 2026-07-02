/**
 * MMR → rank medal mapping. Valve does not publish exact thresholds;
 * these are the community-accepted approximations (each medal spans
 * ~770 MMR, each star ~154 MMR).
 */

export interface Medal {
  key: MedalKey;
  name: string;
  stars: number; // 1..5, Immortal has 0
  colors: { from: string; to: string; ring: string };
}

export type MedalKey =
  | "herald"
  | "guardian"
  | "crusader"
  | "archon"
  | "legend"
  | "ancient"
  | "divine"
  | "immortal";

interface MedalDef {
  key: MedalKey;
  name: string;
  floor: number;
  colors: { from: string; to: string; ring: string };
}

const MEDALS: MedalDef[] = [
  { key: "herald", name: "Герольд", floor: 0, colors: { from: "#9ca3af", to: "#4b5563", ring: "#6b7280" } },
  { key: "guardian", name: "Страж", floor: 770, colors: { from: "#a7f3d0", to: "#059669", ring: "#10b981" } },
  { key: "crusader", name: "Крестоносец", floor: 1540, colors: { from: "#93c5fd", to: "#1d4ed8", ring: "#3b82f6" } },
  { key: "archon", name: "Архонт", floor: 2310, colors: { from: "#c4b5fd", to: "#6d28d9", ring: "#8b5cf6" } },
  { key: "legend", name: "Легенда", floor: 3080, colors: { from: "#fcd34d", to: "#d97706", ring: "#f59e0b" } },
  { key: "ancient", name: "Властелин", floor: 3850, colors: { from: "#fdba74", to: "#c2410c", ring: "#f97316" } },
  { key: "divine", name: "Божество", floor: 4620, colors: { from: "#f9a8d4", to: "#be185d", ring: "#ec4899" } },
  { key: "immortal", name: "Титан", floor: 5620, colors: { from: "#fca5a5", to: "#991b1b", ring: "#ef4444" } },
];

const STAR_SPAN = 154;

export function mmrToMedal(mmr: number): Medal {
  const safe = Math.max(0, mmr);
  let def = MEDALS[0]!;
  for (const m of MEDALS) {
    if (safe >= m.floor) def = m;
  }
  if (def.key === "immortal") {
    return { key: def.key, name: def.name, stars: 0, colors: def.colors };
  }
  const stars = Math.min(5, Math.floor((safe - def.floor) / STAR_SPAN) + 1);
  return { key: def.key, name: def.name, stars, colors: def.colors };
}

/** OpenDota rank_tier (e.g. 54 = Legend ★4) → human label. */
export function rankTierToLabel(rankTier: number | null | undefined): string | null {
  if (!rankTier) return null;
  const tier = Math.floor(rankTier / 10) - 1;
  const stars = rankTier % 10;
  const def = MEDALS[Math.min(Math.max(tier, 0), MEDALS.length - 1)]!;
  if (def.key === "immortal") return def.name;
  return `${def.name} ${"★".repeat(Math.max(1, Math.min(5, stars)))}`;
}
