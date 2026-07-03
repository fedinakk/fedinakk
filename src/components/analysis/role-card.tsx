"use client";

import { motion } from "framer-motion";
import { AlertCircle, Crown, Eye, Footprints, History, Shield, Sword, TrendingDown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-gradient-ember">
              {formatNumber(role.potentialMmr!)}
            </span>
            <span
              className={cn(
                "text-sm font-semibold",
                role.mmrDelta! >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {formatSigned(role.mmrDelta!)}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-x-3 gap-y-2.5 text-sm">
            <StatItem label="Винрейт" value={`${round(role.winrate * 100, 1)}%`} highlight={role.winrate >= 0.55} warn={role.winrate < 0.47} />
            <StatItem label="Матчей" value={String(role.games)} />
            <StatItem label="KDA" value={role.kda.toFixed(2)} />
            <StatItem label="GPM" value={formatNumber(role.gpm)} />
            <StatItem label="XPM" value={formatNumber(role.xpm)} />
            <StatItem label="Смертей" value={role.deathsPerGame.toFixed(1)} />
            <StatItem label="Урон/мин" value={formatNumber(role.heroDamagePerMin)} />
            <StatItem label="Башни/мин" value={formatNumber(role.towerDamagePerMin)} />
            <StatItem
              label={role.role === "pos4" || role.role === "pos5" ? "Саппорт" : "Импакт"}
              value={
                role.role === "pos4" || role.role === "pos5"
                  ? String(round(role.supportScore))
                  : String(round(role.impactScore))
              }
            />
          </dl>

          <div className="mt-4 space-y-2.5 border-t border-white/[0.06] pt-4">
            <MiniBar label="Импакт" value={role.impactScore} />
            <MiniBar label="Стабильность" value={role.consistency} />
            <MiniBar label="Достоверность" value={role.confidence} />
          </div>

          {role.backfilledGames > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] leading-snug text-muted-foreground/80">
              <History className="h-3.5 w-3.5 shrink-0 text-ember-500/80" />
              +{role.backfilledGames} {plural(role.backfilledGames, "игра добрана", "игры добрано", "игр добрано")} из
              более старой истории — в последних 200 матчах этой роли мало.
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

function StatItem({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{label}</dt>
      <dd className={cn("font-medium tabular-nums", highlight && "text-emerald-400", warn && "text-red-400")}>
        {value}
      </dd>
    </div>
  );
}

function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">{label}</span>
      <Progress value={value} className="h-1.5" />
      <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">{round(value)}</span>
    </div>
  );
}
