"use client";

import { useState } from "react";
import { exercises, getExercisesByMovement } from "@/lib/exercises";
import type { Movement } from "@/lib/types";
import { MOVEMENT_LABELS } from "@/lib/types";
import { ExerciseCard } from "./ExerciseCard";

const movements: Movement[] = ["push", "pull", "legs", "cardio", "core"];

export function ExerciseBrowser() {
  const [active, setActive] = useState<Movement>("push");
  const filtered = getExercisesByMovement(active);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-50 sm:text-2xl">Exercises</h2>
        <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
          {exercises.length} exercises · filter by movement pattern
        </p>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {movements.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setActive(m)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors touch-target sm:py-2 ${
              active === m
                ? "bg-emerald-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            }`}
          >
            {MOVEMENT_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </div>
  );
}
