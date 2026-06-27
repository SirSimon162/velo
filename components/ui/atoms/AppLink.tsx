import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-active",
  outline:
    "border border-border text-subtle hover:border-border-dashed hover:text-foreground",
  ghost: "text-subtle hover:text-foreground",
} as const;

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-8 py-3.5 text-sm font-semibold",
  lg: "px-10 py-4 text-sm font-semibold",
} as const;

export interface AppLinkProps
  extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
}

export function AppLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: AppLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "touch-target inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
