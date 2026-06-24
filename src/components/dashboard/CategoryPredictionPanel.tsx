"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/components/ui";
import { formatDelta } from "@/lib/predictions";
import type { CategoryPrediction } from "@/types";

const TREND_ICON = {
  up:     <TrendingUp   className="w-4 h-4 text-[#10B981]" />,
  down:   <TrendingDown className="w-4 h-4 text-[#EF4444]" />,
  stable: <Minus        className="w-4 h-4 text-[var(--text-muted)]" />,
};

const TREND_COLOR = {
  up:     "bg-[#10B981]",
  down:   "bg-[#EF4444]",
  stable: "bg-primary-600",
};

const DELTA_COLOR = {
  up:     "text-[#10B981]",
  down:   "text-[#EF4444]",
  stable: "text-[var(--text-muted)]",
};

interface CategoryPredictionPanelProps {
  predictions: CategoryPrediction[];
}

export function CategoryPredictionPanel({
  predictions,
}: CategoryPredictionPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {predictions.map((p) => {
        const absDelta = Math.abs(p.predictedDelta);
        const fillPct = Math.min(100, Math.round(absDelta * 200)); // scale for visibility

        return (
          <div key={p.category} className="flex items-center gap-3">
            {/* Trend icon */}
            <span className="shrink-0">{TREND_ICON[p.trend]}</span>

            {/* Category name */}
            <span className="text-sm text-[var(--text)] w-28 shrink-0">
              {p.category}
            </span>

            {/* Progress bar */}
            <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", TREND_COLOR[p.trend])}
                style={{ width: `${fillPct}%` }}
                role="progressbar"
                aria-valuenow={fillPct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            {/* Delta */}
            <span
              className={cn(
                "text-xs font-medium w-12 text-right shrink-0",
                DELTA_COLOR[p.trend]
              )}
            >
              {formatDelta(p.predictedDelta)}
            </span>

            {/* Confidence */}
            <span className="text-[10px] text-[var(--text-muted)] w-16 text-right shrink-0">
              {Math.round(p.confidence * 100)}% fiabilité
            </span>
          </div>
        );
      })}
    </div>
  );
}
