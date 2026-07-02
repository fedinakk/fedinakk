import { formatNumber, formatSigned, plural, round } from "@/lib/utils";
import { ROLES } from "./constants";
import type { AnalysisResult } from "./types";

type InsightContext = Omit<AnalysisResult, "insights">;

/**
 * Template-based natural-language insights (Russian). Deterministic —
 * same analysis always produces the same text.
 */
export function generateInsights(ctx: InsightContext): string[] {
  const out: string[] = [];
  const { mmrDelta, potentialMmr } = ctx;

  if (mmrDelta > 100) {
    out.push(
      `Модель оценивает ваш потолок в ${formatNumber(potentialMmr)} MMR — это на ${formatNumber(mmrDelta)} выше текущего рейтинга. Ваш винрейт и импакт говорят, что вы играете ниже своего реального уровня.`,
    );
  } else if (mmrDelta < -100) {
    out.push(
      `Расчётный потолок — ${formatNumber(potentialMmr)} MMR (${formatSigned(mmrDelta)} к текущему). Текущая форма не подтверждает ваш рейтинг: без изменений в игре его будет трудно удержать.`,
    );
  } else {
    out.push(
      `Вы играете почти вплотную к своему расчётному потолку (${formatNumber(potentialMmr)} MMR). Для дальнейшего роста нужно улучшать саму игру, а не только количество матчей.`,
    );
  }

  const best = ctx.bestClimbingRole ? ctx.roles.find((r) => r.role === ctx.bestClimbingRole) : undefined;
  if (best && best.potentialMmr != null) {
    out.push(
      `Лучшая роль для подъёма рейтинга — ${ROLES[best.role].label.toLowerCase()}: ${round(best.winrate * 100, 1)}% побед в ${best.games} ${plural(best.games, "игре", "играх", "играх")} и импакт ${round(best.impactScore)} из 100. Потенциал на этой роли — ${formatNumber(best.potentialMmr)} MMR.`,
    );
  }

  const worstKey = ctx.worstRoles[0];
  const worst = worstKey ? ctx.roles.find((r) => r.role === worstKey) : undefined;
  if (worst && worst.potentialMmr != null && worst.role !== best?.role && worst.winrate < 0.5) {
    out.push(
      `${ROLES[worst.role].label} сейчас тянет рейтинг вниз: ${round(worst.winrate * 100, 1)}% побед за ${worst.games} ${plural(worst.games, "игру", "игры", "игр")}. В ранкеде эту роль лучше временно избегать.`,
    );
  }

  const topHero = ctx.heroes.best[0];
  if (topHero) {
    out.push(
      `${topHero.name} — ваш главный герой для рейтинга: ${round(topHero.winrate * 100, 1)}% побед в ${topHero.games} ${plural(topHero.games, "игре", "играх", "играх")} при перформансе ${round(topHero.performanceScore)}.`,
    );
  }

  const trap = ctx.heroes.overrated[0];
  if (trap && trap.heroId !== topHero?.heroId) {
    out.push(
      `Осторожно с ${trap.name}: винрейт ${round(trap.winrate * 100, 1)}% выглядит завышенным — ${trap.games < 10 ? "выборка слишком мала" : "реальный импакт в этих играх низкий"}, и модель не считает его надёжным источником MMR.`,
    );
  }

  if (ctx.overallConsistency >= 65) {
    out.push(
      "Вы играете стабильно от матча к матчу — это признак того, что ваш винрейт не случайность, и прогноз модели имеет высокую достоверность.",
    );
  } else if (ctx.overallConsistency < 45) {
    out.push(
      "Импакт сильно скачет от игры к игре. Стабильность — самый быстрый способ поднять ваш потолок: меньше рискованных пиков, больше отработанных героев.",
    );
  }

  const rf = ctx.matchInsights.recentForm;
  const diff = rf.winrate - ctx.overallWinrate;
  if (diff >= 0.1) {
    out.push(
      `Последние ${rf.games} ${plural(rf.games, "игра", "игры", "игр")} заметно лучше вашего среднего уровня (${round(rf.winrate * 100)}% побед) — вы на подъёме, сейчас хорошее время для ранкеда.`,
    );
  } else if (diff <= -0.1) {
    out.push(
      `Последние ${rf.games} ${plural(rf.games, "игра", "игры", "игр")} идут тяжело — всего ${round(rf.winrate * 100)}% побед. Короткая пауза или пара игр на комфортных героях помогут выйти из спирали поражений.`,
    );
  }

  if (ctx.matchInsights.partyRatio > 0.5) {
    out.push(
      `Больше половины матчей (${round(ctx.matchInsights.partyRatio * 100)}%) сыграно в пати — соло-рейтинг может отличаться от этого прогноза.`,
    );
  }

  return out;
}
