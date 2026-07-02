/** Subset of OpenDota responses that the analytics engine consumes. */

export interface OpenDotaPlayer {
  profile?: {
    account_id: number;
    personaname?: string;
    name?: string | null;
    avatarfull?: string;
    steamid?: string;
    profileurl?: string;
    fh_unavailable?: boolean | null;
  } | null;
  rank_tier?: number | null;
  leaderboard_rank?: number | null;
}

/** One row of GET /players/{id}/matches with projected fields. */
export interface OpenDotaPlayerMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  hero_id: number;
  start_time: number;
  duration: number;
  game_mode: number;
  lobby_type: number;
  /** Replay parse version — non-null means lane data is reliable. */
  version: number | null;
  kills: number;
  deaths: number;
  assists: number;
  average_rank: number | null;
  leaver_status: number | null;
  party_size: number | null;
  gold_per_min: number | null;
  xp_per_min: number | null;
  hero_damage: number | null;
  tower_damage: number | null;
  hero_healing: number | null;
  last_hits: number | null;
  lane: number | null;
  /** 1 = safe, 2 = mid, 3 = off, 4 = jungle (parsed matches only). */
  lane_role: number | null;
  is_roaming: boolean | null;
}

export interface OpenDotaHero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img?: string;
  icon?: string;
}

export type HeroMap = Record<number, OpenDotaHero>;
