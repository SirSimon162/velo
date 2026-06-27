import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-3 py-2.5 text-base sm:py-2.5 sm:text-base",
  lg: "px-4 py-3 text-lg font-bold sm:text-xl",
} as const;

export function Input({
  inputSize = "md",
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        "w-full min-w-0 rounded-lg border border-border-dashed bg-bg-elevated text-foreground outline-none transition-colors placeholder:text-disabled focus:border-accent",
        sizes[inputSize],
        className,
      )}
      {...props}
    />
  );
}
