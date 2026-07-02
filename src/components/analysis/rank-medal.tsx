"use client";

import { Star } from "lucide-react";
import { mmrToMedal } from "@/lib/ranks";
import { cn } from "@/lib/utils";

interface RankMedalProps {
  mmr: number;
  size?: "sm" | "lg";
  label?: string;
  className?: string;
}

/** Stylized SVG rank medal derived from an MMR value. */
export function RankMedal({ mmr, size = "lg", label, className }: RankMedalProps) {
  const medal = mmrToMedal(mmr);
  const px = size === "lg" ? 96 : 64;
  const gradientId = `medal-${medal.key}-${size}`;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: px, height: px }}>
        <svg viewBox="0 0 100 100" width={px} height={px} aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={medal.colors.from} />
              <stop offset="100%" stopColor={medal.colors.to} />
            </linearGradient>
          </defs>
          {/* outer shield */}
          <polygon
            points="50,3 90,20 90,58 50,97 10,58 10,20"
            fill={`url(#${gradientId})`}
            opacity="0.22"
            stroke={medal.colors.ring}
            strokeOpacity="0.75"
            strokeWidth="2.5"
          />
          {/* inner shield */}
          <polygon
            points="50,14 79,27 79,55 50,85 21,55 21,27"
            fill={`url(#${gradientId})`}
            opacity="0.85"
          />
          {/* shine */}
          <polygon points="50,14 79,27 50,44 21,27" fill="white" opacity="0.16" />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
          style={{ fontSize: px * 0.24 }}
        >
          {medal.key === "immortal" ? "∞" : medal.stars}
        </span>
        <div
          className="absolute inset-0 -z-10 rounded-full blur-2xl"
          style={{ background: medal.colors.ring, opacity: 0.25 }}
        />
      </div>

      <div className="text-center">
        <p className={cn("font-semibold", size === "lg" ? "text-sm" : "text-xs")}>{medal.name}</p>
        {medal.key !== "immortal" && (
          <div className="mt-0.5 flex justify-center gap-0.5" aria-label={`${medal.stars} из 5 звёзд`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-2.5 w-2.5",
                  i < medal.stars ? "fill-amber-400 text-amber-400" : "text-white/15",
                )}
              />
            ))}
          </div>
        )}
        {label && <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>}
      </div>
    </div>
  );
}
