"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0..100 */
  value: number;
  barClassName?: string;
}

/** Lightweight progress bar (no radix dependency). */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, barClassName, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-ember-500 to-ember-600 transition-[width] duration-700 ease-out",
          barClassName,
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  ),
);
Progress.displayName = "Progress";

export { Progress };
