"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SimulationPoint } from "@/lib/engine/types";
import { formatNumber } from "@/lib/utils";
import { CHART_AXIS_TICK, CHART_COLORS, CHART_GRID, ChartTooltipFrame } from "./chart-theme";

/**
 * MMR climb projection: expected trajectory towards the potential ceiling
 * with an optimistic/pessimistic range band (same hue, low opacity — the
 * band is uncertainty around one series, not a second series).
 */
export function SimulationChart({ simulation }: { simulation: SimulationPoint[] }) {
  const data = simulation.map((p) => ({
    ...p,
    band: [p.pessimistic, p.optimistic] as [number, number],
  }));

  const values = simulation.flatMap((p) => [p.pessimistic, p.optimistic]);
  const min = Math.max(0, Math.min(...values) - 150);
  const max = Math.max(...values) + 150;

  return (
    <div className="h-80 w-full" role="img" aria-label="Симуляция роста MMR">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_GRID} vertical={false} />
          <XAxis
            dataKey="games"
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}`}
            label={{ value: "сыграно игр", position: "insideBottomRight", fill: "#a8a29e", fontSize: 11, dy: 8 }}
          />
          <YAxis
            domain={[min, max]}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v: number) => formatNumber(v)}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.18)", strokeDasharray: "4 4" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]!.payload as SimulationPoint;
              return (
                <ChartTooltipFrame
                  label={`Через ${label} игр`}
                  rows={[
                    { color: CHART_COLORS[0], name: "Ожидаемый", value: `${formatNumber(p.expected)} MMR` },
                    { name: "Диапазон", value: `${formatNumber(p.pessimistic)}–${formatNumber(p.optimistic)}` },
                  ]}
                />
              );
            }}
          />
          <Area
            dataKey="band"
            stroke="none"
            fill={CHART_COLORS[0]}
            fillOpacity={0.12}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="expected"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
