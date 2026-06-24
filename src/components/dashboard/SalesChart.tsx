"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { WeeklySalePoint } from "@/types";

/* ── Custom Tooltip ───────────────────────────────────── */
interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-card text-xs"
      role="tooltip"
    >
      <p className="font-medium text-[var(--text)] mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-[var(--text-muted)]">{entry.name} :</span>
          <span className="font-medium text-[var(--text)]">
            {entry.value.toLocaleString("fr-FR")} ventes
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Chart ────────────────────────────────────────────── */
interface SalesChartProps {
  data: WeeklySalePoint[];
  className?: string;
}

export function SalesChart({ data, className }: SalesChartProps) {
  // Find the week where predictions start (actual becomes null)
  const splitWeek = data.find((d) => d.actual === null)?.week;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-primary-600 inline-block" />
            Ventes réelles
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#10B981] inline-block" />
            Prédiction IA
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "var(--surface)" }}
          />

          {/* Divider between actuals and predictions */}
          {splitWeek && (
            <ReferenceLine
              x={splitWeek}
              stroke="var(--text-muted)"
              strokeDasharray="4 4"
              label={{
                value: "Prédictions →",
                position: "insideTopRight",
                fontSize: 10,
                fill: "var(--text-muted)",
              }}
            />
          )}

          {/* Actual sales bars */}
          <Bar
            dataKey="actual"
            name="Ventes réelles"
            fill="#4F46E5"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />

          {/* Predicted line */}
          <Line
            type="monotone"
            dataKey="predicted"
            name="Prédiction IA"
            stroke="#10B981"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (payload.actual !== null) return <g key={cx} />;
              return (
                <circle
                  key={cx}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill="#10B981"
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            }}
            strokeDasharray={(d) =>
              (d as unknown as WeeklySalePoint).actual === null ? "6 3" : "0"
            }
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
