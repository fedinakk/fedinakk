import type { OpenDotaHero, OpenDotaPlayerMatch } from "@/lib/opendota/types";
import type { RoleKey } from "./types";

/**
 * Position inference.
 *
 * OpenDota's per-player match rows only carry `lane_role` (safe/mid/off/
 * jungle) for parsed replays and never a literal "position 1..5", so the
 * position is reconstructed from lane + farm priority + hero archetype:
 *
 *  - mid lane            → pos 2
 *  - roaming             → pos 4
 *  - safe lane           → pos 1 (farming) | pos 5 (support pattern)
 *  - off lane            → pos 3 (farming) | pos 4 (support pattern)
 *  - jungle              → pos 3 core / pos 4 support
 *  - unparsed matches    → farm + hero roles heuristic
 */

const SUPPORT_GPM_CEILING = 420;
const CORE_GPM_FLOOR = 470;

function isSupportHero(hero: OpenDotaHero | undefined): boolean {
  return Boolean(hero?.roles.includes("Support"));
}

function isCarryHero(hero: OpenDotaHero | undefined): boolean {
  return Boolean(hero?.roles.includes("Carry"));
}

/** Does this match row look like it was played as a support? */
function playedAsSupport(match: OpenDotaPlayerMatch, hero: OpenDotaHero | undefined): boolean {
  const gpm = match.gold_per_min ?? 0;
  const minutes = Math.max(1, match.duration / 60);
  const lastHitsPerMin = (match.last_hits ?? 0) / minutes;

  if (gpm >= CORE_GPM_FLOOR) return false;
  if (isSupportHero(hero) && gpm < SUPPORT_GPM_CEILING) return true;
  // Very low farm on any hero is a support pattern.
  return gpm < 300 || lastHitsPerMin < 2;
}

export function inferPosition(match: OpenDotaPlayerMatch, hero: OpenDotaHero | undefined): RoleKey {
  const support = playedAsSupport(match, hero);
  const laneRole = match.version != null ? match.lane_role : null;

  if (match.is_roaming) return "pos4";

  switch (laneRole) {
    case 2:
      return "pos2";
    case 1:
      return support ? "pos5" : "pos1";
    case 3:
      return support ? "pos4" : "pos3";
    case 4:
      return support ? "pos4" : "pos3";
    default:
      break;
  }

  // Unparsed match: fall back to hero archetype + healing output.
  if (support) {
    const minutes = Math.max(1, match.duration / 60);
    const healingPerMin = (match.hero_healing ?? 0) / minutes;
    return healingPerMin > 40 ? "pos5" : "pos4";
  }
  if (isCarryHero(hero)) return "pos1";
  if (hero?.primary_attr === "int" || hero?.roles.includes("Nuker")) return "pos2";
  return "pos3";
}
