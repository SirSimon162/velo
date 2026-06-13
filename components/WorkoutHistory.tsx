"use client";

import { useEffect, useState } from "react";
import { getExerciseById } from "@/lib/exercises";
import { deleteWorkout, getWorkouts } from "@/lib/storage";
import type { WorkoutSession } from "@/lib/types";

export function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setWorkouts(getWorkouts());
  }, []);

  function remove(id: string) {
    deleteWorkout(id);
    setWorkouts(getWorkouts());
    if (expanded === id) setExpanded(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-50 sm:text-2xl">History</h2>
        <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
          Past workouts saved on this device
        </p>
      </div>

      {workouts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center sm:p-12">
          <p className="text-sm text-zinc-500">No workouts logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <div
              key={w.id}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60"
            >
              <button
                type="button"
                onClick={() =>
                  setExpanded(expanded === w.id ? null : w.id)
                }
                className="flex w-full min-w-0 items-center justify-between gap-3 p-3.5 text-left hover:bg-zinc-800/40 active:bg-zinc-800/60 sm:p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-100 text-[15px] sm:text-base">
                    {w.routineName} · {w.dayName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500 sm:text-sm">
                    {formatDate(w.completedAt)} · {w.exercises.length} exercises
                  </p>
                </div>
                <span className="shrink-0 text-sm text-zinc-600">
                  {expanded === w.id ? "▲" : "▼"}
                </span>
              </button>

              {expanded === w.id && (
                <div className="space-y-4 border-t border-zinc-800 p-3.5 sm:p-4">
                  {w.exercises.map((log) => {
                    const ex = getExerciseById(log.exerciseId);
                    return (
                      <div key={log.exerciseId} className="min-w-0">
                        <p className="text-sm font-medium text-zinc-300 break-words">
                          {ex?.name ?? log.exerciseId}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
                          {log.sets.map((s, i) => (
                            <span
                              key={i}
                              className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-400 sm:text-xs"
                            >
                              Set {i + 1}: {s.reps} reps
                              {s.weight > 0 ? ` @ ${s.weight} kg` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => remove(w.id)}
                    className="touch-target text-sm text-red-400 hover:text-red-300"
                  >
                    Delete workout
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
