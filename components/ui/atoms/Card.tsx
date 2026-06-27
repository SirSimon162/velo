import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  default: "surface-card",
  elevated: "surface-panel shadow-2xl shadow-black/30 backdrop-blur-sm",
  subtle: "rounded-lg border border-border-muted bg-surface-subtle",
  dashed: "rounded-lg border border-dashed border-border-dashed",
  interactive: "surface-card-interactive",
} as const;

const paddings = {
  none: "",
  sm: "p-3.5 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-6 sm:p-8",
} as const;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  padding?: keyof typeof paddings;
  selected?: boolean;
}

export function Card({
  variant = "default",
  padding = "sm",
  selected,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        variants[variant],
        paddings[padding],
        selected && "surface-selected",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
