"use client";

import { motion } from "framer-motion";

/**
 * Cinematic animated hero background: blueprint grid, drifting ember orbs
 * and a slow rotating conic glow. Pure CSS/JSX — no images, no network.
 */
export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bg-grid absolute inset-0" />

      {/* rotating conic glow behind the headline */}
      <div className="absolute left-1/2 top-[-320px] h-[720px] w-[720px] -translate-x-1/2 animate-spin-slow opacity-40">
        <div
          className="h-full w-full rounded-full blur-3xl"
          style={{
            background:
              "conic-gradient(from 90deg, transparent 0deg, rgba(249,115,22,0.28) 80deg, rgba(220,38,38,0.22) 160deg, transparent 240deg)",
          }}
        />
      </div>

      {/* drifting ember orbs */}
      <motion.div
        className="absolute left-[12%] top-[22%] h-64 w-64 rounded-full bg-ember-600/20 blur-3xl"
        animate={{ y: [0, -28, 0], x: [0, 14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[10%] top-[36%] h-72 w-72 rounded-full bg-red-700/15 blur-3xl"
        animate={{ y: [0, 24, 0], x: [0, -18, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />
      <motion.div
        className="absolute bottom-[-90px] left-[38%] h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />

      {/* floating sparks */}
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-ember-400/70"
          style={{ left: s.left, top: s.top }}
          animate={{ y: [0, -46, 0], opacity: [0.15, 0.9, 0.15] }}
          transition={{ duration: s.duration, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        />
      ))}

      {/* fade everything into the page background */}
      <div className="absolute inset-0 bg-radial-fade" />
    </div>
  );
}

const SPARKS = [
  { left: "18%", top: "30%", duration: 6, delay: 0 },
  { left: "28%", top: "58%", duration: 7.5, delay: 1.4 },
  { left: "44%", top: "24%", duration: 6.6, delay: 0.8 },
  { left: "62%", top: "52%", duration: 8, delay: 2.1 },
  { left: "74%", top: "28%", duration: 6.2, delay: 0.3 },
  { left: "86%", top: "60%", duration: 7.2, delay: 1.8 },
];
