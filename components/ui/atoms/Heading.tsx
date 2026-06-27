import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  h1: "font-serif text-[2.75rem] leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl",
  h2: "font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl",
  h3: "text-xl font-semibold text-foreground sm:text-2xl",
  h4: "text-base font-semibold text-foreground",
  display:
    "font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl",
  brand: "font-serif text-xl tracking-tight text-foreground",
} as const;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  variant?: keyof typeof variants;
}

export function Heading({
  as: Tag = "h2",
  variant = "h2",
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag className={cn(variants[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
