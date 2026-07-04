"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AlertTriangle, Flame, TrendingDown, Trophy, type LucideIcon } from "lucide-react";
import type { HeroAnalysis, HeroBuckets } from "@/lib/engine/types";
import { cn, formatNumber, plural, round } from "@/lib/utils";

type BucketKey = "best" | "worst" | "overrated" | "highImpact";

interface PanelDef {
  key: BucketKey;
  title: string;
  hint: string;
  icon: LucideIcon;
  iconClass: string;
  empty: string;
  /** Right-hand metric for a row. */
  metric: (h: HeroAnalysis) => { value: string; label: string };
}

const PANELS: PanelDef[] = [
  {
    key: "best",
    title: "Лучшие герои",
    hint: "Стабильно приносят рейтинг: плюсовый винрейт, подтверждённый выборкой и импактом.",
    icon: Trophy,
    iconClass: "bg-amber-400/15 text-amber-300 ring-amber-400/25",
    empty: "Нет героев с плюсовым винрейтом на 5+ играх — сыграйте больше матчей на комфортных героях.",
    metric: (h) => ({ value: formatNumber(h.estimatedMmr), label: "оценка MMR" }),
  },
  {
    key: "worst",
    title: "Худшие герои",
    hint: "Минусовый винрейт — в ранкеде этих героев лучше отложить.",
    icon: TrendingDown,
    iconClass: "bg-dire-500/15 text-dire-400 ring-dire-500/25",
    empty: "Нет героев с минусовым винрейтом на 5+ играх — отличный знак.",
    metric: (h) => ({ value: formatNumber(h.estimatedMmr), label: "оценка MMR" }),
  },
  {
    key: "overrated",
    title: "Переоценённый винрейт",
    hint: "Красивый процент побед, который не подтверждается импактом или размером выборки.",
    icon: AlertTriangle,
    iconClass: "bg-gold-400/15 text-gold-300 ring-gold-400/25",
    empty: "Подозрительно завышенных винрейтов не найдено — ваши проценты честные.",
    metric: (h) => ({ value: `${round(h.performanceScore)} / 100`, label: "импакт" }),
  },
  {
    key: "highImpact",
    title: "Высокий импакт",
    hint: "Наибольшее влияние на игру относительно нормы роли — независимо от винрейта.",
    icon: Flame,
    iconClass: "bg-ember-600/15 text-ember-400 ring-ember-600/25",
    empty: "Пока нет героев с импактом заметно выше нормы роли.",
    metric: (h) => ({ value: `${round(h.performanceScore)} / 100`, label: "импакт" }),
  },
];

export function HeroesPanel({ heroes }: { heroes: HeroBuckets }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {PANELS.map((panel, i) => (
        <motion.div
          key={panel.key}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="glass clip-corner flex flex-col rounded-sm p-5"
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1",
                panel.iconClass,
              )}
            >
              <panel.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold leading-tight">{panel.title}</h3>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{panel.hint}</p>
            </div>
          </div>

          <div className="mt-4 flex-1">
            {heroes[panel.key].length === 0 ? (
              <div className="flex h-full min-h-[96px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-black/20 p-4 text-center text-xs leading-relaxed text-muted-foreground">
                {panel.empty}
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {heroes[panel.key].map((hero, j) => (
                  <HeroRow key={hero.heroId} hero={hero} metric={panel.metric(hero)} index={j} />
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function HeroRow({
  hero,
  metric,
  index,
}: {
  hero: HeroAnalysis;
  metric: { value: string; label: string };
  index: number;
}) {
  const wrPct = hero.winrate * 100;
  return (
    <motion.li
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 py-2.5"
    >
      {hero.imageUrl ? (
        <Image
          src={hero.imageUrl}
          alt={hero.name}
          width={52}
          height={29}
          className="shrink-0 rounded border border-white/10"
        />
      ) : (
        <div className="h-[29px] w-[52px] shrink-0 rounded border border-white/10 bg-white/[0.05]" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{hero.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {hero.games} {plural(hero.games, "игра", "игры", "игр")} · KDA {hero.kda.toFixed(1)}
        </p>
      </div>

      <span
        className={cn(
          "w-14 shrink-0 text-right text-sm font-semibold tabular-nums",
          wrPct >= 53 ? "text-radiant-400" : wrPct < 47 ? "text-dire-400" : "text-foreground",
        )}
      >
        {round(wrPct, 1)}%
      </span>

      <div className="w-20 shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums text-ember-300">{metric.value}</p>
        <p className="text-[10px] text-muted-foreground/70">{metric.label}</p>
      </div>
    </motion.li>
  );
}
