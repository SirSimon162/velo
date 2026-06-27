import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const widths = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  full: "max-w-full",
} as const;

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: keyof typeof widths;
  center?: boolean;
}

export function Container({
  width = "lg",
  center = true,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "px-4 sm:px-6",
        widths[width],
        center && "mx-auto",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
