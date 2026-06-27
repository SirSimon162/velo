"use client";

import { useState } from "react";
import { getExerciseById } from "@/lib/exercises";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui";
import { MovementBadge } from "@/components/ui/molecules/MovementBadge";
import { IconChevronDown, IconList, IconX } from "@/components/ui/icons";

export interface ExerciseListGroup {
  label: string;
  exerciseIds: string[];
}

interface ExpandableExerciseListProps {
  exerciseIds?: string[];
  groups?: ExerciseListGroup[];
  className?: string;
  inline?: boolean;
  defaultOpen?: boolean;
  onRemove?: (exerciseId: string) => void;
}

export function ExpandableExerciseList({
  exerciseIds,
  groups,
  className,
  inline = false,
  defaultOpen = false,
  onRemove,
}: ExpandableExerciseListProps) {
  const [open, setOpen] = useState(defaultOpen || inline);

  const resolvedGroups: ExerciseListGroup[] =
    groups ??
    (exerciseIds
      ? [{ label: "Exercises", exerciseIds }]
      : []);

  const totalCount = resolvedGroups.reduce(
    (n, g) => n + g.exerciseIds.length,
    0,
  );

  if (totalCount === 0) return null;

  const listContent = (
    <div className={cn(inline ? "space-y-2" : "space-y-4 border-t border-border-muted px-3.5 py-3 sm:px-4")}>
      {resolvedGroups.map((group) => (
        <div key={group.label}>
          {resolvedGroups.length > 1 && (
            <Text
              variant="caption"
              className="mb-2 block text-xs font-medium uppercase tracking-wide"
            >
              {group.label}
            </Text>
          )}
          <ul className="space-y-2">
            {group.exerciseIds.map((id) => {
              const ex = getExerciseById(id);
              if (!ex) return null;
              return (
                <li
                  key={id}
                  className="flex items-center gap-2 rounded-lg border border-border-muted bg-bg/50 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {ex.name}
                    </p>
                    {!inline && (
                      <p className="mt-0.5 truncate text-xs text-faint">
                        {ex.muscles.join(" · ")}
                      </p>
                    )}
                  </div>
                  <MovementBadge movement={ex.movement} className="shrink-0 text-[10px]" />
                  {onRemove && (
                    <button
                      type="button"
                      aria-label={`Remove ${ex.name}`}
                      onClick={() => onRemove(id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:bg-surface-hover hover:text-danger"
                    >
                      <IconX size={16} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  if (inline) {
    return <div className={className}>{listContent}</div>;
  }

  return (
    <div className={cn("rounded-lg border border-border-muted bg-bg/30", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-surface-hover sm:px-4"
      >
        <span className="flex min-w-0 items-center gap-2">
          <IconList className="text-accent-text" size={16} />
          <Text variant="inverse" className="text-sm font-medium">
            {open ? "Hide" : "View"} {totalCount} exercise{totalCount !== 1 ? "s" : ""}
          </Text>
        </span>
        <IconChevronDown
          size={18}
          className={cn(
            "shrink-0 text-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && listContent}
    </div>
  );
}
