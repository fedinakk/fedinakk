import type { OpenDotaPlayerMatch } from "@/lib/opendota/types";
import { clamp, stddev } from "@/lib/utils";
import { ROLES } from "./constants";
import type { RoleKey } from "./types";

/**
 * Impact score of a single match, 0..100, measured against the
 * benchmarks of the role it was played on. 50 ≈ "expected for the role".
 *
 * Each metric is turned into a ratio vs the role benchmark, clamped to
 * [0, 2] (so one insane game can't dominate), then blended with the
 * role's metric weights. Deaths act as a multiplier: dying far above the
 * role's norm bleeds up to 30% of the score.
 */
export function matchImpact(match: OpenDotaPlayerMatch, role: RoleKey): number {
  const meta = ROLES[role];
  const b = meta.benchmarks;
  const w = meta.weights;
  const minutes = Math.max(1, match.duration / 60);

  const kills = match.kills ?? 0;
  const deaths = match.deaths ?? 0;
  const assists = match.assists ?? 0;

  // Fighting contribution: assists count 70% of a kill.
  const kdaValue = (kills + assists * 0.7) / Math.max(1, deaths);
  const supportPerMin =
    (match.hero_healing ?? 0) / minutes + (assists / minutes) * 12;

  const ratios = {
    kda: clamp(kdaValue / b.kda, 0, 2),
    gpm: clamp((match.gold_per_min ?? 0) / b.gpm, 0, 2),
    xpm: clamp((match.xp_per_min ?? 0) / b.xpm, 0, 2),
    heroDamage: clamp((match.hero_damage ?? 0) / minutes / b.heroDamagePerMin, 0, 2),
    towerDamage: clamp((match.tower_damage ?? 0) / minutes / b.towerDamagePerMin, 0, 2),
    support: clamp(supportPerMin / b.supportPerMin, 0, 2),
  };

  const blended =
    ratios.kda * w.kda +
    ratios.gpm * w.gpm +
    ratios.xpm * w.xpm +
    ratios.heroDamage * w.heroDamage +
    ratios.towerDamage * w.towerDamage +
    ratios.support * w.support;

  // blended ∈ [0, 2], 1.0 = exactly at benchmark → 50 points.
  let score = blended * 50;

  const deathOverage = deaths / Math.max(1, b.deaths);
  if (deathOverage > 1) {
    score *= clamp(1 - (deathOverage - 1) * 0.25, 0.7, 1);
  }

  return clamp(score, 0, 100);
}

/** Support output proxy (healing + assist tempo), 0..100 where 50 = benchmark. */
export function supportScore(matches: OpenDotaPlayerMatch[], role: RoleKey): number {
  if (matches.length === 0) return 0;
  const b = ROLES[role].benchmarks;
  const perMatch = matches.map((m) => {
    const minutes = Math.max(1, m.duration / 60);
    const value = (m.hero_healing ?? 0) / minutes + ((m.assists ?? 0) / minutes) * 12;
    return clamp(value / b.supportPerMin, 0, 2) * 50;
  });
  return clamp(perMatch.reduce((a, v) => a + v, 0) / perMatch.length, 0, 100);
}

/**
 * Consistency 0..100: how stable the impact is game-to-game.
 * An impact stddev of ~10 is very steady, ~30+ is coin-flip Dota.
 */
export function consistencyScore(impacts: number[]): number {
  if (impacts.length < 3) return 50;
  const sd = stddev(impacts);
  return clamp(100 - sd * 2.4, 0, 100);
}
