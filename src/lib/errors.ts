export type AppErrorCode =
  | "INVALID_INPUT"
  | "ACCOUNT_NOT_FOUND"
  | "PRIVATE_PROFILE"
  | "NO_RANKED_MATCHES"
  | "VANITY_NEEDS_KEY"
  | "RATE_LIMITED"
  | "UPSTREAM_RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "INTERNAL";

const STATUS_BY_CODE: Record<AppErrorCode, number> = {
  INVALID_INPUT: 400,
  ACCOUNT_NOT_FOUND: 404,
  PRIVATE_PROFILE: 403,
  NO_RANKED_MATCHES: 422,
  VANITY_NEEDS_KEY: 400,
  RATE_LIMITED: 429,
  UPSTREAM_RATE_LIMITED: 503,
  UPSTREAM_ERROR: 502,
  INTERNAL: 500,
};

export const DEFAULT_MESSAGES: Record<AppErrorCode, string> = {
  INVALID_INPUT: "Проверьте введённые данные: ссылка на профиль или MMR указаны неверно.",
  ACCOUNT_NOT_FOUND:
    "Аккаунт не найден. Убедитесь, что ссылка ведёт на существующий Steam / Dotabuff профиль.",
  PRIVATE_PROFILE:
    "История матчей скрыта. Включите «Общедоступная история матчей» в настройках Dota 2 (Настройки → Сообщество) и сыграйте матч, чтобы данные появились.",
  NO_RANKED_MATCHES:
    "У этого аккаунта нет рейтинговых матчей за доступный период — анализировать нечего.",
  VANITY_NEEDS_KEY:
    "Это короткая ссылка Steam (vanity URL). Вставьте ссылку вида steamcommunity.com/profiles/…, ссылку Dotabuff / OpenDota или числовой ID.",
  RATE_LIMITED: "Слишком много запросов. Подождите минуту и попробуйте снова.",
  UPSTREAM_RATE_LIMITED:
    "Лимит запросов к OpenDota временно исчерпан. Попробуйте через пару минут.",
  UPSTREAM_ERROR:
    "Не удалось связаться с OpenDota. Обычно это временный сбой — попробуйте ещё раз. Если ошибка повторяется, сервер не может выйти в интернет: откройте /api/health для диагностики.",
  INTERNAL: "Что-то пошло не так на нашей стороне. Попробуйте ещё раз.",
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, message?: string) {
    super(message ?? DEFAULT_MESSAGES[code]);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  console.error("[mmr-oracle] unexpected error:", error);
  return new AppError("INTERNAL");
}
