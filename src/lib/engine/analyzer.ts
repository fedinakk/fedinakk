import { AppError } from "@/lib/errors";
import {
  fetchHeroes,
  fetchPlayer,
  fetchRankedMatches,
  hasAnyMatches,
} from "@/lib/opendota/client";
import type { HeroMap, OpenDotaPlayerMatch } from "@/lib/opendota/types";
import { accountIdToSteam64 } from "@/lib/steam";
import { clamp, mean, round, roundMmr } from "@/lib/utils";
import {
  MAX_HISTORY_DEPTH,
  MIN_MATCH_DURATION_SEC,
  MIN_ROLE_GAMES,
  MMR_MAX,
  MMR_MIN,
  ROLES,
  ROLE_ORDER,
  SHRINK_OVERALL,
  SHRINK_ROLE,
} from "./constants";
import { analyzeHeroes } from "./heroes";
import { generateInsights } from "./insights";
import {
  consistencyAdjustment,
  impactAdjustment,
  recencyWeight,
  roleRecencyWeight,
  shrunkWinrate,
  winrateToMmrDelta,
} from "./mmr";
import { consistencyScore, matchImpact, supportScore } from "./performance";
import { inferPosition } from "./roles";
import type {
  AnalysisResult,
  MatchInsights,
  RoleAnalysis,
  RoleKey,
  SimulationPoint,
  TrendPoint,
} from "./types";

export interface EnrichedMatch {
  match: OpenDotaPlayerMatch;
  /** 0 = most recent */
  index: number;
  won: boolean;
  role: RoleKey;
  impact: number;
  weight: number;
  parsed: boolean;
  /** true when pulled from beyond the 200-match window (role backfill). */
  backfilled: boolean;
}

