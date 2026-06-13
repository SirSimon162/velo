"use client";

import { useEffect, useState } from "react";
import { getExerciseById } from "@/lib/exercises";
import { getRoutines, saveWorkout } from "@/lib/storage";
import type {
  ExerciseLog,
  Routine,
  WorkoutSession,
  WorkoutSet,
} from "@/lib/types";

function newId() {
  return crypto.randomUUID();
}

function emptySet(): WorkoutSet {
  return { reps: 0, weight: 0 };
}

interface WorkoutRunnerProps {
  onComplete: () => void;
}

export function WorkoutRunner({ onComplete }: WorkoutRunnerProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    setRoutines(getRoutines());
  }, []);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [activeExercise, setActiveExercise] = useState(0);

  function startWorkout(routine: Routine, dayIndex: number) {
    const day = routine.days[dayIndex];
    setSelectedRoutine(routine);
    setSelectedDayIndex(dayIndex);
    setLogs(
      day.exerciseIds.map((id) => ({
        exerciseId: id,
        sets: [emptySet()],
      })),
    );
    setActiveExercise(0);
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: number,
  ) {
    setLogs((prev) =>
      prev.map((log, ei) =>
        ei === exerciseIndex
          ? {
              ...log,
              sets: log.sets.map((s, si) =>
                si === setIndex ? { ...s, [field]: value } : s,
              ),
            }
          : log,
      ),
    );
  }

  function addSet(exerciseIndex: number) {
    setLogs((prev) =>
      prev.map((log, i) =>
        i === exerciseIndex ? { ...log, sets: [...log.sets, emptySet()] } : log,
      ),
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setLogs((prev) =>
      prev.map((log, i) =>
        i === exerciseIndex && log.sets.length > 1
          ? { ...log, sets: log.sets.filter((_, si) => si !== setIndex) }
          : log,
      ),
    );
  }

  function finish() {
    if (!selectedRoutine || selectedDayIndex === null) return;
    const day = selectedRoutine.days[selectedDayIndex];
    const session: WorkoutSession = {
      id: newId(),
      routineId: selectedRoutine.id,
      routineName: selectedRoutine.name,
      dayId: day.id,
      dayName: day.name,
      exercises: logs.filter((l) => l.sets.some((s) => s.reps > 0)),
      completedAt: new Date().toISOString(),
    };
    saveWorkout(session);
    setSelectedRoutine(null);
    setSelectedDayIndex(null);
    setLogs([]);
    onComplete();
  }

  if (selectedRoutine && selectedDayIndex !== null) {
    const current = logs[activeExercise];
    const exercise = current ? getExerciseById(current.exerciseId) : null;

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedRoutine(null);
              setSelectedDayIndex(null);
            }}
            className="touch-target -ml-2 px-2 text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Cancel
          </button>
          <span className="shrink-0 text-sm text-zinc-500">
            {activeExercise + 1} / {logs.length}
          </span>
        </div>

        {exercise && current && (
          <>
            <div className="min-w-0">
              <p className="text-sm text-emerald-400">
                {selectedRoutine.days[selectedDayIndex].name}
              </p>
              <h2 className="text-xl font-bold leading-tight text-zinc-50 sm:text-2xl">
                {exercise.name}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 sm:text-sm break-words">
                {exercise.muscles.join(" · ")}
              </p>
            </div>

            <div className="space-y-3">
              <div className="hidden grid-cols-[2.5rem_1fr_1fr_2.5rem] gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:grid">
                <span>Set</span>
                <span>Reps</span>
                <span>Weight (kg)</span>
                <span />
              </div>
              {current.sets.map((set, si) => (
                <div
                  key={si}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 sm:border-0 sm:bg-transparent sm:p-0"
                >
                  <div className="mb-2 flex items-center justify-between sm:hidden">
                    <span className="text-sm font-medium text-zinc-300">
                      Set {si + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSet(activeExercise, si)}
                      className="touch-target px-2 text-lg text-zinc-600 hover:text-red-400"
                      aria-label="Remove set"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-[2.5rem_1fr_1fr_2.5rem] sm:items-center sm:gap-2">
                    <span className="hidden text-sm font-medium text-zinc-400 sm:block">
                      {si + 1}
                    </span>
                    <label className="space-y-1 sm:contents">
                      <span className="text-xs font-medium text-zinc-500 sm:hidden">
                        Reps
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={set.reps || ""}
                        onChange={(e) =>
                          updateSet(
                            activeExercise,
                            si,
                            "reps",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                        className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-base text-zinc-100 outline-none focus:border-emerald-500 sm:py-2.5"
                      />
                    </label>
                    <label className="space-y-1 sm:contents">
                      <span className="text-xs font-medium text-zinc-500 sm:hidden">
                        Weight (kg)
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.5}
                        value={set.weight || ""}
                        onChange={(e) =>
                          updateSet(
                            activeExercise,
                            si,
                            "weight",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                        className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-base text-zinc-100 outline-none focus:border-emerald-500 sm:py-2.5"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSet(activeExercise, si)}
                      className="hidden touch-target text-zinc-600 hover:text-red-400 sm:block"
                      aria-label="Remove set"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSet(activeExercise)}
                className="touch-target text-sm text-emerald-400 hover:text-emerald-300"
              >
                + Add set
              </button>
            </div>

            <div className="sticky bottom-20 z-10 -mx-4 flex gap-3 border-t border-zinc-800/80 bg-zinc-950/95 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-4 sm:backdrop-blur-none md:bottom-auto">
              {activeExercise > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveExercise((a) => a - 1)}
                  className="touch-target flex-1 rounded-xl border border-zinc-700 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700"
                >
                  Previous
                </button>
              )}
              {activeExercise < logs.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveExercise((a) => a + 1)}
                  className="touch-target flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-400 active:bg-emerald-600"
                >
                  Next exercise
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  className="touch-target flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-400 active:bg-emerald-600"
                >
                  Finish workout
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center sm:p-12">
        <p className="text-sm text-zinc-500 sm:text-base">
          Create a routine first to start training.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-50 sm:text-2xl">Train</h2>
        <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
          Pick a routine day and log your sets, reps & weight
        </p>
      </div>

      {routines.map((routine) => (
        <div
          key={routine.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 sm:p-4"
        >
          <h3 className="truncate font-semibold text-zinc-100">{routine.name}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Repeats every {routine.cycleDays} days
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            {routine.days.map((day, i) => (
              <button
                key={day.id}
                type="button"
                onClick={() => startWorkout(routine, i)}
                disabled={day.exerciseIds.length === 0}
                className="touch-target w-full rounded-lg bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-400 hover:bg-emerald-500/25 active:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-2"
              >
                Start {day.name}
                <span className="ml-1 opacity-60">
                  ({day.exerciseIds.length})
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
