"use client";

import { motion } from "framer-motion";
import type { Exercise } from "@/lib/types";
import { cn } from "@/lib/cn";
import { IconStar } from "@/components/ui/icons";
import { Card } from "../atoms/Card";
import { Heading } from "../atoms/Heading";
import { Text } from "../atoms/Text";
import { MovementBadge } from "./MovementBadge";

interface ExerciseCardProps {
  exercise: Exercise;
  selected?: boolean;
  onClick?: () => void;
  showSelect?: boolean;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
}

export function ExerciseCard({
  exercise,
  selected,
  onClick,
  showSelect,
  favorite,
  onToggleFavorite,
  className,
}: ExerciseCardProps) {
  return (
    <motion.div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "group h-full w-full overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        onClick && "cursor-pointer",
        !onClick && "cursor-default",
        className,
      )}
    >
      <Card
        variant="interactive"
        padding="sm"
        selected={selected}
        className="relative flex h-full min-h-[8.25rem] flex-col"
      >
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <Heading
            as="h3"
            variant="h4"
            className="line-clamp-2 min-w-0 flex-1 leading-snug text-[15px] sm:text-base"
          >
            {exercise.name}
          </Heading>
          {(showSelect || onToggleFavorite) && (
            <div className="flex shrink-0 items-center gap-0.5">
              {showSelect && (
                <motion.span
                  layout
                  aria-hidden
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-lg border text-xs",
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-border-dashed text-transparent",
                  )}
                >
                  ✓
                </motion.span>
              )}
              {onToggleFavorite && (
                <button
                  type="button"
                  aria-label={favorite ? "Remove favorite" : "Add favorite"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  className="rounded-lg p-1 text-faint transition-colors hover:bg-surface-hover hover:text-accent-text"
                >
                  <IconStar
                    size={16}
                    className={cn(
                      favorite && "fill-accent-text text-accent-text",
                    )}
                  />
                </button>
              )}
            </div>
          )}
        </div>
        <MovementBadge movement={exercise.movement} className="w-fit" />
        <Text
          variant="caption"
          className="mt-auto line-clamp-2 pt-1.5 leading-relaxed text-faint"
        >
          {exercise.muscles.join(" · ")}
        </Text>
      </Card>
    </motion.div>
  );
}
