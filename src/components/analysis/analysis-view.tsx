"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROLES } from "@/lib/engine/constants";
import type { AnalysisResult } from "@/lib/engine/types";
import { AnalysisSkeleton } from "./analysis-skeleton";
import { ConfidencePanel } from "./confidence-panel";
import { HeroesPanel } from "./heroes-panel";
import { InsightsPanel } from "./insights-panel";
import { MatchInsightsPanel } from "./match-insights-panel";
import { OverallCard } from "./overall-card";
import { RoleCard } from "./role-card";
import { RoleImpactRadar, RolePotentialBarChart } from "./role-charts";
import { Section } from "./section";
import { ShareButton } from "./share-button";
import { SimulationChart } from "./simulation-chart";
import { TrendChart } from "./trend-chart";

type Status = "loading" | "ready" | "missing";

interface AnalysisViewProps {
  shareId: string;
  /** Server-fetched result for shared links; null → resolve on the client. */
  initial: AnalysisResult | null;
}

export function AnalysisView({ shareId, initial }: AnalysisViewProps) {
  const [result, setResult] = React.useState<AnalysisResult | null>(initial);
  const [status, setStatus] = React.useState<Status>(initial ? "ready" : "loading");

  React.useEffect(() => {
    if (result) return;

    // 1) Fresh navigation from the analyze form → result is in sessionStorage.
    try {
      const raw = sessionStorage.getItem(`analysis:${shareId}`);
      if (raw) {
        setResult(JSON.parse(raw) as AnalysisResult);
        setStatus("ready");
        return;
      }
    } catch {
      /* ignore storage failures */
    }

    // 2) Local-only ids never exist on the server.
    if (shareId.startsWith("local-")) {
      setStatus("missing");
      return;
    }

    // 3) Shared link opened cold → fetch the stored snapshot.
    let cancelled = false;
    fetch(`/api/analysis/${shareId}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setStatus("missing");
          return;
        }
        const data = (await res.json()) as { result: AnalysisResult };
        setResult(data.result);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [shareId, result]);

  if (status === "loading") return <AnalysisSkeleton />;
  if (status === "missing" || !result) return <MissingState />;

  return <Dashboard shareId={shareId} result={result} />;
}

function Dashboard({ shareId, result }: { shareId: string; result: AnalysisResult }) {
  const bestSet = new Set(result.bestRoles);
  const worstSet = new Set(result.worstRoles);

  return (
    <div className="container space-y-14 py-10">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft /> Новый анализ
          </Link>
        </Button>
        <ShareButton shareId={shareId} />
      </div>

      {/* 1. overall potential */}
      <OverallCard result={result} />

      {/* 2. model insights */}
      <InsightsPanel insights={result.insights} />

      {/* 3. roles */}
      <Section
        title="Потенциал по"
        accent="ролям"
        description="Прогноз MMR для каждой позиции: винрейт с весом свежих игр, импакт относительно нормы роли и модификатор сложности."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="glass clip-corner rounded-sm p-5">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Потенциальный MMR по ролям</h3>
            <RolePotentialBarChart roles={result.roles} currentMmr={result.currentMmr} />
          </div>
          <div className="glass clip-corner rounded-sm p-5">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Профиль импакта (0–100)</h3>
            <RoleImpactRadar roles={result.roles} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {result.roles.map((role, i) => (
            <RoleCard
              key={role.role}
              role={role}
              index={i}
              isBest={bestSet.has(role.role)}
              isWorst={worstSet.has(role.role)}
            />
          ))}
        </div>
      </Section>

      {/* 4. heroes */}
      <Section
        title="Разбор"
        accent="героев"
        description="Кто реально приносит рейтинг, а чей винрейт — иллюзия маленькой выборки."
      >
        <HeroesPanel heroes={result.heroes} />
      </Section>

      {/* 5. trends */}
      <Section
        title="Динамика"
        accent="формы"
        description="Винрейт и импакт по отрезкам из 20 матчей — от старых к новым."
      >
        <div className="glass clip-corner rounded-sm p-5">
          <TrendChart trend={result.trend} />
        </div>
      </Section>

      {/* 6. simulation */}
      <Section
        title="Симуляция"
        accent="подъёма"
        description={
          result.bestClimbingRole
            ? `Ожидаемая траектория MMR при стабильной игре${result.mmrDelta >= 0 ? " на роли «" + ROLES[result.bestClimbingRole].shortLabel + "»" : ""}: быстрый старт и плато у потолка. Полоса — оптимистичный и пессимистичный сценарии.`
            : "Ожидаемая траектория MMR при стабильной игре. Полоса — оптимистичный и пессимистичный сценарии."
        }
      >
        <div className="glass clip-corner rounded-sm p-5">
          <SimulationChart simulation={result.simulation} />
        </div>
      </Section>

      {/* 7. match history insights */}
      <Section
        title="История"
        accent="матчей"
        description="Сводка по анализируемому окну из 200 рейтинговых игр."
      >
        <MatchInsightsPanel insights={result.matchInsights} />
      </Section>

      {/* 8. confidence */}
      <Section title="Доверие к" accent="прогнозу">
        <ConfidencePanel result={result} />
      </Section>

      {/* CTA */}
      <div className="flex justify-center pb-6">
        <Button size="lg" asChild>
          <Link href="/">Проанализировать другой аккаунт</Link>
        </Button>
      </div>
    </div>
  );
}

function MissingState() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ember-600/15 text-ember-400">
            <SearchX className="h-7 w-7" />
          </span>
          <h1 className="font-display text-2xl font-bold">Анализ не найден</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ссылка устарела, либо результат хранился только в вашей сессии.
            Запустите анализ заново — это займёт около 15 секунд.
          </p>
          <Button asChild className="mt-2">
            <Link href="/">Новый анализ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
