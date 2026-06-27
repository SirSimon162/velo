"use client";

import { useEffect, useMemo, useState } from "react";
import { MuscleBalancePanel } from "@/components/dashboard/shared/MuscleBalancePanel";
import {
  defaultExerciseFilters,
  ExerciseFilters,
} from "@/components/dashboard/shared/ExerciseFilters";
import { SortableExerciseList } from "@/components/dashboard/shared/SortableExerciseList";
import { filterExercises } from "@/lib/exercises";
import { analyzeMuscleBalance } from "@/lib/muscles";
import { newId } from "@/lib/storage";
import type { SavedWorkout } from "@/lib/types";
import { useVeloStorage } from "@/lib/velo-storage";
import {
  Button,
  Card,
  EmptyState,
  ExerciseCard,
  Heading,
  Input,
  PageHeader,
  Text,
} from "@/components/ui";
import { BackButton } from "@/components/ui/molecules/BackButton";

interface WorkoutBuilderProps {
  prefillExerciseIds?: string[] | null;
  onPrefillConsumed?: () => void;
}

export function WorkoutBuilder({
  prefillExerciseIds,
  onPrefillConsumed,
}: WorkoutBuilderProps) {
  const { savedWorkouts, upsertSavedWorkout, removeSavedWorkout } = useVeloStorage();
  const [editing, setEditing] = useState<SavedWorkout | null>(null);
  const [filters, setFilters] = useState(defaultExerciseFilters);

  useEffect(() => {
    if (!prefillExerciseIds?.length || editing) return;
    setEditing({
      id: newId(),
      name: "My Workout",
      exerciseIds: [...prefillExerciseIds],
      createdAt: new Date().toISOString(),
    });
    onPrefillConsumed?.();
  }, [prefillExerciseIds, editing, onPrefillConsumed]);

  const editBalance = useMemo(
    () =>
      editing ? analyzeMuscleBalance(editing.exerciseIds) : { worked: [], neglected: [] },
    [editing],
  );

  function startNew() {
    setEditing({
      id: newId(),
      name: "My Workout",
      exerciseIds: [],
      createdAt: new Date().toISOString(),
    });
    setFilters(defaultExerciseFilters);
  }

  function startEdit(workout: SavedWorkout) {
    setEditing(structuredClone(workout));
    setFilters(defaultExerciseFilters);
  }

  function save() {
    if (!editing) return;
    upsertSavedWorkout(editing);
    setEditing(null);
  }

  function toggleExercise(exerciseId: string) {
    if (!editing) return;
    const has = editing.exerciseIds.includes(exerciseId);
    setEditing({
      ...editing,
      exerciseIds: has
        ? editing.exerciseIds.filter((id) => id !== exerciseId)
        : [...editing.exerciseIds, exerciseId],
    });
  }

  function reorderExercises(ids: string[]) {
    if (!editing) return;
    setEditing({ ...editing, exerciseIds: ids });
  }

  if (editing) {
    const filtered = filterExercises({
      movement: filters.movement,
      muscle: filters.muscle,
      query: filters.query,
      equipment: filters.equipment,
    });

    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <BackButton onClick={() => setEditing(null)} />
          <Button onClick={save}>Save workout</Button>
        </div>

        <Input
          inputSize="lg"
          value={editing.name}
          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          placeholder="Workout name"
          aria-label="Workout name"
        />

        {editing.exerciseIds.length > 0 && (
          <>
            <MuscleBalancePanel balance={editBalance} title="Workout muscle balance" />
            <SortableExerciseList
              exerciseIds={editing.exerciseIds}
              onReorder={reorderExercises}
              onRemove={(id) => toggleExercise(id)}
            />
          </>
        )}

        <ExerciseFilters
          value={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          totalCount={filterExercises({}).length}
        />

        <div className="exercise-card-grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exercise) => (
            <div key={exercise.id} className="h-full min-h-0">
              <ExerciseCard
              exercise={exercise}
              selected={editing.exerciseIds.includes(exercise.id)}
              onClick={() => toggleExercise(exercise.id)}
              showSelect
            />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Workouts"
          description="Single-session templates — see which muscles each one covers"
        />
        <Button fullWidth className="sm:w-auto" onClick={startNew}>
          + New workout
        </Button>
      </div>

      {savedWorkouts.length === 0 ? (
        <EmptyState
          message="No saved workouts yet."
          action={
            <Button variant="ghost" className="text-accent-text" onClick={startNew}>
              Create your first workout →
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {savedWorkouts.map((workout) => {
            const balance = analyzeMuscleBalance(workout.exerciseIds);
            return (
              <Card key={workout.id} padding="sm" className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Heading as="h3" variant="h4" className="truncate">
                      {workout.name}
                    </Heading>
                    <Text variant="caption" className="mt-1">
                      {workout.exerciseIds.length} exercise
                      {workout.exerciseIds.length !== 1 ? "s" : ""}
                    </Text>
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
                    <Button variant="secondary" onClick={() => startEdit(workout)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => removeSavedWorkout(workout.id)}>
                      Delete
                    </Button>
                  </div>
                </div>

                {workout.exerciseIds.length > 0 && (
                  <MuscleBalancePanel balance={balance} title="Muscle balance" compact />
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
