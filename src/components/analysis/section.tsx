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
      <h2 className="font-display text-2xl font-bold sm:text-3xl">
        {title} {accent && <span className="text-gradient-ember">{accent}</span>}
      </h2>
      {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}
