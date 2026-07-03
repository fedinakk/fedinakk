"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/lib/engine/constants";
import type { AnalysisResult } from "@/lib/engine/types";
import { plural, round } from "@/lib/utils";

export function ConfidencePanel({ result }: { result: AnalysisResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Метрики достоверности</CardTitle>
        <CardDescription>
          Насколько можно доверять прогнозу: больше матчей и спарсенных реплеев — точнее модель.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Общая достоверность</span>
            <span className="font-semibold tabular-nums text-ember-300">{result.overallConfidence}%</span>
          </div>
          <Progress value={result.overallConfidence} />
        </div>

        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {result.roles.map((role) => (
            <div key={role.role} className="flex items-center gap-3 text-sm">
              <span className="w-20 shrink-0 text-muted-foreground">{ROLES[role.role].shortLabel}</span>
              <Progress value={role.confidence} className="h-1.5" />
              <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {round(role.confidence)}% · {role.games} {plural(role.games, "игра", "игры", "игр")}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-black/20 p-4 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ember-500/80" />
          <p>
            Проанализировано {result.matchInsights.totalMatches}{" "}
            {plural(result.matchInsights.totalMatches, "рейтинговый матч", "рейтинговых матча", "рейтинговых матчей")},{" "}
            из них {round(result.matchInsights.parsedRatio * 100)}% со спарсенными реплеями (для них роли
            определяются точнее). Если на роли меньше 20 игр в окне, движок добирает более старые матчи
            (это снижает достоверность роли и помечается в её карточке); роли, не набравшие 20 игр даже
            так, исключены из прогноза. Оценка — статистическая модель, а не гарантия: реальный рейтинг
            зависит от вас.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
