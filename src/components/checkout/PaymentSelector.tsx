"use client";

import { cn } from "@/components/ui";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types";

interface PaymentSelectorProps {
  value: PaymentMethod | "";
  onChange: (method: PaymentMethod) => void;
  error?: string;
}

export function PaymentSelector({ value, onChange, error }: PaymentSelectorProps) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PAYMENT_METHODS.map((method) => {
          const selected = value === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              disabled={!method.available}
              className={cn(
                "flex flex-col gap-1 p-3 rounded-xl border text-left transition-all duration-150 disabled:opacity-40",
                selected
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-600"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-primary-300"
              )}
            >
              <span className="text-xl leading-none">{method.icon}</span>
              <span className={cn("text-xs font-medium", selected ? "text-primary-700 dark:text-primary-300" : "text-[var(--text)]")}>
                {method.label}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                {method.description}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-[#EF4444] mt-1.5">{error}</p>}
    </div>
  );
}
