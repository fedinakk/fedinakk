import { clamp } from "@/lib/utils";
import {
  CONSISTENCY_ADJ_CLAMP,
  CONSISTENCY_BASELINE,
  CONSISTENCY_TO_MMR,
  CURVE_AMPLITUDE,
  CURVE_SCALE,
  IMPACT_ADJ_CLAMP,
  IMPACT_BASELINE,
  IMPACT_TO_MMR,
  RECENCY_HALF_LIFE,
} from "./constants";

/**
 * Diminishing-returns winrate → MMR delta curve.
 *
 *   Δ(wr) = A · tanh((wr·100 − 50) / S)
 *
 * Anchors (A = 930, S = 15): 55% → +300 · 60% → +555 · 65% → +710 ·
 * 70% → +810 · asymptote ±930. Symmetric below 50%, so bad winrates
 * produce a *negative* delta and the potential drops below current MMR.
 */
export function winrateToMmrDelta(winrate: number): number {
  const x = winrate * 100 - 50;
  return CURVE_AMPLITUDE * Math.tanh(x / CURVE_SCALE);
}

/** index 0 = most recent match; weight halves every RECENCY_HALF_LIFE games. */
export function recencyWeight(index: number): number {
  return Math.pow(0.5, index / RECENCY_HALF_LIFE);
}

/**
 * Bayesian shrinkage: blend `pseudoGames` fake games at 50% winrate into
 * the (weighted) sample so tiny samples cannot claim extreme winrates.
 */
export function shrunkWinrate(weightedWins: number, weightedGames: number, pseudoGames: number): number {
  if (weightedGames <= 0) return 0.5;
  return (weightedWins + pseudoGames * 0.5) / (weightedGames + pseudoGames);
}

/** Impact score (0..100) → MMR adjustment, clamped. */
export function impactAdjustment(impact: number): number {
  return clamp((impact - IMPACT_BASELINE) * IMPACT_TO_MMR, -IMPACT_ADJ_CLAMP, IMPACT_ADJ_CLAMP);
}

/** Consistency score (0..100) → MMR adjustment, clamped. */
export function consistencyAdjustment(consistency: number): number {
  return clamp(
    (consistency - CONSISTENCY_BASELINE) * CONSISTENCY_TO_MMR,
    -CONSISTENCY_ADJ_CLAMP,
    CONSISTENCY_ADJ_CLAMP,
  );
}
