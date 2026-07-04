import { heroImageUrl } from "@/lib/opendota/client";
import type { HeroMap } from "@/lib/opendota/types";
import { clamp, round, roundMmr } from "@/lib/utils";
import { DOM_FULL_SAMPLE_HERO, MIN_HERO_GAMES, MMR_MAX, MMR_MIN, SHRINK_HERO } from "./constants";
import { dominationDelta, shrunkWinrate, winrateToMmrDelta } from "./mmr";
import type { EnrichedMatch } from "./analyzer";
import type { HeroAnalysis, HeroBuckets } from "./types";

/**
 * Per-hero aggregation. Low sample sizes are handled twice: the winrate
 * is Bayes-shrunk towards 50% AND the resulting MMR delta is scaled by a
 * games-based mastery factor, so a 3-game 100% hero cannot outrank a
 * 40-game 58% hero.
 *
 * Buckets are mutually honest: "best" requires a positive winrate,
 * "worst" a negative one — a hero can never land in "best" just because
 * the pool is small.
 */
export function analyzeHeroes(
  enriched: EnrichedMatch[],
  heroMap: HeroMap,
  currentMmr: number,
): HeroBuckets {
  const byHero = new Map<number, EnrichedMatch[]>();
  for (const em of enriched) {
    const list = byHero.get(em.match.hero_id) ?? [];
    list.push(em);
    byHero.set(em.match.hero_id, list);
  }

  const all: HeroAnalysis[] = [];
  for (const [heroId, list] of byHero) {
    const hero = heroMap[heroId];
    const games = list.length;
    const wins = list.filter((m) => m.won).length;
    const winrate = wins / games;

    const kills = list.reduce((a, m) => a + (m.match.kills ?? 0), 0);
    const deaths = list.reduce((a, m) => a + (m.match.deaths ?? 0), 0);
    const assists = list.reduce((a, m) => a + (m.match.assists ?? 0), 0);
    const kda = (kills + assists) / Math.max(1, deaths);

    const performance = list.reduce((a, m) => a + m.impact, 0) / games;

    const shrunk = shrunkWinrate(wins, games, SHRINK_HERO);
    const mastery = Math.min(1, games / 15);
    const perfAdj = clamp((performance - 52) * 3, -120, 120);
    const estimatedMmr = roundMmr(
      clamp(
        currentMmr +
          winrateToMmrDelta(shrunk) * mastery +
          dominationDelta(wins, games, currentMmr, DOM_FULL_SAMPLE_HERO) +
          perfAdj,
        MMR_MIN,
        MMR_MAX,
      ),
    );

    all.push({
      heroId,
      name: hero?.localized_name ?? `Герой #${heroId}`,
      imageUrl: heroImageUrl(hero),
      games,
      wins,
      winrate: round(winrate, 4),
      kda: round(kda, 2),
      performanceScore: round(performance, 1),
      estimatedMmr,
    });
  }

  all.sort((a, b) => b.games - a.games);

  const eligible = all.filter((h) => h.games >= MIN_HERO_GAMES);
  const rating = (h: HeroAnalysis) =>
    shrunkWinrate(h.wins, h.games, SHRINK_HERO) * 100 * 0.6 + h.performanceScore * 0.4;

  // Winning heroes only — a 34% hero can never be "best".
  const best = eligible
    .filter((h) => h.winrate >= 0.52)
    .sort((a, b) => rating(b) - rating(a))
    .slice(0, 5);

  // Losing heroes only.
  const worst = eligible
    .filter((h) => h.winrate <= 0.48)
    .sort((a, b) => rating(a) - rating(b))
    .slice(0, 5);

  // Pretty winrate that impact or sample size does not back up.
  const overrated = eligible
    .filter((h) => h.winrate >= 0.55 && (h.performanceScore < 50 || h.games < 8))
    .sort((a, b) => b.winrate - a.winrate)
    .slice(0, 5);

  // Above-benchmark game influence regardless of winrate.
  const highImpact = eligible
    .filter((h) => h.performanceScore >= 55)
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 5);

  return { best, worst, overrated, highImpact, all: all.slice(0, 40) };
}
