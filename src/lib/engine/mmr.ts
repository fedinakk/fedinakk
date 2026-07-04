import { clamp, roundMmr } from "@/lib/utils";
import {
  CURVE_AMPLITUDE,
  CURVE_SCALE,
  DECAY_BLOCK_SIZE,
  DECAY_PER_BLOCK,
  DOM_CENTER,
  DOM_K,
  DOM_MAX_BOOST,
  DOM_MAX_PENALTY,
  DOM_SHRINK,
  DOM_SLOPE,
  IMPACT_ADJ_CLAMP,
  IMPACT_BASELINE,
  IMPACT_TO_MMR,
  MARGIN_BASE,
  MARGIN_FULL_SAMPLE,
  MARGIN_PER_INSTABILITY,
  MARGIN_SMALL_SAMPLE,
  RECENT_FULL_WEIGHT_GAMES,
  STABILITY_ADJ_CLAMP,
  STABILITY_BASELINE,
  STABILITY_TO_MMR,
} from "./constants";

/**
 * Diminishing-returns winrate → MMR delta curve.
 *
 *   Δ(wr) = A · tanh((wr·100 − 50) / S)
 *
 * Anchors (A = 1150, S = 12): 52% → +190 · 55% → +455 · 60% → +785 ·
 * 65% → +975 · 70% → +1070. The step 52→55% is worth ~+265 MMR while
 * 62→65% is worth only ~+100 — the higher the winrate, the cheaper each
 * extra percent. Symmetric below 50%.
 */
export function winrateToMmrDelta(winrate: number): number {
  const x = winrate * 100 - 50;
  return CURVE_AMPLITUDE * Math.tanh(x / CURVE_SCALE);
}

/**
 * Staircase recency weight. index 0 = most recent game (within whatever
 * sequence is being analysed — the whole window or one role's games):
 * the newest 20 games count fully, then every 10 games the weight drops
 * by ×0.85.
 */
export function recencyWeight(index: number): number {
  if (index < RECENT_FULL_WEIGHT_GAMES) return 1;
  const block = Math.floor((index - RECENT_FULL_WEIGHT_GAMES) / DECAY_BLOCK_SIZE) + 1;
  return Math.pow(DECAY_PER_BLOCK, block);
}

/**
 * Bayesian shrinkage: blend `pseudoGames` fake games at 50% winrate into
 * the (weighted) sample so tiny samples cannot claim extreme winrates.
 */
export function shrunkWinrate(weightedWins: number, weightedGames: number, pseudoGames: number): number {
  if (weightedGames <= 0) return 0.5;
  return (weightedWins + pseudoGames * 0.5) / (weightedGames + pseudoGames);
}

function domSigma(x: number): number {
  return 1 / (1 + Math.exp(-(x - DOM_CENTER) / DOM_SLOPE));
}

/**
 * Domination bonus/penalty for sustained extreme winrates (see constants
 * for the model). Uses RAW wins/games of the whole sample — recency
 * weighting is deliberately absent so a hot streak of 20 games cannot
 * unlock it; only a long, sustained winrate can.
 *
 *   ≈0 below 60% · 65% (200 игр) → ~+1800 · 80% (200 игр) → ~+4300
 *   mirrored below 50% (25% → large negative), capped asymmetrically.
 */
export function dominationDelta(
  wins: number,
  games: number,
  currentMmr: number,
  fullSample: number,
): number {
  if (games <= 0) return 0;

  const sustained = (wins + DOM_SHRINK * 0.5) / (games + DOM_SHRINK);
  const above = sustained >= 0.5;
  const extremity = above ? sustained : 1 - sustained;

  const d = Math.max(0, domSigma(extremity) - domSigma(0.5));
  const sampleRamp = Math.min(1, games / fullSample);
  // Mild rating dependence: on low MMR the ladder distortion is larger in
  // relative terms but the absolute headroom estimate is more conservative.
  const headroom = 0.7 + 0.3 * Math.min(1, currentMmr / 6000);

  const magnitude = DOM_K * d * sampleRamp * headroom;
  return above ? Math.min(magnitude, DOM_MAX_BOOST) : -Math.min(magnitude, DOM_MAX_PENALTY);
}

/** Impact score (0..100) → MMR adjustment, clamped. */
export function impactAdjustment(impact: number): number {
  return clamp((impact - IMPACT_BASELINE) * IMPACT_TO_MMR, -IMPACT_ADJ_CLAMP, IMPACT_ADJ_CLAMP);
}

/** Stability score (0..100) → MMR adjustment, clamped. */
export function stabilityAdjustment(stability: number): number {
  return clamp(
    (stability - STABILITY_BASELINE) * STABILITY_TO_MMR,
    -STABILITY_ADJ_CLAMP,
    STABILITY_ADJ_CLAMP,
  );
}

/**
 * ± error margin of an MMR estimate: swingy players (alternating win/loss
 * streaks) and small samples both widen it. Rounded to 25.
 */
export function errorMargin(stability: number, games: number): number {
  const instability = (100 - clamp(stability, 0, 100)) * MARGIN_PER_INSTABILITY;
  const smallSample = (1 - Math.min(1, games / MARGIN_FULL_SAMPLE)) * MARGIN_SMALL_SAMPLE;
  return roundMmr(MARGIN_BASE + instability + smallSample);
}
