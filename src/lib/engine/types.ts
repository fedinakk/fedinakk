/** Shared analysis result contract between the engine, the API and the UI. */

export type RoleKey = "pos1" | "pos2" | "pos3" | "pos4" | "pos5";

export interface PlayerSummary {
  accountId: string;
  personaName: string;
  avatarUrl: string | null;
  opendotaUrl: string;
  rankTier: number | null;
  leaderboardRank: number | null;
}

export interface RoleAnalysis {
  role: RoleKey;
  games: number;
  /** Games pulled from *older* history (beyond the 200-match window) to reach 20. */
  backfilledGames: number;
  wins: number;
  /** Raw winrate, 0..1 */
  winrate: number;
  /** Recency-weighted + Bayes-shrunk winrate, 0..1 */
  weightedWinrate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kda: number;
  /** 0..100, vs role benchmarks */
  impactScore: number;
  /** 0..100, streak-based */
  stability: number;
  /** ± MMR error margin of the role estimate */
  errorMargin: number | null;
  /** null when games < MIN_ROLE_GAMES */
  potentialMmr: number | null;
  /** potentialMmr - currentMmr */
  mmrDelta: number | null;
  insufficientData: boolean;
}

export interface HeroAnalysis {
  heroId: number;
  name: string;
  imageUrl: string | null;
  games: number;
  wins: number;
  winrate: number;
  kda: number;
  /** 0..100 */
  performanceScore: number;
  estimatedMmr: number;
}

export interface SimulationPoint {
  games: number;
  expected: number;
  optimistic: number;
  pessimistic: number;
}

export interface Forecast {
  /** Unix seconds when the potential should be reached at the current pace; null when already there or potential below current. */
  targetDate: number | null;
  /** Ranked games per day, derived from the analysis window. */
  gamesPerDay: number;
  /** Games needed to converge on the potential. */
  gamesToTarget: number;
}

export interface MatchInsights {
  totalMatches: number;
  wins: number;
  losses: number;
  avgDurationMin: number;
  longestWinStreak: number;
  longestLossStreak: number;
  recentForm: { games: number; wins: number; winrate: number };
  /** Share of games queued in a party, 0..1 (null-party rows count as solo). */
  partyRatio: number;
  firstMatchAt: number;
  lastMatchAt: number;
  avgRankTier: number | null;
  /** Share of matches with parsed replays (reliable lane data), 0..1 */
  parsedRatio: number;
  mostPlayedHero: { name: string; games: number } | null;
}

export interface HeroBuckets {
  best: HeroAnalysis[];
  worst: HeroAnalysis[];
  /** High winrate not backed by impact / sample size. */
  overrated: HeroAnalysis[];
  highImpact: HeroAnalysis[];
  all: HeroAnalysis[];
}

export interface AnalysisResult {
  schemaVersion: 2;
  generatedAt: number;
  player: PlayerSummary;
  currentMmr: number;
  potentialMmr: number;
  mmrDelta: number;
  /** ± MMR error margin of the overall estimate (streak-based stability + sample size). */
  errorMargin: number;
  /** Composite 0..100 player score. */
  playerScore: number;
  overallWinrate: number;
  weightedWinrate: number;
  overallImpact: number;
  /** 0..100, streak-based: many alternating win/loss streaks → low. */
  stability: number;
  roles: RoleAnalysis[];
  bestRoles: RoleKey[];
  worstRoles: RoleKey[];
  bestClimbingRole: RoleKey | null;
  heroes: HeroBuckets;
  simulation: SimulationPoint[];
  forecast: Forecast;
  matchInsights: MatchInsights;
  /** Generated natural-language insights (Russian). */
  insights: string[];
}
