"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROLES } from "@/lib/engine/constants";
import type { AnalysisResult } from "@/lib/engine/types";
import { rankTierToLabel } from "@/lib/ranks";
import { formatNumber, formatSigned, round } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";
import { RankMedal } from "./rank-medal";

export function OverallCard({ result }: { result: AnalysisResult }) {
  const { player, currentMmr, potentialMmr, mmrDelta, errorMargin } = result;
  const rankLabel = rankTierToLabel(player.rankTier);

  return (
    <Card className="corner-brackets overflow-hidden">
      <div className="teamline h-1 w-full" />
      <CardContent className="p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr_220px]">
          {/* player identity */}
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            {player.avatarUrl ? (
              <Image
                src={player.avatarUrl}
                alt={player.personaName}
                width={72}
                height={72}
                className="rounded-xl border border-white/10 shadow-lg"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] font-display text-2xl">
                {player.personaName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold leading-tight">{player.personaName}</h1>
              {rankLabel && <p className="mt-0.5 text-sm text-muted-foreground">{rankLabel}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <a
                  href={player.opendotaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-ember-400"
                >
                  OpenDota <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-muted-foreground/60">ID {player.accountId}</span>
              </div>
            </div>
          </div>

          {/* current → potential */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Текущий MMR</p>
              <p className="font-display text-4xl font-bold text-white/85 sm:text-5xl">
                <AnimatedCounter value={currentMmr} />
              </p>
              <RankMedal mmr={currentMmr} size="sm" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember-600/20 text-ember-400"
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-xs uppercase tracking-widest text-ember-300">Потенциальный MMR</p>
              <p className="font-display text-5xl font-bold sm:text-6xl">
                <span className="text-gradient-ember">
                  <AnimatedCounter value={potentialMmr} duration={1.8} />
                </span>
                <span className="ml-2 align-middle text-lg font-semibold text-muted-foreground">
                  ±{formatNumber(errorMargin)}
                </span>
              </p>
              <RankMedal mmr={potentialMmr} size="sm" />
            </div>
          </div>

          {/* player score */}
          <div className="flex flex-col items-center justify-center gap-3">
            <PlayerScoreRing score={result.playerScore} />
            <p className="text-center text-xs text-muted-foreground">
              Погрешность прогноза — ±{formatNumber(errorMargin)} MMR
            </p>
          </div>
        </div>

        {/* summary badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          <Badge variant={mmrDelta >= 0 ? "positive" : "negative"}>
            {formatSigned(mmrDelta)} MMR к потолку
          </Badge>
          <Badge variant="neutral">Винрейт {round(result.overallWinrate * 100, 1)}%</Badge>
          <Badge variant="neutral">Импакт {round(result.overallImpact)} / 100</Badge>
          <Badge variant="neutral">Стабильность {round(result.stability)} / 100</Badge>
          {result.bestClimbingRole && (
            <Badge variant="gold">Лучшая роль для подъёма — {ROLES[result.bestClimbingRole].shortLabel}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Radial "unique player score" gauge (0–100). */
function PlayerScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold">
          <AnimatedCounter value={score} />
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Oracle Score</span>
      </div>
    </div>
  );
}
