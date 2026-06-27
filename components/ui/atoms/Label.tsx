import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Label({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium text-muted", className)}
      {...props}
    >
      {children}
    </label>
  );
}
