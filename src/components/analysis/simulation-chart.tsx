"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SimulationPoint } from "@/lib/engine/types";
import { formatNumber } from "@/lib/utils";
import { CHART_AXIS_TICK, CHART_COLORS, CHART_GRID, ChartTooltipFrame } from "./chart-theme";

interface SimulationChartProps {
  simulation: SimulationPoint[];
  potentialMmr: number;
  errorMargin: number;
}

/**
 * MMR climb forecast: expected trajectory towards the potential ceiling.
 * The shaded band is the ± error margin (optimistic / pessimistic
 * scenarios) — uncertainty around one series, same hue at low opacity.
 */
export function SimulationChart({ simulation, potentialMmr, errorMargin }: SimulationChartProps) {
  const data = simulation.map((p) => ({
    ...p,
    band: [p.pessimistic, p.optimistic] as [number, number],
  }));

  const values = simulation.flatMap((p) => [p.pessimistic, p.optimistic]);
  const min = Math.max(0, Math.min(...values) - 150);
  const max = Math.max(...values, potentialMmr) + 150;

  return (
    <div className="h-80 w-full" role="img" aria-label="Прогноз роста MMR">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_GRID} vertical={false} />
          <XAxis
            dataKey="games"
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
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
                    {
                      name: `Погрешность ±${formatNumber(errorMargin)}`,
                      value: `${formatNumber(p.pessimistic)}–${formatNumber(p.optimistic)}`,
                    },
                  ]}
                />
              );
            }}
          />
          <ReferenceLine
            y={potentialMmr}
            stroke="#a8a29e"
            strokeDasharray="5 5"
            strokeOpacity={0.6}
            label={{
              value: `Потолок · ${formatNumber(potentialMmr)}`,
              position: "insideBottomRight",
              fill: "#a8a29e",
              fontSize: 11,
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
            dataKey="pessimistic"
            stroke={CHART_COLORS[0]}
            strokeOpacity={0.45}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="optimistic"
            stroke={CHART_COLORS[0]}
            strokeOpacity={0.45}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="expected"
            stroke={CHART_COLORS[0]}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
