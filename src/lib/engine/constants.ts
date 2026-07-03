import type { RoleKey } from "./types";

/**
 * ---- MMR curve -----------------------------------------------------------
 * potentialDelta = CURVE_AMPLITUDE * tanh((winrate% - 50) / CURVE_SCALE)
 *
 * Diminishing returns with winrate as the dominant signal:
 *   55% → +370 · 60% → +670 · 65% → +875 · 70% → +1000 · asymptote ±1150
 * Symmetric below 50%, so a losing winrate pulls the potential *below*
 * the current MMR.
 */
export const CURVE_AMPLITUDE = 1150;
export const CURVE_SCALE = 15;

/**
 * ---- Recency weighting ---------------------------------------------------
 * Match #0 is the most recent. Weight halves every RECENCY_HALF_LIFE games,
 * so the newest ~80 games dominate the overall estimate. Role analyses use
 * their own half-life measured in games *on that role*, so backfilled
 * (older) role games still contribute meaningfully.
 */
export const RECENCY_HALF_LIFE = 80;
export const ROLE_RECENCY_HALF_LIFE = 40;

/**
 * ---- Bayesian shrinkage --------------------------------------------------
 * Pseudo-games of 50% winrate blended into every sample: small samples get
 * pulled towards 50%, killing "3 games, 100% winrate" spikes.
 */
export const SHRINK_OVERALL = 10;
export const SHRINK_ROLE = 8;
export const SHRINK_HERO = 8;

export const MIN_ROLE_GAMES = 20;
export const MIN_HERO_GAMES = 5;

/**
 * ---- Role backfill --------------------------------------------------------
 * The core analysis window is the last 200 ranked matches. If a role has
 * fewer than MIN_ROLE_GAMES inside that window, older matches are fetched
 * page by page (up to MAX_HISTORY_DEPTH total) and that role is topped up
 * to MIN_ROLE_GAMES so its stats can still be shown.
 */
export const MAX_HISTORY_DEPTH = 1000;

/** Matches shorter than this are treated as remakes and dropped. */
export const MIN_MATCH_DURATION_SEC = 600;

export const MMR_MIN = 0;
export const MMR_MAX = 15000;

export interface RoleMeta {
  key: RoleKey;
  label: string;
  shortLabel: string;
  description: string;
  /**
   * Role difficulty modifier applied to the winrate→MMR delta: solo-carry
   * roles convert personal skill into rating slightly faster than supports.
   */
  difficultyMod: number;
  benchmarks: {
    gpm: number;
    xpm: number;
    kda: number;
    heroDamagePerMin: number;
    towerDamagePerMin: number;
    deaths: number;
    supportPerMin: number; // healing + ward-proxy per minute
  };
  /** Metric weights for the impact score; must sum to 1. */
  weights: {
    kda: number;
    gpm: number;
    xpm: number;
    heroDamage: number;
    towerDamage: number;
    support: number;
  };
}

export const ROLE_ORDER: RoleKey[] = ["pos1", "pos2", "pos3", "pos4", "pos5"];

export const ROLES: Record<RoleKey, RoleMeta> = {
  pos1: {
    key: "pos1",
    label: "Позиция 1 · Керри",
    shortLabel: "Керри",
    description: "Фарм, тайминги предметов и реализация преимущества в лейте.",
    difficultyMod: 1.0,
    benchmarks: { gpm: 560, xpm: 640, kda: 3.4, heroDamagePerMin: 560, towerDamagePerMin: 240, deaths: 5.2, supportPerMin: 20 },
    weights: { kda: 0.22, gpm: 0.24, xpm: 0.12, heroDamage: 0.22, towerDamage: 0.18, support: 0.02 },
  },
  pos2: {
    key: "pos2",
    label: "Позиция 2 · Мид",
    shortLabel: "Мид",
    description: "Контроль темпа игры, ганги и давление по всей карте.",
    difficultyMod: 1.05,
    benchmarks: { gpm: 550, xpm: 660, kda: 3.5, heroDamagePerMin: 640, towerDamagePerMin: 160, deaths: 5.4, supportPerMin: 20 },
    weights: { kda: 0.26, gpm: 0.2, xpm: 0.16, heroDamage: 0.28, towerDamage: 0.08, support: 0.02 },
  },
  pos3: {
    key: "pos3",
    label: "Позиция 3 · Оффлейн",
    shortLabel: "Оффлейн",
    description: "Инициация, создание пространства и фронтлайн в драках.",
    difficultyMod: 0.98,
    benchmarks: { gpm: 460, xpm: 560, kda: 2.9, heroDamagePerMin: 500, towerDamagePerMin: 110, deaths: 6.4, supportPerMin: 30 },
    weights: { kda: 0.28, gpm: 0.18, xpm: 0.14, heroDamage: 0.28, towerDamage: 0.08, support: 0.04 },
  },
  pos4: {
    key: "pos4",
    label: "Позиция 4 · Роумер",
    shortLabel: "Роумер",
    description: "Ганги, активные предметы и создание хаоса на карте.",
    difficultyMod: 0.95,
    benchmarks: { gpm: 330, xpm: 430, kda: 2.7, heroDamagePerMin: 330, towerDamagePerMin: 55, deaths: 7.2, supportPerMin: 60 },
    weights: { kda: 0.32, gpm: 0.1, xpm: 0.1, heroDamage: 0.24, towerDamage: 0.04, support: 0.2 },
  },
  pos5: {
    key: "pos5",
    label: "Позиция 5 · Саппорт",
    shortLabel: "Саппорт",
    description: "Вижен, спасение союзников и жертва ресурсов ради команды.",
    difficultyMod: 0.92,
    benchmarks: { gpm: 290, xpm: 390, kda: 2.5, heroDamagePerMin: 250, towerDamagePerMin: 40, deaths: 7.6, supportPerMin: 90 },
    weights: { kda: 0.3, gpm: 0.08, xpm: 0.08, heroDamage: 0.16, towerDamage: 0.02, support: 0.36 },
  },
};

/** Performance adjustment: impact points → MMR, and its clamp. */
export const IMPACT_BASELINE = 52;
export const IMPACT_TO_MMR = 5;
export const IMPACT_ADJ_CLAMP = 150;

/** Consistency adjustment: consistency points → MMR, and its clamp. */
export const CONSISTENCY_BASELINE = 55;
export const CONSISTENCY_TO_MMR = 1.5;
export const CONSISTENCY_ADJ_CLAMP = 90;
