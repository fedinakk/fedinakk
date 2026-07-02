"use client";

import * as React from "react";
import { animate, useInView, useMotionValue } from "framer-motion";
import { formatNumber } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1.4, className }: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);

  React.useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = formatNumber(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, motionValue]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