export async function analyzeAccount(accountId: number, currentMmr: number): Promise<AnalysisResult> {
  const [player, rawMatches, heroMap] = await Promise.all([
    fetchPlayer(accountId),
    fetchRankedMatches(accountId),
    fetchHeroes(),
  ]);

  if (!player.profile) throw new AppError("ACCOUNT_NOT_FOUND");

  const matches = rawMatches.filter(
    (m) => m.hero_id > 0 && m.duration >= MIN_MATCH_DURATION_SEC,
  );

  if (matches.length === 0) {
    if (player.profile.fh_unavailable) throw new AppError("PRIVATE_PROFILE");
    const visible = await hasAnyMatches(accountId);
    throw new AppError(visible ? "NO_RANKED_MATCHES" : "PRIVATE_PROFILE");
  }

  // ---- enrich (newest first) ---------------------------------------------
  const enrich = (match: OpenDotaPlayerMatch, index: number, backfilled: boolean): EnrichedMatch => {
    const hero = heroMap[match.hero_id];
    const role = inferPosition(match, hero);
    const won = match.player_slot < 128 === match.radiant_win;
    return {
      match,
      index,
      won,
      role,
      impact: matchImpact(match, role),
      weight: recencyWeight(index),
      parsed: match.version != null,
      backfilled,
    };
  };

  const enriched: EnrichedMatch[] = matches.map((match, index) => enrich(match, index, false));

  // ---- role backfill --------------------------------------------------------
  // Roles with fewer than MIN_ROLE_GAMES inside the 200-match window are
  // topped up from older history (page by page, capped) so their stats can
  // still be shown. Backfilled games feed ONLY the per-role analysis — the
  // overall potential, trends, heroes and match insights stay on the window.
  const backfillByRole = new Map<RoleKey, EnrichedMatch[]>();
  const roleCount = (key: RoleKey) =>
    enriched.filter((m) => m.role === key).length + (backfillByRole.get(key)?.length ?? 0);

  if (rawMatches.length >= 200) {
    let offset = 200;
    while (offset < MAX_HISTORY_DEPTH && ROLE_ORDER.some((r) => roleCount(r) < MIN_ROLE_GAMES)) {
      const page = await fetchRankedMatches(accountId, offset);
      const usable = page.filter((m) => m.hero_id > 0 && m.duration >= MIN_MATCH_DURATION_SEC);
      for (const [i, match] of usable.entries()) {
        const em = enrich(match, offset + i, true);
        if (roleCount(em.role) >= MIN_ROLE_GAMES) continue;
        const list = backfillByRole.get(em.role) ?? [];
        list.push(em);
        backfillByRole.set(em.role, list);
      }
      if (page.length < 200) break; // end of match history
      offset += 200;
    }
  }

  // ---- overall -------------------------------------------------------------
  const totalGames = enriched.length;
  const wins = enriched.filter((m) => m.won).length;
  const overallWinrate = wins / totalGames;

  const weightSum = enriched.reduce((a, m) => a + m.weight, 0);
  const weightedWins = enriched.reduce((a, m) => a + (m.won ? m.weight : 0), 0);
  const weightedWinrate = shrunkWinrate(weightedWins, weightSum, SHRINK_OVERALL);

  const overallImpact = enriched.reduce((a, m) => a + m.impact * m.weight, 0) / weightSum;
  const overallConsistency = consistencyScore(enriched.map((m) => m.impact));
  const parsedRatio = enriched.filter((m) => m.parsed).length / totalGames;

  const overallDelta =
    winrateToMmrDelta(weightedWinrate) +
    impactAdjustment(overallImpact) +
    consistencyAdjustment(overallConsistency);

  const potentialMmr = roundMmr(clamp(currentMmr + overallDelta, MMR_MIN, MMR_MAX));
  const overallConfidence = round(
    clamp(Math.min(1, totalGames / 120) * 70 + parsedRatio * 30, 0, 100),
  );

  // ---- roles ---------------------------------------------------------------
  // Window games first (newest first), then backfilled older games.
  const roles = ROLE_ORDER.map((key) =>
    analyzeRole(
      key,
      [...enriched.filter((m) => m.role === key), ...(backfillByRole.get(key) ?? [])],
      currentMmr,
    ),
  );

  const sufficient = roles.filter((r) => !r.insufficientData && r.potentialMmr != null);
  const byPotential = [...sufficient].sort((a, b) => b.potentialMmr! - a.potentialMmr!);
  const bestRoles = byPotential.slice(0, 2).map((r) => r.role);
  const worstRoles = byPotential
    .slice(-2)
    .filter((r) => !bestRoles.includes(r.role))
    .map((r) => r.role)
    .reverse();
  const bestClimbingRole = byPotential[0]?.role ?? null;

  // ---- the rest --------------------------------------------------------------
  const heroes = analyzeHeroes(enriched, heroMap, currentMmr);
  const trend = buildTrend(enriched);
  const simulation = buildSimulation(currentMmr, potentialMmr);
  const matchInsights = buildMatchInsights(enriched, heroMap, parsedRatio);
  const playerScore = computePlayerScore(weightedWinrate, overallImpact, overallConsistency, roles);

  const partial: Omit<AnalysisResult, "insights"> = {
    schemaVersion: 1,
    generatedAt: Date.now(),
    player: {
      accountId: String(accountId),
      personaName: player.profile.personaname ?? "Неизвестный игрок",
      avatarUrl: player.profile.avatarfull ?? null,
      steamProfileUrl:
        player.profile.profileurl ?? `https://steamcommunity.com/profiles/${accountIdToSteam64(accountId)}`,
      dotabuffUrl: `https://www.dotabuff.com/players/${accountId}`,
      opendotaUrl: `https://www.opendota.com/players/${accountId}`,
      rankTier: player.rank_tier ?? null,
      leaderboardRank: player.leaderboard_rank ?? null,
    },
    currentMmr,
    potentialMmr,
    mmrDelta: potentialMmr - currentMmr,
    playerScore,
    overallConfidence,
    overallWinrate: round(overallWinrate, 4),
    weightedWinrate: round(weightedWinrate, 4),
    overallImpact: round(overallImpact, 1),
    overallConsistency: round(overallConsistency, 1),
    roles,
    bestRoles,
    worstRoles,
    bestClimbingRole,
    heroes,
    trend,
    simulation,
    matchInsights,
  };

  return { ...partial, insights: generateInsights(partial) };
}

// ---------------------------------------------------------------------------

