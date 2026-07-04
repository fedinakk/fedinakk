import type { OpenDotaPlayerMatch } from "@/lib/opendota/types";
import { clamp } from "@/lib/utils";
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

/**
 * Streak-based stability, 0..100.
 *
 * The win/loss sequence (chronological or reverse — symmetric) is split
 * into maximal runs. Runs of 3+ games count as streaks, weighted by how
 * far they run past 2 games. Then:
 *
 *  - both win- AND loss-streaks present → swings ("качели"): the paired
 *    part counts double — this is the classic unstable pattern;
 *  - loss-streaks beyond the paired part → tilt, counts at a lower rate;
 *  - win-streaks alone → dominance, does not reduce stability;
 *  - no streaks at all → perfectly stable.
 *
 * Calibration: a pure coin-flip 50% player lands near 50; strict
 * alternation → 100; 10-game alternating win/loss blocks → ~0.
 */
export function stabilityFromStreaks(results: boolean[]): number {
  if (results.length < 10) return 50;

  let winScore = 0;
  let lossScore = 0;
  let current: boolean | null = null;
  let run = 0;

  const flush = () => {
    if (current === null || run < 3) return;
    const score = run - 2;
    if (current) winScore += score;
    else lossScore += score;
  };

  for (const won of results) {
    if (won === current) {
      run += 1;
    } else {
      flush();
      current = won;
      run = 1;
    }
  }
  flush();

  const paired = Math.min(winScore, lossScore);
  const tilt = Math.max(0, lossScore - winScore);
  const swing = paired * 2.2 + tilt * 0.8;
  const swingPer100 = (swing / results.length) * 100;

  return clamp(100 - swingPer100 * 1.8, 0, 100);
}
