"use client";

import { useEffect, useState } from "react";
import { exercises, getExerciseById } from "@/lib/exercises";
import { deleteRoutine, getRoutines, saveRoutine } from "@/lib/storage";
import type { CycleDays, Movement, Routine, RoutineDay } from "@/lib/types";
import { CYCLE_OPTIONS, MOVEMENT_LABELS } from "@/lib/types";
import { ExerciseCard } from "./ExerciseCard";

const movements: Movement[] = ["push", "pull", "legs", "cardio", "core"];

function newId() {
  return crypto.randomUUID();
}

function emptyDay(index: number): RoutineDay {
  return { id: newId(), name: `Day ${index + 1}`, exerciseIds: [] };
}

export function RoutineBuilder() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [editing, setEditing] = useState<Routine | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [filter, setFilter] = useState<Movement>("push");

  useEffect(() => {
    setRoutines(getRoutines());
  }, []);

  function startNew() {
    setEditing({
      id: newId(),
      name: "My Routine",
      days: [emptyDay(0)],
      cycleDays: 3,
      createdAt: new Date().toISOString(),
    });
    setActiveDay(0);
  }

  function startEdit(routine: Routine) {
    setEditing(structuredClone(routine));
    setActiveDay(0);
  }

  function save() {
    if (!editing) return;
    saveRoutine(editing);
    setRoutines(getRoutines());
    setEditing(null);
  }

  function remove(id: string) {
    deleteRoutine(id);
    setRoutines(getRoutines());
    if (editing?.id === id) setEditing(null);
  }

  function toggleExercise(exerciseId: string) {
    if (!editing) return;
    const day = editing.days[activeDay];
    const has = day.exerciseIds.includes(exerciseId);
    const updated = {
      ...editing,
      days: editing.days.map((d, i) =>
        i === activeDay
          ? {
              ...d,
              exerciseIds: has
                ? d.exerciseIds.filter((id) => id !== exerciseId)
                : [...d.exerciseIds, exerciseId],
            }
          : d,
      ),
    };
    setEditing(updated);
  }

  function addDay() {
    if (!editing) return;
    setEditing({
      ...editing,
      days: [...editing.days, emptyDay(editing.days.length)],
    });
    setActiveDay(editing.days.length);
  }

  function removeDay(index: number) {
    if (!editing || editing.days.length <= 1) return;
    const days = editing.days.filter((_, i) => i !== index);
    setEditing({ ...editing, days });
    setActiveDay(Math.min(activeDay, days.length - 1));
  }

  if (editing) {
    const day = editing.days[activeDay];
    const filtered = exercises.filter((e) => e.movement === filter);

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="touch-target -ml-2 px-2 text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={save}
            className="touch-target rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 active:bg-emerald-600"
          >
            Save Routine
          </button>
        </div>

        <input
          type="text"
          value={editing.name}
          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-lg font-bold text-zinc-50 outline-none focus:border-emerald-500 sm:text-xl"
          placeholder="Routine name"
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Repeat every
          </label>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:w-fit">
            {CYCLE_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setEditing({ ...editing, cycleDays: d })}
                className={`touch-target rounded-lg px-3 py-2.5 text-sm font-medium sm:px-4 ${
                  editing.cycleDays === d
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-400">
              Training days
            </label>
            <button
              type="button"
              onClick={addDay}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              + Add day
            </button>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {editing.days.map((d, i) => (
              <div key={d.id} className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveDay(i)}
                  className={`touch-target rounded-lg px-3 py-2 text-sm font-medium sm:px-4 ${
                    activeDay === i
                      ? "bg-zinc-100 text-zinc-900"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {d.name}
                  {d.exerciseIds.length > 0 && (
                    <span className="ml-1.5 text-xs opacity-60">
                      ({d.exerciseIds.length})
                    </span>
                  )}
                </button>
                {editing.days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(i)}
                    className="touch-target px-2 text-lg text-zinc-600 hover:text-red-400"
                    aria-label={`Remove ${d.name}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {day.exerciseIds.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Selected for {day.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {day.exerciseIds.map((id) => {
                const ex = getExerciseById(id);
                return ex ? (
                  <span
                    key={id}
                    className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-400"
                  >
                    {ex.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {movements.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilter(m)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium touch-target sm:py-1.5 ${
                filter === m
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {MOVEMENT_LABELS[m]}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              selected={day.exerciseIds.includes(exercise.id)}
              onClick={() => toggleExercise(exercise.id)}
              showSelect
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-zinc-50 sm:text-2xl">Routines</h2>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
            Build Day 1, Day 2… and set your repeat cycle
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="touch-target w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 sm:w-auto"
        >
          + New Routine
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center sm:p-12">
          <p className="text-zinc-500">No routines yet.</p>
          <button
            type="button"
            onClick={startNew}
            className="mt-4 text-sm text-emerald-400 hover:text-emerald-300"
          >
            Create your first routine →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 sm:p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-zinc-100">{routine.name}</h3>
                  <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                    {routine.days.length} day
                    {routine.days.length !== 1 ? "s" : ""} · repeats every{" "}
                    {routine.cycleDays} days
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                    {routine.days.map((d) => (
                      <span
                        key={d.id}
                        className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400 sm:px-2.5 sm:text-xs"
                      >
                        {d.name}: {d.exerciseIds.length} exercises
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(routine)}
                    className="touch-target flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 sm:flex-none sm:py-1.5"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(routine.id)}
                    className="touch-target flex-1 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 sm:flex-none sm:py-1.5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
