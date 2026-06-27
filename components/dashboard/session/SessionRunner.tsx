"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SetEntryForm } from "@/components/dashboard/session/SetEntryForm";
import { getLastPerformance, isSetPersonalRecord } from "@/lib/analytics";
import {
  cloneSet,
  emptySet,
  getLoggingType,
  isSetLogged,
  type SetField,
} from "@/lib/logging-profiles";
import { getExerciseById } from "@/lib/exercises";
import { filterLoggedExercises } from "@/lib/session-utils";
import { appShellClass } from "@/lib/app-shell";
import { newId } from "@/lib/storage";
import type {
  ExerciseLog,
  SessionSource,
  WorkoutSession,
  WorkoutSet,
} from "@/lib/types";
import { useVeloStorage } from "@/lib/velo-storage";
import { cn } from "@/lib/cn";
import { Button, Text } from "@/components/ui";
import { BackButton } from "@/components/ui/molecules/BackButton";

export interface SessionRunnerProps {
  exerciseIds: string[];
  source: SessionSource;
  title: string;
  programId?: string;
  programName?: string;
  dayId?: string;
  dayName?: string;
  workoutId?: string;
  workoutName?: string;
  initialLogs?: ExerciseLog[];
  initialActiveExercise?: number;
  onComplete: (session: WorkoutSession) => void;
  onCancel: () => void;
}

