import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-active",
  secondary:
    "bg-surface-hover text-subtle hover:bg-surface-active",
  ghost: "text-muted hover:text-subtle",
  outline:
    "border border-border-dashed text-subtle hover:border-border hover:text-foreground",
  danger: "text-danger hover:bg-danger-muted",
  inverse: "bg-inverse text-inverse-text",
  pill: "bg-surface-hover text-muted hover:bg-surface-active hover:text-subtle",
  pillActive: "bg-accent text-white",
  tab: "text-muted hover:bg-surface-hover hover:text-subtle",
  tabActive: "bg-inverse text-inverse-text",
  tabBottom: "text-muted active:text-subtle",
  tabBottomActive: "text-accent-text",
  accentSoft: "bg-accent-muted text-accent-text hover:bg-accent-subtle",
  dashed: "border border-dashed border-border-dashed text-muted",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-sm font-semibold",
} as const;

const shapes = {
  default: "rounded-lg",
  pill: "rounded-lg",
  square: "rounded-lg",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;
export type ButtonShape = keyof typeof shapes;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  shape = "default",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "touch-target inline-flex items-center justify-center font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100",
        variants[variant],
        sizes[size],
        shapes[shape],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
