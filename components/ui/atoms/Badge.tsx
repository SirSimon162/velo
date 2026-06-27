import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  default: "bg-surface-hover text-muted",
  accent: "bg-accent-muted text-accent-text",
  muted: "bg-surface-hover text-faint",
  outline: "border border-border-muted bg-transparent text-muted",
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  movementClass?: string;
}

export function Badge({
  variant = "default",
  movementClass,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-lg border px-2 py-0.5 text-xs font-medium",
        movementClass ?? variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
