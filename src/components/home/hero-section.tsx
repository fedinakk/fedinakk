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
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden py-16">
      <AnimatedBackground />

      <div className="container relative flex flex-col items-center text-center">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-ember-300">
            <Sparkles className="h-3.5 w-3.5" />
            Последние 200 рейтинговых матчей · все 5 ролей · прогноз с датой
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="text-gradient-subtle">Узнай свой</span>{" "}
          <span className="text-gradient-animated">настоящий MMR</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Ссылка на профиль и текущий рейтинг — на выходе потенциальный MMR по каждой роли,
          лучшие герои и дата, когда ты доберёшься до потолка.
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
      </div>
    </section>
  );
}
