"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/engine/types";
import { CHART_AXIS_TICK, CHART_COLORS, CHART_GRID, ChartTooltipFrame } from "./chart-theme";

/**
 * Winrate & impact over the 200-match window (buckets of 20, oldest →
 * newest). Both series share the same 0–100 index scale — one axis.
 */
export function TrendChart({ trend }: { trend: TrendPoint[] }) {
  return (
    <div className="h-80 w-full" role="img" aria-label="Динамика винрейта и импакта">
      <ResponsiveContainer>
        <LineChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 100]}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.18)", strokeDasharray: "4 4" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]!.payload as TrendPoint;
              return (
                <ChartTooltipFrame
                  label={`Матчи ${label}`}
                  rows={[
                    { color: CHART_COLORS[0], name: "Винрейт", value: `${p.winratePct}%` },
                    { color: CHART_COLORS[1], name: "Импакт", value: `${p.impact} / 100` },
                  ]}
                />
              );
            }}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground">
                {value === "winratePct" ? "Винрейт, %" : "Импакт, 0–100"}
              </span>
            )}
            iconType="plainline"
          />
          <ReferenceLine y={50} stroke="#a8a29e" strokeDasharray="5 5" strokeOpacity={0.5} />
          <Line
            type="monotone"
            dataKey="winratePct"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="impact"
            stroke={CHART_COLORS[1]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
