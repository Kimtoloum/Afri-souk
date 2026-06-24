"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Badge, cn } from "@/components/ui";
import { stockSeverityLabel } from "@/lib/predictions";
import type { StockAlert } from "@/types";

const SEVERITY_CONFIG = {
  critical: {
    icon: <XCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />,
    badge: "danger" as const,
    rowClass: "border-l-2 border-l-[#EF4444]",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 shrink-0 text-[#F59E0B]" />,
    badge: "warning" as const,
    rowClass: "border-l-2 border-l-[#F59E0B]",
  },
  ok: {
    icon: <CheckCircle className="w-4 h-4 shrink-0 text-[#10B981]" />,
    badge: "success" as const,
    rowClass: "border-l-2 border-l-[#10B981]",
  },
};

interface StockAlertsProps {
  alerts: StockAlert[];
}

export function StockAlerts({ alerts }: StockAlertsProps) {
  const sorted = [...alerts].sort((a, b) => a.daysUntilOut - b.daysUntilOut);

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((alert) => {
        const { icon, badge, rowClass } = SEVERITY_CONFIG[alert.severity];
        return (
          <div
            key={alert.productId}
            className={cn(
              "flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-lg bg-[var(--surface)]",
              rowClass
            )}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text)] truncate">
                {alert.productName}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {alert.currentStock} unités restantes
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant={badge}>{stockSeverityLabel(alert.severity)}</Badge>
              {alert.daysUntilOut < 999 && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  {alert.daysUntilOut <= 0
                    ? "En rupture"
                    : `dans ~${alert.daysUntilOut}j`}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