function analyzeRole(key: RoleKey, list: EnrichedMatch[], currentMmr: number): RoleAnalysis {
  const meta = ROLES[key];
  const games = list.length;

  if (games === 0) {
    return {
      role: key,
      games: 0,
      backfilledGames: 0,
      wins: 0,
      winrate: 0,
      weightedWinrate: 0.5,
      kda: 0,
      gpm: 0,
      xpm: 0,
      heroDamagePerMin: 0,
      towerDamagePerMin: 0,
      deathsPerGame: 0,
      supportScore: 0,
      impactScore: 0,
      consistency: 0,
      potentialMmr: null,
      mmrDelta: null,
      confidence: 0,
      insufficientData: true,
    };
  }

  const backfilledGames = list.filter((m) => m.backfilled).length;
  const wins = list.filter((m) => m.won).length;
  const winrate = wins / games;

  // Recency is measured in games ON THIS ROLE (list is newest first), so
  // backfilled older games still carry real weight in the estimate.
  const weights = list.map((_, i) => roleRecencyWeight(i));
  const weightSum = weights.reduce((a, w) => a + w, 0);
  const weightedWins = list.reduce((a, m, i) => a + (m.won ? weights[i]! : 0), 0);
  const weightedWinrate = shrunkWinrate(weightedWins, weightSum, SHRINK_ROLE);

  const kills = list.reduce((a, m) => a + (m.match.kills ?? 0), 0);
  const deaths = list.reduce((a, m) => a + (m.match.deaths ?? 0), 0);
  const assists = list.reduce((a, m) => a + (m.match.assists ?? 0), 0);
  const minutes = list.map((m) => Math.max(1, m.match.duration / 60));

  const impacts = list.map((m) => m.impact);
  const impactScore = list.reduce((a, m, i) => a + m.impact * weights[i]!, 0) / weightSum;
  const consistency = consistencyScore(impacts);
  const parsedShare = list.filter((m) => m.parsed).length / games;

  const insufficientData = games < MIN_ROLE_GAMES;
  let potentialMmr: number | null = null;
  if (!insufficientData) {
    const delta =
      winrateToMmrDelta(weightedWinrate) * meta.difficultyMod +
      impactAdjustment(impactScore) +
      consistencyAdjustment(consistency);
    potentialMmr = roundMmr(clamp(currentMmr + delta, MMR_MIN, MMR_MAX));
  }

  // Older (backfilled) games describe the current level less reliably.
  const backfilledShare = backfilledGames / games;
  const confidence = round(
    clamp(Math.min(1, games / 60) * 80 + parsedShare * 20, 0, 100) * (1 - 0.15 * backfilledShare),
  );

  return {
    role: key,
    games,
    backfilledGames,
    wins,
    winrate: round(winrate, 4),
    weightedWinrate: round(weightedWinrate, 4),
    kda: round((kills + assists) / Math.max(1, deaths), 2),
    gpm: round(mean(list.map((m) => m.match.gold_per_min ?? 0))),
    xpm: round(mean(list.map((m) => m.match.xp_per_min ?? 0))),
    heroDamagePerMin: round(mean(list.map((m, i) => (m.match.hero_damage ?? 0) / minutes[i]!))),
    towerDamagePerMin: round(mean(list.map((m, i) => (m.match.tower_damage ?? 0) / minutes[i]!))),
    deathsPerGame: round(deaths / games, 1),
    supportScore: round(supportScore(list.map((m) => m.match), key), 1),
    impactScore: round(impactScore, 1),
    consistency: round(consistency, 1),
    potentialMmr,
    mmrDelta: potentialMmr != null ? potentialMmr - currentMmr : null,
    confidence,
    insufficientData,
  };
}

/** Chronological winrate/impact buckets of 20 games for the trend chart. */
function buildTrend(enriched: EnrichedMatch[]): TrendPoint[] {
  const chronological = [...enriched].reverse(); // oldest → newest
  const bucketSize = 20;
  const points: TrendPoint[] = [];

  for (let start = 0; start < chronological.length; start += bucketSize) {
    const bucket = chronological.slice(start, start + bucketSize);
    if (bucket.length < 5) break;
    const bucketWins = bucket.filter((m) => m.won).length;
    points.push({
      label: `${start + 1}–${start + bucket.length}`,
      games: bucket.length,
      winratePct: round((bucketWins / bucket.length) * 100, 1),
      impact: round(mean(bucket.map((m) => m.impact)), 1),
    });
  }

  return points;
}

