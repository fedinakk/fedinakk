"use client";

import { motion } from "framer-motion";
import { Calculator, Database, LineChart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const steps = [
  {
    icon: Database,
    title: "Собираем данные",
    text: "Последние 200 рейтинговых матчей из OpenDota API: винрейт, KDA, GPM/XPM, урон по героям и строениям, лайны и роли.",
  },
  {
    icon: Calculator,
    title: "Считаем модель",
    text: "Взвешиваем матчи по свежести, ужимаем маленькие выборки к 50% и конвертируем винрейт в MMR по кривой с diminishing returns.",
  },
  {
    icon: LineChart,
    title: "Показываем стратегию",
    text: "Потенциал по каждой роли, лучшие герои, честность винрейтов и симуляция подъёма — где и как апать быстрее всего.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Как это <span className="text-gradient-ember">работает</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Никакой магии — только математика поверх ваших реальных матчей.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.12, duration: 0.55 }}
            className="relative text-center md:text-left"
          >
            <div className="mb-4 flex items-center justify-center gap-4 md:justify-start">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-ember-500/25 to-ember-700/20 text-ember-400 ring-1 ring-ember-600/30">
                <step.icon className="h-6 w-6" />
              </span>
              <span className="font-display text-4xl font-bold text-white/10">0{i + 1}</span>
            </div>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </motion.div>
        ))}
      </div>

      <Separator className="mt-20" />
    </section>
  );
}
