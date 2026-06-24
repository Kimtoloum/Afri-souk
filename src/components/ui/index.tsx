"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";

/* ── Utility ──────────────────────────────────────────── */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(inputs.filter(Boolean).join(" "));
}

/* ── Button ───────────────────────────────────────────── */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 text-white hover:bg-primary-500 shadow-sm",
        secondary:
          "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)]",
        ghost:
          "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
        danger:
          "bg-ai-danger text-white hover:opacity-90",
        outline:
          "border border-primary-600 text-primary-600 hover:bg-primary-50",
      },
      size: {
        sm: "text-xs px-3 py-1.5 h-7",
        md: "text-sm px-4 py-2 h-9",
        lg: "text-base px-6 py-2.5 h-11",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Rend le style du bouton sur son unique enfant (ex: un <Link>) au lieu d'un <button> */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild && isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string; onClick?: (e: any) => void }>;
      return cloneElement(child, {
        className: cn(child.props.className, classes),
        ...props,
        onClick: (e: any) => {
          child.props.onClick?.(e);
          (props as any).onClick?.(e);
        },
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

/* ── Badge ────────────────────────────────────────────── */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default:  "bg-primary-100 text-primary-700",
        success:  "bg-ai-upLight text-emerald-800",
        warning:  "bg-ai-warnLight text-amber-800",
        danger:   "bg-ai-dangerLight text-red-800",
        neutral:  "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);

/* ── Card ─────────────────────────────────────────────── */
export const Card = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-card transition-all duration-200",
      className
    )}
    {...props}
  />
);

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-1.5 p-5 pb-0", className)}
    {...props}
  />
);

export const CardContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5", className)} {...props} />
);

/* ── PriceTag ─────────────────────────────────────────── */
export const PriceTag = ({
  value,
  currency = "XOF",
  className,
}: {
  value: number;
  currency?: string;
  className?: string;
}) => (
  <span
    className={cn(
      "font-mono text-base font-semibold text-primary-600 tracking-tight",
      className
    )}
  >
    {new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)}
  </span>
); 
/* ── Skeleton ─────────────────────────────────────────── */
export const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "animate-pulse rounded bg-[var(--surface)] border border-[var(--border)]",
      className
    )}
    {...props}
  />
);
