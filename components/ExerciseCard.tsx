"use client";

import type { Exercise, Movement } from "@/lib/types";
import { MOVEMENT_LABELS } from "@/lib/types";

const movementColors: Record<Movement, string> = {
  push: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  pull: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  legs: "bg-green-500/15 text-green-400 border-green-500/30",
  cardio: "bg-red-500/15 text-red-400 border-red-500/30",
  core: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

interface ExerciseCardProps {
  exercise: Exercise;
  selected?: boolean;
  onClick?: () => void;
  showSelect?: boolean;
}

export function ExerciseCard({
  exercise,
  selected,
  onClick,
  showSelect,
}: ExerciseCardProps) {
  const color = movementColors[exercise.movement];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`group w-full rounded-xl border p-3.5 text-left transition-all active:scale-[0.99] sm:p-4 ${
        selected
          ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50"
          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-100 leading-snug text-[15px] sm:text-base">
          {exercise.name}
        </h3>
        {showSelect && (
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
              selected
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-zinc-600 text-transparent"
            }`}
          >
            ✓
          </span>
        )}
      </div>
      <span
        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}
      >
        {MOVEMENT_LABELS[exercise.movement]}
      </span>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500 sm:text-sm break-words">
        {exercise.muscles.join(" · ")}
      </p>
    </button>
  );
}
