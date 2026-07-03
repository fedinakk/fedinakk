"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  accent?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, accent, description, children, className }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("scroll-mt-24", className)}
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-ember-600/20 to-ember-600/50 sm:block"
        />
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-ember-500/80" />
        <h2 className="text-center font-display text-xl font-bold uppercase tracking-wider sm:text-2xl">
          {title} {accent && <span className="text-gradient-ember">{accent}</span>}
        </h2>
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-ember-500/80" />
        <span
          aria-hidden
          className="hidden h-px flex-1 bg-gradient-to-l from-transparent via-ember-600/20 to-ember-600/50 sm:block"
        />
      </div>
      {description && (
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}
