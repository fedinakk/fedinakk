"use client";

import { motion } from "framer-motion";
import {
  CalendarRange,
  Clock,
  Flame,
  Skull,
  Swords,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { MatchInsights } from "@/lib/engine/types";
import { plural, round } from "@/lib/utils";

export function MatchInsightsPanel({ insights }: { insights: MatchInsights }) {
  const winratePct = round((insights.wins / Math.max(1, insights.totalMatches)) * 100, 1);
  const recentPct = round(insights.recentForm.winrate * 100);

  const tiles: Array<{
    icon: LucideIcon;
    label: string;
    value: string;
    sub: string;
    small?: boolean;
  }> = [
    {
      icon: TrendingUp,
      label: `Форма (последние ${insights.recentForm.games})`,
      value: `${recentPct}%`,
      sub: `${insights.recentForm.wins} ${plural(insights.recentForm.wins, "победа", "победы", "побед")}`,
    },
    {
      icon: Flame,
      label: "Лучшая серия побед",
      value: String(insights.longestWinStreak),
      sub: "подряд",
    },
    {
      icon: Skull,
      label: "Серия поражений",
      value: String(insights.longestLossStreak),
      sub: "худшая",
    },
    {
      icon: Clock,
      label: "Средняя длительность",
      value: `${round(insights.avgDurationMin)} мин`,
      sub: "за матч",
    },
    {
      icon: Users,
      label: "Игры в пати",
      value: `${round(insights.partyRatio * 100)}%`,
      sub: "от всех матчей",
    },
    {
      icon: Zap,
      label: "Любимый герой",
      value: insights.mostPlayedHero?.name ?? "—",
      sub: insights.mostPlayedHero
        ? `${insights.mostPlayedHero.games} ${plural(insights.mostPlayedHero.games, "игра", "игры", "игр")}`
        : "",
      small: true,
    },
    {
      icon: CalendarRange,
      label: "Период анализа",
      value: formatRange(insights.firstMatchAt, insights.lastMatchAt),
      sub: `${insights.totalMatches} ${plural(insights.totalMatches, "матч", "матча", "матчей")}`,
      small: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {/* W/L tile — Radiant vs Dire split */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45 }}
        className="glass clip-corner-sm rounded-sm p-4 transition-colors hover:bg-white/[0.05]"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Swords className="h-4 w-4 text-ember-500/90" />
          <span className="text-[11px] uppercase tracking-wide">Победы — поражения</span>
        </div>
        <p className="mt-2 font-display text-2xl font-bold">
          <span className="text-radiant-400">{insights.wins}</span>
          <span className="text-muted-foreground/50"> — </span>
          <span className="text-dire-400">{insights.losses}</span>
        </p>
        <div className="mt-2 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
          <div className="rounded-l-full bg-radiant-500/85" style={{ width: `${winratePct}%` }} />
          <div className="flex-1 rounded-r-full bg-dire-500/75" />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground/70">винрейт {winratePct}%</p>
      </motion.div>

      {tiles.map((tile, i) => (
        <motion.div
          key={tile.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: (i + 1) * 0.05, duration: 0.45 }}
          className="glass clip-corner-sm rounded-sm p-4 transition-colors hover:bg-white/[0.05]"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <tile.icon className="h-4 w-4 text-ember-500/90" />
            <span className="text-[11px] uppercase tracking-wide">{tile.label}</span>
          </div>
          <p
            className={
              tile.small
                ? "mt-2 truncate text-base font-semibold"
                : "mt-2 font-display text-2xl font-bold"
            }
            title={tile.value}
          >
            {tile.value}
          </p>
          {tile.sub && <p className="mt-0.5 text-xs text-muted-foreground/70">{tile.sub}</p>}
        </motion.div>
      ))}
    </div>
  );
}

function formatRange(fromUnix: number, toUnix: number): string {
  const fmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });
  return `${fmt.format(new Date(fromUnix * 1000))} — ${fmt.format(new Date(toUnix * 1000))}`;
}
