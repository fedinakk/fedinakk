"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <Card className="border-ember-600/20 bg-gradient-to-b from-ember-600/[0.06] to-transparent">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ember-600/20 text-ember-400">
          <Sparkles className="h-5 w-5" />
        </span>
        <CardTitle>Выводы модели</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((text, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="flex gap-3 text-sm leading-relaxed text-foreground/90"
            >
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-ember-600" />
              {text}
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
