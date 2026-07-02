"use client";

/**
 * Shared chart styling. The categorical palette is validated for the dark
 * surface (lightness band, chroma, CVD separation, ≥3:1 contrast) — keep
 * the slot order fixed and never cycle extra hues.
 */
export const CHART_COLORS = ["#ea580c", "#0284c7", "#db2777", "#8b5cf6"] as const;

export const CHART_GRID = "rgba(255,255,255,0.06)";
export const CHART_AXIS_TICK = { fill: "#a8a29e", fontSize: 12 } as const;

interface TooltipRow {
  color?: string;
  name: string;
  value: React.ReactNode;
}

export function ChartTooltipFrame({ label, rows }: { label?: React.ReactNode; rows: TooltipRow[] }) {
  return (
    <div className="glass-strong min-w-[150px] rounded-lg px-3.5 py-2.5 text-xs shadow-xl">
      {label != null && <p className="mb-1.5 font-medium text-foreground">{label}</p>}
      <div className="space-y-1">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {row.color && (
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
              )}
              {row.name}
            </span>
            <span className="font-medium tabular-nums text-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