export function SessionRunner({
  exerciseIds,
  source,
  title,
  programId,
  programName,
  dayId,
  dayName,
  workoutId,
  workoutName,
  initialLogs,
  initialActiveExercise = 0,
  onComplete,
  onCancel,
}: SessionRunnerProps) {
  const { workouts, addWorkout, persistDraft, discardDraft } = useVeloStorage();

  const [logs, setLogs] = useState<ExerciseLog[]>(
    () =>
      initialLogs ??
      exerciseIds.map((id) => {
        const ex = getExerciseById(id);
        const type = ex ? getLoggingType(ex) : "weighted";
        return { exerciseId: id, sets: [emptySet(type)] };
      }),
  );
  const [activeExercise, setActiveExercise] = useState(initialActiveExercise);

  useEffect(() => {
    const timer = setTimeout(() => {
      persistDraft({
        exerciseIds,
        logs,
        source,
        title,
        activeExercise,
        programId,
        programName,
        dayId,
        dayName,
        workoutId,
        workoutName,
        updatedAt: new Date().toISOString(),
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [
    logs,
    activeExercise,
    exerciseIds,
    source,
    title,
    programId,
    programName,
    dayId,
    dayName,
    workoutId,
    workoutName,
    persistDraft,
  ]);

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: SetField,
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

  function applyPreset(
    exerciseIndex: number,
    setIndex: number,
    preset: WorkoutSet,
  ) {
    setLogs((prev) =>
      prev.map((log, ei) =>
        ei === exerciseIndex
          ? {
              ...log,
              sets: log.sets.map((s, si) =>
                si === setIndex ? { ...preset } : s,
              ),
            }
          : log,
      ),
    );
  }

  function addSet(exerciseIndex: number) {
    const ex = getExerciseById(logs[exerciseIndex].exerciseId);
    const type = ex ? getLoggingType(ex) : "weighted";
    setLogs((prev) =>
      prev.map((log, i) =>
        i === exerciseIndex
          ? { ...log, sets: [...log.sets, emptySet(type)] }
          : log,
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

  function applyLastSet(exerciseIndex: number, setIndex: number) {
    const last = getLastPerformance(logs[exerciseIndex].exerciseId, workouts);
    if (!last?.length) return;
    const template = cloneSet(last[Math.min(setIndex, last.length - 1)]);
    setLogs((prev) =>
      prev.map((log, i) =>
        i === exerciseIndex
          ? {
              ...log,
              sets: log.sets.map((s, si) =>
                si === setIndex ? template : s,
              ),
            }
          : log,
      ),
    );
  }

  function finish() {
    const session: WorkoutSession = {
      id: newId(),
      source,
      title,
      exercises: filterLoggedExercises(logs),
      completedAt: new Date().toISOString(),
      programId,
      programName,
      dayId,
      dayName,
      workoutId,
      workoutName,
    };
    addWorkout(session);
    discardDraft();
    onComplete(session);
  }

  function handleCancel() {
    discardDraft();
    onCancel();
  }

  const current = logs[activeExercise];
  const exercise = current ? getExerciseById(current.exerciseId) : null;
  const loggingType = exercise ? getLoggingType(exercise) : "weighted";
  const lastSets = current
    ? getLastPerformance(current.exerciseId, workouts)
    : null;

  const prSetIndices = useMemo(() => {
    if (!current) return [];
    return current.sets
      .map((set, index) =>
        isSetPersonalRecord(current.exerciseId, set, workouts)
          ? index
          : -1,
      )
      .filter((i) => i >= 0);
  }, [current, workouts]);

  return (
    <div className="flex flex-col md:block">
      <div className="space-y-4 sm:space-y-6 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
        <div className="flex items-center justify-between gap-3">
          <BackButton label="Cancel" onClick={handleCancel} />
          <Text variant="faint" className="shrink-0">
            {activeExercise + 1} / {logs.length}
          </Text>
        </div>

        {exercise && current && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeExercise}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28 }}
            >
              <Text variant="accent">{title}</Text>
              <div className="mt-3 rounded-lg border border-border-muted bg-bg/50 p-4">
                <p className="text-lg font-semibold text-foreground">
                  {exercise.name}
                </p>
                <p className="mt-0.5 text-xs text-faint">
                  {exercise.muscles.join(" · ")}
                </p>
                <p className="mt-2 text-xs text-accent-text">
                  Set{" "}
                  {Math.min(
                    current.sets.findIndex(
                      (s) => !isSetLogged(loggingType, s),
                    ) + 1 || current.sets.length,
                    current.sets.length,
                  )}{" "}
                  / {current.sets.length}
                </p>
              </div>

              <div className="mt-4">
                <SetEntryForm
                  exerciseId={current.exerciseId}
                  sets={current.sets}
                  lastSets={lastSets}
                  prSetIndices={prSetIndices}
                  onUpdateSet={(si, field, value) =>
                    updateSet(activeExercise, si, field, value)
                  }
                  onAddSet={() => addSet(activeExercise)}
                  onRemoveSet={(si) => removeSet(activeExercise, si)}
                  onApplyLastSet={(si) => applyLastSet(activeExercise, si)}
                  onApplyPreset={(si, preset) =>
                    applyPreset(activeExercise, si, preset)
                  }
                />
              </div>

              <div className="mt-4 hidden gap-3 sm:flex">
                {activeExercise > 0 && (
                  <Button
                    variant="outline"
                    fullWidth
                    shape="square"
                    onClick={() => setActiveExercise((a) => a - 1)}
                  >
                    Previous
                  </Button>
                )}
                {activeExercise < logs.length - 1 ? (
                  <Button
                    fullWidth
                    shape="square"
                    onClick={() => setActiveExercise((a) => a + 1)}
                  >
                    Next exercise
                  </Button>
                ) : (
                  <Button fullWidth shape="square" onClick={finish}>
                    Finish session
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {exercise && current && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-muted bg-bg/95 backdrop-blur-md pb-safe sm:hidden">
          <div className={cn(appShellClass, "flex gap-3 py-3")}>
            {activeExercise > 0 && (
              <Button
                variant="outline"
                fullWidth
                shape="square"
                onClick={() => setActiveExercise((a) => a - 1)}
              >
                Previous
              </Button>
            )}
            {activeExercise < logs.length - 1 ? (
              <Button
                fullWidth
                shape="square"
                onClick={() => setActiveExercise((a) => a + 1)}
              >
                Next exercise
              </Button>
            ) : (
              <Button fullWidth shape="square" onClick={finish}>
                Finish session
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
