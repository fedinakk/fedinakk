import { AppError } from "@/lib/errors";

/** Steam64 = Dota account_id + this offset. */
const STEAM64_BASE = 76561197960265728n;

export type ProfileRef =
  | { kind: "accountId"; accountId: number }
  | { kind: "vanity"; vanity: string };

/**
 * Accepts:
 *  - https://steamcommunity.com/profiles/76561198012345678
 *  - https://steamcommunity.com/id/vanityname
 *  - https://www.dotabuff.com/players/123456789
 *  - https://www.opendota.com/players/123456789
 *  - https://stratz.com/players/123456789
 *  - raw numeric id (Steam64 or Dota account id)
 */
export function parseProfileInput(raw: string): ProfileRef {
  const input = raw.trim();
  if (!input) throw new AppError("INVALID_INPUT");

  // Raw numeric id
  if (/^\d{1,20}$/.test(input)) {
    return { kind: "accountId", accountId: normalizeToAccountId(input) };
  }

  let url: URL;
  try {
    url = new URL(input.startsWith("http") ? input : `https://${input}`);
  } catch {
    throw new AppError(
      "INVALID_INPUT",
      "Не удалось распознать ссылку. Вставьте ссылку на Steam, Dotabuff или OpenDota профиль.",
    );
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);

  if (host === "steamcommunity.com") {
    if (segments[0] === "profiles" && segments[1] && /^\d+$/.test(segments[1])) {
      return { kind: "accountId", accountId: normalizeToAccountId(segments[1]) };
    }
    if (segments[0] === "id" && segments[1]) {
      return { kind: "vanity", vanity: segments[1] };
    }
    throw new AppError(
      "INVALID_INPUT",
      "Не удалось извлечь ID из ссылки Steam. Нужна ссылка вида steamcommunity.com/profiles/… или steamcommunity.com/id/…",
    );
  }

  if (host === "dotabuff.com" || host === "opendota.com" || host === "stratz.com") {
    if (segments[0] === "players" && segments[1]) {
      const idPart = segments[1].split("-")[0]!;
      if (/^\d+$/.test(idPart)) {
        return { kind: "accountId", accountId: normalizeToAccountId(idPart) };
      }
    }
    throw new AppError(
      "INVALID_INPUT",
      `Не удалось извлечь ID игрока из ссылки ${host}. Нужна ссылка вида ${host}/players/123456789.`,
    );
  }

  throw new AppError(
    "INVALID_INPUT",
    "Поддерживаются ссылки Steam, Dotabuff, OpenDota и Stratz — или числовой ID аккаунта.",
  );
}

function normalizeToAccountId(numeric: string): number {
  const value = BigInt(numeric);
  const accountId = value >= STEAM64_BASE ? value - STEAM64_BASE : value;
  if (accountId <= 0n || accountId > 4294967295n) {
    throw new AppError("INVALID_INPUT", "Похоже, это не валидный ID аккаунта Dota 2.");
  }
  return Number(accountId);
}

export function accountIdToSteam64(accountId: number): string {
  return (BigInt(accountId) + STEAM64_BASE).toString();
}

/** Resolve steamcommunity.com/id/<vanity> via the Steam Web API (needs STEAM_API_KEY). */
export async function resolveVanity(vanity: string): Promise<number> {
  const key = process.env.STEAM_API_KEY;
  if (!key) throw new AppError("VANITY_NEEDS_KEY");

  const url = new URL("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/");
  url.searchParams.set("key", key);
  url.searchParams.set("vanityurl", vanity);

  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new AppError("UPSTREAM_ERROR", "Steam API недоступен. Попробуйте позже.");

  const data = (await res.json()) as { response?: { success?: number; steamid?: string } };
  if (data.response?.success !== 1 || !data.response.steamid) {
    throw new AppError("ACCOUNT_NOT_FOUND", "Steam профиль с таким именем не найден.");
  }
  return normalizeToAccountId(data.response.steamid);
}

export async function resolveProfileToAccountId(raw: string): Promise<number> {
  const ref = parseProfileInput(raw);
  if (ref.kind === "accountId") return ref.accountId;
  return resolveVanity(ref.vanity);
}
