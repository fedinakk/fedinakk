"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { HeroAnalysis, HeroBuckets } from "@/lib/engine/types";
import { cn, formatNumber, round } from "@/lib/utils";

type BucketKey = "best" | "worst" | "overrated" | "highImpact";

const TABS: Array<{ key: BucketKey; label: string; hint: string }> = [
  { key: "best", label: "Лучшие", hint: "Стабильно приносят MMR: высокий винрейт, подтверждённый импактом." },
  { key: "worst", label: "Худшие", hint: "Тянут рейтинг вниз — в ранкеде лучше отложить." },
  { key: "overrated", label: "Переоценённые", hint: "Красивый винрейт без реального импакта или на слишком малой выборке." },
  { key: "highImpact", label: "Высокий импакт", hint: "Наибольшее влияние на игру относительно нормы роли." },
];

export function HeroesPanel({ heroes }: { heroes: HeroBuckets }) {
  const [active, setActive] = React.useState<BucketKey>("best");
  const activeTab = TABS.find((t) => t.key === active)!;
  const list = heroes[active];

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Категории героев">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active === tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                active === tab.key
                  ? "border-ember-600/50 bg-ember-600/20 text-ember-200 shadow-glow-sm"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {activeTab.hint}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-4"
          >
            {list.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/10 bg-black/20 p-8 text-center text-sm text-muted-foreground">
                В этой категории пока пусто — нужно минимум 5 игр на герое, чтобы он попал в выборку.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.07] text-left text-xs uppercase tracking-wide text-muted-foreground/70">
                      <th className="pb-3 pr-4 font-medium">Герой</th>
                      <th className="pb-3 pr-4 font-medium">Игры</th>
                      <th className="pb-3 pr-4 font-medium">Винрейт</th>
                      <th className="pb-3 pr-4 font-medium">KDA</th>
                      <th className="pb-3 pr-4 font-medium">Перформанс</th>
                      <th className="pb-3 pr-4 font-medium">Оценка MMR</th>
                      <th className="pb-3 font-medium">Достоверность</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((hero, i) => (
                      <HeroRow key={hero.heroId} hero={hero} index={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function HeroRow({ hero, index }: { hero: HeroAnalysis; index: number }) {
  const wrPct = hero.winrate * 100;
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.045 }}
      className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.03]"
    >
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          {hero.imageUrl ? (
            <Image
              src={hero.imageUrl}
              alt={hero.name}
              width={48}
              height={27}
              className="rounded border border-white/10"
            />
          ) : (
            <div className="h-[27px] w-12 rounded border border-white/10 bg-white/[0.05]" />
          )}
          <span className="font-medium">{hero.name}</span>
        </div>
      </td>
      <td className="py-3 pr-4 tabular-nums text-muted-foreground">{hero.games}</td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-12 tabular-nums font-medium",
              wrPct >= 55 ? "text-emerald-400" : wrPct < 47 ? "text-red-400" : "text-foreground",
            )}
          >
            {round(wrPct, 1)}%
          </span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                "h-full rounded-full",
                wrPct >= 50 ? "bg-emerald-500/80" : "bg-red-500/80",
              )}
              style={{ width: `${Math.min(100, wrPct)}%` }}
            />
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 tabular-nums">{hero.kda.toFixed(2)}</td>
      <td className="py-3 pr-4 tabular-nums">{round(hero.performanceScore)} / 100</td>
      <td className="py-3 pr-4 font-medium tabular-nums text-ember-300">
        {formatNumber(hero.estimatedMmr)}
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ember-500 to-ember-600"
              style={{ width: `${hero.confidence}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{round(hero.confidence)}%</span>
        </div>
      </td>
    </motion.tr>
  );
}
