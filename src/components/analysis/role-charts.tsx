"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ROLES } from "@/lib/engine/constants";
import type { RoleAnalysis } from "@/lib/engine/types";
import { formatNumber } from "@/lib/utils";
import { CHART_AXIS_TICK, CHART_COLORS, CHART_GRID, ChartTooltipFrame } from "./chart-theme";

interface RoleChartsProps {
  roles: RoleAnalysis[];
  currentMmr: number;
}

/** Potential MMR per role — single-series bar chart with a "current MMR" reference. */
export function RolePotentialBarChart({ roles, currentMmr }: RoleChartsProps) {
  const data = roles.map((r) => ({
    role: ROLES[r.role].shortLabel,
    potential: r.potentialMmr,
    games: r.games,
  }));

  const values = roles
    .map((r) => r.potentialMmr)
    .filter((v): v is number => v != null)
    .concat(currentMmr);
  const min = Math.max(0, Math.min(...values) - 300);
  const max = Math.max(...values) + 300;

  return (
    <div className="h-72 w-full" role="img" aria-label="Потенциальный MMR по ролям">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="role" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis
            domain={[min, max]}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v: number) => formatNumber(v)}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]!.payload as (typeof data)[number];
              return (
                <ChartTooltipFrame
                  label={label as string}
                  rows={[
                    {
                      color: CHART_COLORS[0],
                      name: "Потенциал",
                      value: p.potential != null ? `${formatNumber(p.potential)} MMR` : "недостаточно данных",
                    },
                    { name: "Матчей", value: p.games },
                  ]}
                />
              );
            }}
          />
          <ReferenceLine
            y={currentMmr}
            stroke="#a8a29e"
            strokeDasharray="5 5"
            strokeOpacity={0.7}
            label={{
              value: `Текущий · ${formatNumber(currentMmr)}`,
              position: "insideTopRight",
              fill: "#a8a29e",
              fontSize: 11,
            }}
          />
          <Bar dataKey="potential" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={56}>
            <LabelList
              dataKey="potential"
              position="top"
              formatter={(v: number | null) => (v == null ? "" : formatNumber(v))}
              style={{ fill: "#e7e5e4", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Impact profile per role — single-series radar. */
export function RoleImpactRadar({ roles }: { roles: RoleAnalysis[] }) {
  const data = roles.map((r) => ({
    role: ROLES[r.role].shortLabel,
    impact: r.games > 0 ? r.impactScore : 0,
    games: r.games,
  }));

  return (
    <div className="h-72 w-full" role="img" aria-label="Импакт по ролям">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={CHART_GRID} />
          <PolarAngleAxis dataKey="role" tick={CHART_AXIS_TICK} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]!.payload as (typeof data)[number];
              return (
                <ChartTooltipFrame
                  label={p.role}
                  rows={[
                    { color: CHART_COLORS[0], name: "Импакт", value: `${p.impact} / 100` },
                    { name: "Матчей", value: p.games },
                  ]}
                />
              );
            }}
          />
          <Radar
            dataKey="impact"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            fill={CHART_COLORS[0]}
            fillOpacity={0.22}
            dot={{ r: 3, fill: CHART_COLORS[0], strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
