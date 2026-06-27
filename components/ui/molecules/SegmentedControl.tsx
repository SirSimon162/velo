"use client";

import { cn } from "@/lib/cn";

interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (value: T) => string;
  getCount?: (value: T) => number | undefined;
  className?: string;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  getLabel,
  getCount,
  className,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className={cn("space-y-2", className)}>
      <legend className="text-xs font-medium uppercase tracking-wide text-faint">
        {label}
      </legend>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-1.5"
      >
        {options.map((option) => {
          const active = value === option;
          const count = getCount?.(option);
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className={cn(
                "touch-target min-h-[2.5rem] rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                active
                  ? "border-accent-border bg-accent-muted text-accent-text"
                  : "border-border-muted bg-surface-muted text-muted hover:border-border hover:text-subtle",
              )}
            >
              {getLabel(option)}
              {count !== undefined && (
                <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
