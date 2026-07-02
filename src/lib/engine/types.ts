/** Shared analysis result contract between the engine, the API and the UI. */

export type RoleKey = "pos1" | "pos2" | "pos3" | "pos4" | "pos5";

export interface PlayerSummary {
  accountId: string;
  personaName: string;
  avatarUrl: string | null;
  steamProfileUrl: string;
  dotabuffUrl: string;
  opendotaUrl: string;
  rankTier: number | null;
  leaderboardRank: number | null;
}

export interface RoleAnalysis {
  role: RoleKey;
  games: number;
  wins: number;
  /** Raw winrate, 0..1 */
  winrate: number;
  /** Recency-weighted + Bayes-shrunk winrate, 0..1 */
  weightedWinrate: number;
  kda: number;
  gpm: number;
  xpm: number;
  heroDamagePerMin: number;
  towerDamagePerMin: number;
  deathsPerGame: number;
  /** Vision/heal/assist proxy, 0..100 */
  supportScore: number;
  /** 0..100 */
  impactScore: number;
  /** 0..100 */
  consistency: number;
  /** null when games < MIN_ROLE_GAMES */
  potentialMmr: number | null;
  /** potentialMmr - currentMmr */
  mmrDelta: number | null;
  /** 0..100 */
  confidence: number;
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
  /** 0..100 */
  confidence: number;
}

export interface TrendPoint {
  /** e.g. "1–20" (oldest bucket) … "181–200" (newest) */
  label: string;
  games: number;
  /** 0..100 */
  winratePct: number;
  /** 0..100 */
  impact: number;
}

export interface SimulationPoint {
  games: number;
  expected: number;
  optimistic: number;
  pessimistic: number;
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
  schemaVersion: 1;
  generatedAt: number;
  player: PlayerSummary;
  currentMmr: number;
  potentialMmr: number;
  mmrDelta: number;
  /** Composite 0..100 player score. */
  playerScore: number;
  /** 0..100 */
  overallConfidence: number;
  overallWinrate: number;
  weightedWinrate: number;
  overallImpact: number;
  overallConsistency: number;
  roles: RoleAnalysis[];
  bestRoles: RoleKey[];
  worstRoles: RoleKey[];
  bestClimbingRole: RoleKey | null;
  heroes: HeroBuckets;
  trend: TrendPoint[];
  simulation: SimulationPoint[];
  matchInsights: MatchInsights;
  /** Generated natural-language insights (Russian). */
  insights: string[];
}
