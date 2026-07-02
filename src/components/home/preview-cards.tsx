"use client";

import { motion } from "framer-motion";
import { BarChart3, Crosshair, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  {
    icon: TrendingUp,
    title: "Потенциальный MMR",
    description:
      "Модель с diminishing returns: винрейт, взвешенный по свежести игр, конвертируется в потолок рейтинга — общий и на каждой роли.",
    visual: <PotentialVisual />,
  },
  {
    icon: BarChart3,
    title: "Анализ пяти ролей",
    description:
      "Винрейт, KDA, GPM/XPM, урон и вижен по каждой позиции. Confidence score показывает, каким цифрам можно верить.",
    visual: <RolesVisual />,
  },
  {
    icon: Crosshair,
    title: "Разбор героев",
    description:
      "Лучшие герои для подъёма, переоценённые винрейты и герои с реальным импактом — по последним 200 матчам.",
    visual: <HeroesVisual />,
  },
];

export function PreviewCards() {
  return (
    <section className="container pb-24">
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-ember-600/30 hover:shadow-glow-sm">
              <CardHeader>
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-ember-600/15 text-ember-400 transition-colors group-hover:bg-ember-600/25">
                  <card.icon className="h-5 w-5" />
                </span>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription className="leading-relaxed">{card.description}</CardDescription>
              </CardHeader>
              <CardContent>{card.visual}</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* --- Decorative mini-visuals (pure CSS, no data) ------------------------- */

function PotentialVisual() {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-black/25 p-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground">Текущий</p>
          <p className="font-display text-xl font-bold text-white/80">3 400</p>
        </div>
        <span className="mb-1 text-ember-500">→</span>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Потенциал</p>
          <p className="font-display text-xl font-bold text-gradient-ember">4 150</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-ember-500 to-red-600" />
      </div>
    </div>
  );
}

function RolesVisual() {
  const bars = [
    { label: "1", h: 66 },
    { label: "2", h: 88 },
    { label: "3", h: 52 },
    { label: "4", h: 38 },
    { label: "5", h: 46 },
  ];
  return (
    <div className="flex h-[104px] items-end justify-between gap-2 rounded-lg border border-white/[0.05] bg-black/25 p-4">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-[4px] bg-gradient-to-t from-ember-700/70 to-ember-500/90 transition-all duration-500 group-hover:brightness-110"
            style={{ height: `${bar.h}%` }}
          />
          <span className="text-[10px] text-muted-foreground">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

function HeroesVisual() {
  const rows = [
    { name: "Juggernaut", wr: 64 },
    { name: "Storm Spirit", wr: 58 },
    { name: "Rubick", wr: 44 },
  ];
  return (
    <div className="space-y-2 rounded-lg border border-white/[0.05] bg-black/25 p-4">
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-2 text-xs">
          <span className="w-20 truncate text-muted-foreground">{row.name}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ember-500 to-red-600"
              style={{ width: `${row.wr}%` }}
            />
          </div>
          <span className="w-9 text-right font-medium text-white/80">{row.wr}%</span>
        </div>
      ))}
    </div>
  );
}
