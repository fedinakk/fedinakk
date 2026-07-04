"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Crown,
  Eye,
  Footprints,
  History,
  Shield,
  Sword,
  TrendingDown,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/engine/constants";
import type { RoleAnalysis } from "@/lib/engine/types";
import { cn, formatNumber, formatSigned, plural, round } from "@/lib/utils";

interface RoleCardProps {
  role: RoleAnalysis;
  isBest: boolean;
  isWorst: boolean;
  index: number;
}

export function RoleCard({ role, isBest, isWorst, index }: RoleCardProps) {
  const meta = ROLES[role.role];
  const wrPct = role.winrate * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className={cn(
        "glass clip-corner group relative flex h-full flex-col rounded-sm p-5 transition-all duration-300 hover:-translate-y-0.5",
        isBest && "border-amber-400/40 bg-gradient-to-b from-amber-400/[0.05] to-transparent",
        isWorst && "border-dire-500/30",
      )}
    >
      {(isBest || isWorst) && (
        <div className="absolute right-4 top-4">
          {isBest ? (
            <Badge variant="gold">
              <Crown className="h-3 w-3" /> Лучшая
            </Badge>
          ) : (
            <Badge variant="negative">
              <TrendingDown className="h-3 w-3" /> Слабая
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ember-600/15 text-ember-400 ring-1 ring-ember-600/25">
          <RoleIcon role={role.role} />
        </span>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{meta.label}</p>
      </div>

      {role.insufficientData ? (
        <div className="mt-4 flex flex-1 flex-col items-start justify-center gap-2 rounded-lg border border-dashed border-white/10 bg-black/20 p-4">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-ember-500/80" />
            Недостаточно данных
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground/70">
            {role.games > 0
              ? `Даже с добором из старой истории набралось лишь ${role.games} ${plural(role.games, "матч", "матча", "матчей")} — для прогноза нужно минимум 20.`
              : "На этой роли нет матчей даже в глубокой истории аккаунта."}
          </p>
        </div>
      ) : (
        <>
          {/* potential */}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-display text-4xl font-bold text-gradient-ember">
              {formatNumber(role.potentialMmr!)}
            </span>
            {role.errorMargin != null && (
              <span className="text-sm font-medium text-muted-foreground">
                ±{formatNumber(role.errorMargin)}
              </span>
            )}
            <span
              className={cn(
                "ml-auto text-sm font-semibold",
                role.mmrDelta! >= 0 ? "text-radiant-400" : "text-dire-400",
              )}
            >
              {formatSigned(role.mmrDelta!)}
            </span>
          </div>

          {/* winrate + games */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">Винрейт</p>
              <p
                className={cn(
                  "font-display text-2xl font-bold",
                  wrPct >= 53 ? "text-radiant-400" : wrPct < 47 ? "text-dire-400" : "text-foreground",
                )}
              >
                {round(wrPct, 1)}%
              </p>
              <div className="mt-1.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn("rounded-full", wrPct >= 50 ? "bg-radiant-500/85" : "bg-dire-500/80")}
                  style={{ width: `${Math.min(100, wrPct)}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">Матчей</p>
              <p className="font-display text-2xl font-bold">{role.games}</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                {role.wins} {plural(role.wins, "победа", "победы", "побед")}
              </p>
            </div>
          </div>

          {/* K / D / A */}
          <div className="mt-5 rounded-lg border border-white/[0.06] bg-black/20 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
              Средние убийства / смерти / помощь
            </p>
            <p className="mt-1 font-display text-xl font-bold tabular-nums">
              <span className="text-amber-300">{role.avgKills.toFixed(1)}</span>
              <span className="text-muted-foreground/50"> / </span>
              <span className="text-dire-400">{role.avgDeaths.toFixed(1)}</span>
              <span className="text-muted-foreground/50"> / </span>
              <span className="text-radiant-400">{role.avgAssists.toFixed(1)}</span>
              <span className="ml-3 align-middle text-xs font-medium text-muted-foreground">
                KDA {role.kda.toFixed(2)}
              </span>
            </p>
          </div>

          {/* impact */}
          <div className="mt-4 flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-muted-foreground">Импакт</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${role.impactScore}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-ember-500 to-ember-600"
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">
              {round(role.impactScore)}
            </span>
          </div>

          {role.backfilledGames > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] leading-snug text-muted-foreground/80">
              <History className="h-3.5 w-3.5 shrink-0 text-ember-500/80" />
              +{role.backfilledGames} {plural(role.backfilledGames, "игра", "игры", "игр")} из более
              старой истории — в последних 200 матчах этой роли мало.
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

function RoleIcon({ role }: { role: RoleAnalysis["role"] }) {
  const cls = "h-4 w-4";
  switch (role) {
    case "pos1":
      return <Sword className={cls} />;
    case "pos2":
      return <Zap className={cls} />;
    case "pos3":
      return <Shield className={cls} />;
    case "pos4":
      return <Footprints className={cls} />;
    case "pos5":
      return <Eye className={cls} />;
  }
}
