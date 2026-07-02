"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AnalyzeForm } from "./analyze-form";
import { AnimatedBackground } from "./animated-background";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function HeroSection() {
  return (
    <section id="analyze" className="relative overflow-hidden pb-24 pt-20 sm:pt-28">
      <AnimatedBackground />

      <div className="container relative flex flex-col items-center text-center">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-ember-300">
            <Sparkles className="h-3.5 w-3.5" />
            Аналитика по последним 200 рейтинговым матчам
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="text-gradient-subtle">Узнай свой</span>{" "}
          <span className="text-gradient-animated">настоящий MMR</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Вставь ссылку на профиль — движок проанализирует винрейт, импакт и стабильность
          на каждой роли и рассчитает твой потенциальный рейтинг: общий и по всем пяти позициям.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 flex w-full justify-center"
        >
          <AnalyzeForm />
        </motion.div>

        <motion.dl
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="glass rounded-xl px-4 py-4 transition-colors hover:bg-white/[0.05]">
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-gradient-ember">{stat.value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

const STATS = [
  { value: "200", label: "матчей в анализе" },
  { value: "5", label: "ролей с прогнозом MMR" },
  { value: "120+", label: "героев в модели" },
  { value: "~15 c", label: "на полный разбор" },
];