/**
 * MMR climb simulation: exponential approach to the potential ceiling
 * (early games move the rating fastest, then progress flattens), with an
 * optimistic/pessimistic band of ±150–200 around the target.
 */
function buildSimulation(currentMmr: number, potentialMmr: number): SimulationPoint[] {
  const points: SimulationPoint[] = [];
  const horizon = 300;
  const step = 25;

  const approach = (games: number, target: number, tau: number) =>
    roundMmr(clamp(currentMmr + (target - currentMmr) * (1 - Math.exp(-games / tau)), MMR_MIN, MMR_MAX));

  for (let g = 0; g <= horizon; g += step) {
    points.push({
      games: g,
      expected: approach(g, potentialMmr, 110),
      optimistic: approach(g, potentialMmr + 150, 95),
      pessimistic: approach(g, Math.max(MMR_MIN, potentialMmr - 200), 130),
    });
  }

  return points;
}

function buildMatchInsights(
  enriched: EnrichedMatch[],
  heroMap: HeroMap,
  parsedRatio: number,
): MatchInsights {
  const chronological = [...enriched].reverse();
  const wins = enriched.filter((m) => m.won).length;

  let winStreak = 0;
  let lossStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  for (const m of chronological) {
    if (m.won) {
      winStreak += 1;
      lossStreak = 0;
    } else {
      lossStreak += 1;
      winStreak = 0;
    }
    longestWinStreak = Math.max(longestWinStreak, winStreak);
    longestLossStreak = Math.max(longestLossStreak, lossStreak);
  }

  const recent = enriched.slice(0, Math.min(20, enriched.length));
  const recentWins = recent.filter((m) => m.won).length;

  const partyGames = enriched.filter((m) => (m.match.party_size ?? 1) > 1).length;
  const ranks = enriched
    .map((m) => m.match.average_rank)
    .filter((r): r is number => r != null && r > 0);

  const heroCounts = new Map<number, number>();
  for (const m of enriched) {
    heroCounts.set(m.match.hero_id, (heroCounts.get(m.match.hero_id) ?? 0) + 1);
  }
  let mostPlayedHero: MatchInsights["mostPlayedHero"] = null;
  for (const [heroId, games] of heroCounts) {
    if (!mostPlayedHero || games > mostPlayedHero.games) {
      mostPlayedHero = {
        name: heroMap[heroId]?.localized_name ?? `Герой #${heroId}`,
        games,
      };
    }
  }

  return {
    totalMatches: enriched.length,
    wins,
    losses: enriched.length - wins,
    avgDurationMin: round(mean(enriched.map((m) => m.match.duration / 60)), 1),
    longestWinStreak,
    longestLossStreak,
    recentForm: {
      games: recent.length,
      wins: recentWins,
      winrate: round(recentWins / Math.max(1, recent.length), 4),
    },
    partyRatio: round(partyGames / enriched.length, 4),
    firstMatchAt: chronological[0]?.match.start_time ?? 0,
    lastMatchAt: enriched[0]?.match.start_time ?? 0,
    avgRankTier: ranks.length > 0 ? round(mean(ranks)) : null,
    parsedRatio: round(parsedRatio, 4),
    mostPlayedHero,
  };
}

/** Composite 0..100 "player score": skill, impact, stability, versatility. */
function computePlayerScore(
  weightedWinrate: number,
  overallImpact: number,
  overallConsistency: number,
  roles: RoleAnalysis[],
): number {
  const wrComponent = clamp((weightedWinrate - 0.4) / 0.3, 0, 1);
  const impactComponent = clamp(overallImpact / 100, 0, 1);
  const consistencyComponent = clamp(overallConsistency / 100, 0, 1);
  // Versatility counts only games inside the current window — backfilled
  // history says nothing about what the player queues today.
  const versatility = roles.filter((r) => r.games - r.backfilledGames >= 10).length / 5;

  return round(
    (wrComponent * 0.4 + impactComponent * 0.3 + consistencyComponent * 0.15 + versatility * 0.15) * 100,
  );
}
