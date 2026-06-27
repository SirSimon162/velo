import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  body: "text-base leading-relaxed text-muted sm:text-lg",
  bodySm: "text-sm leading-relaxed text-muted sm:text-base",
  caption: "text-xs text-muted sm:text-sm",
  faint: "text-sm text-faint",
  accent: "text-sm text-accent-text",
  inverse: "text-sm text-subtle",
  stat: "text-sm font-medium tabular-nums text-foreground",
} as const;

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span" | "div";
  variant?: keyof typeof variants;
}

export function Text({
  as: Tag = "p",
  variant = "body",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag className={cn(variants[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
