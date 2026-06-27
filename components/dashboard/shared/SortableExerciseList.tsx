"use client";

import { useState } from "react";
import { getExerciseById } from "@/lib/exercises";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui";
import { MovementBadge } from "@/components/ui/molecules/MovementBadge";
import { IconChevronDown, IconList } from "@/components/ui/icons";

interface SortableExerciseListProps {
  exerciseIds: string[];
  onReorder: (ids: string[]) => void;
  onRemove?: (id: string) => void;
  title?: string;
}

export function SortableExerciseList({
  exerciseIds,
  onReorder,
  onRemove,
  title = "Exercise order",
}: SortableExerciseListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= exerciseIds.length) return;
    const next = [...exerciseIds];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null) return;
    move(dragIndex, targetIndex);
    setDragIndex(null);
  }

  if (exerciseIds.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconList size={16} className="text-faint" />
        <Text variant="caption" className="uppercase tracking-wide">
          {title}
        </Text>
      </div>
      <ul className="space-y-1.5">
        {exerciseIds.map((id, index) => {
          const ex = getExerciseById(id);
          if (!ex) return null;
          return (
            <li
              key={id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-border-muted bg-surface-muted/60 px-3 py-2.5 transition-colors",
                dragIndex === index && "border-accent opacity-60",
              )}
            >
              <span
                className="cursor-grab select-none text-faint active:cursor-grabbing"
                aria-hidden
              >
                ⠿
              </span>
              <div className="min-w-0 flex-1">
                <Text variant="inverse" className="truncate text-sm font-medium">
                  {ex.name}
                </Text>
              </div>
              <MovementBadge movement={ex.movement} className="shrink-0 text-[10px]" />
              <div className="flex shrink-0 gap-0.5">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="rounded-md p-1 text-faint hover:bg-surface-hover hover:text-subtle disabled:opacity-30"
                >
                  <IconChevronDown size={14} className="rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === exerciseIds.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="rounded-md p-1 text-faint hover:bg-surface-hover hover:text-subtle disabled:opacity-30"
                >
                  <IconChevronDown size={14} />
                </button>
                {onRemove && (
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => onRemove(id)}
                    className="rounded-md px-1.5 text-faint hover:bg-surface-hover hover:text-danger"
                  >
                    ×
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
