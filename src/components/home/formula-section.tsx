"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const anchors = [
  { wr: "50%", delta: "база", note: "точка равновесия" },
  { wr: "55%", delta: "+370", note: "первый буст самый дорогой" },
  { wr: "60%", delta: "+670", note: "рост замедляется" },
  { wr: "65%", delta: "+875", note: "каждый % даёт меньше" },
  { wr: "70%", delta: "+1000", note: "кривая выходит на плато" },
];

export function FormulaSection() {
  return (
    <section id="formula" className="container pb-28">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Кривая с <span className="text-gradient-ember">diminishing returns</span>
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Потенциал не растёт линейно: каждый следующий процент винрейта даёт всё меньше MMR.
            В основе — гиперболический тангенс:
          </p>
          <div className="glass mt-5 overflow-x-auto rounded-xl p-5 font-mono text-sm text-ember-300">
            Δ MMR = 1150 · tanh((WR − 50) / 15)
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Кривая симметрична: винрейт ниже 50% опускает потенциал <em>ниже</em> текущего рейтинга.
            Поверх неё модель добавляет вес свежих игр, байесовское сжатие маленьких выборок,
            модификатор сложности роли, импакт и стабильность.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {anchors.map((a, i) => (
                  <div key={a.wr} className="flex items-center gap-4">
                    <span className="w-12 shrink-0 font-mono text-sm text-muted-foreground">{a.wr}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(i / (anchors.length - 1)) * 86 + 8}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-ember-500 to-red-600"
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right font-mono text-sm font-semibold text-ember-300">
                      {a.delta}
                    </span>
                    <span className="hidden w-40 shrink-0 text-xs text-muted-foreground/70 sm:block">
                      {a.note}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
