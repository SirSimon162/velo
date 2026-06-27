"use client";

import { useEffect, useMemo, useState } from "react";
import { MuscleBalancePanel } from "@/components/dashboard/shared/MuscleBalancePanel";
import {
  defaultExerciseFilters,
  ExerciseFilters,
} from "@/components/dashboard/shared/ExerciseFilters";
import { SortableExerciseList } from "@/components/dashboard/shared/SortableExerciseList";
import { filterExercises } from "@/lib/exercises";
import { analyzeMuscleBalance, analyzeProgramBalance } from "@/lib/muscles";
import { newId } from "@/lib/storage";
import type { CycleDays, Program, RoutineDay } from "@/lib/types";
import { CYCLE_OPTIONS } from "@/lib/types";
import { useVeloStorage } from "@/lib/velo-storage";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ExerciseCard,
  Heading,
  Input,
  Label,
  PageHeader,
  Text,
} from "@/components/ui";
import { BackButton } from "@/components/ui/molecules/BackButton";

function emptyDay(index: number): RoutineDay {
  return { id: newId(), name: `Day ${index + 1}`, exerciseIds: [] };
}

interface ProgramBuilderProps {
  prefillExerciseIds?: string[] | null;
  onPrefillConsumed?: () => void;
}

export function ProgramBuilder({
  prefillExerciseIds,
  onPrefillConsumed,
}: ProgramBuilderProps) {
  const { programs, upsertProgram, removeProgram } = useVeloStorage();
  const [editing, setEditing] = useState<Program | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [filters, setFilters] = useState(defaultExerciseFilters);

  useEffect(() => {
    if (!prefillExerciseIds?.length || editing) return;
    setEditing({
      id: newId(),
      name: "My Program",
      days: [
        {
          id: newId(),
          name: "Day 1",
          exerciseIds: [...prefillExerciseIds],
        },
      ],
      cycleDays: 3,
      createdAt: new Date().toISOString(),
    });
    setActiveDay(0);
    onPrefillConsumed?.();
  }, [prefillExerciseIds, editing, onPrefillConsumed]);

  const programBalance = useMemo(
    () => (editing ? analyzeProgramBalance(editing) : { worked: [], neglected: [] }),
    [editing],
  );

  const dayBalance = useMemo(() => {
    if (!editing) return { worked: [], neglected: [] };
    return analyzeMuscleBalance(editing.days[activeDay]?.exerciseIds ?? []);
  }, [editing, activeDay]);

  function startNew() {
    setEditing({
      id: newId(),
      name: "My Program",
      days: [emptyDay(0), emptyDay(1), emptyDay(2)],
      cycleDays: 3,
      createdAt: new Date().toISOString(),
    });
    setActiveDay(0);
    setFilters(defaultExerciseFilters);
  }

  function startEdit(program: Program) {
    setEditing(structuredClone(program));
    setActiveDay(0);
    setFilters(defaultExerciseFilters);
  }

  function save() {
    if (!editing) return;
    upsertProgram(editing);
    setEditing(null);
  }

  function toggleExercise(exerciseId: string) {
    if (!editing) return;
    const day = editing.days[activeDay];
    const has = day.exerciseIds.includes(exerciseId);
    setEditing({
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
    });
  }

  function renameDay(index: number, name: string) {
    if (!editing) return;
    setEditing({
      ...editing,
      days: editing.days.map((d, i) => (i === index ? { ...d, name } : d)),
    });
  }

  function duplicateDay(index: number) {
    if (!editing) return;
    const source = editing.days[index];
    const copy: RoutineDay = {
      id: newId(),
      name: `${source.name} copy`,
      exerciseIds: [...source.exerciseIds],
    };
    const days = [...editing.days];
    days.splice(index + 1, 0, copy);
    const cycleDays = Math.min(7, Math.max(editing.cycleDays, days.length)) as CycleDays;
    setEditing({ ...editing, days, cycleDays });
    setActiveDay(index + 1);
  }

  function setCycleDays(cycleDays: CycleDays) {
    if (!editing) return;
    let days = [...editing.days];
    while (days.length > cycleDays) days = days.slice(0, -1);
    while (days.length < cycleDays) days = [...days, emptyDay(days.length)];
    setEditing({ ...editing, cycleDays, days });
    setActiveDay(Math.min(activeDay, days.length - 1));
  }

  function reorderDayExercises(ids: string[]) {
    if (!editing) return;
    setEditing({
      ...editing,
      days: editing.days.map((d, i) =>
        i === activeDay ? { ...d, exerciseIds: ids } : d,
      ),
    });
  }

  if (editing) {
    const day = editing.days[activeDay];
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
          <Button onClick={save}>Save program</Button>
        </div>

        <Input
          inputSize="lg"
          value={editing.name}
          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          className="rounded-lg"
          placeholder="Program name"
          aria-label="Program name"
        />

        <MuscleBalancePanel balance={programBalance} title="Full program balance" />

        <Card variant="subtle" padding="sm" className="space-y-4">
          <div>
            <Label className="mb-2">Repeat every</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cycle length">
              {CYCLE_OPTIONS.map((d: CycleDays) => (
                <Button
                  key={d}
                  variant={editing.cycleDays === d ? "pillActive" : "pill"}
                  role="radio"
                  aria-checked={editing.cycleDays === d}
                  onClick={() => setCycleDays(d)}
                >
                  {d} days
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2">Training days</Label>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {editing.days.map((d, i) => (
                <Button
                  key={d.id}
                  variant={activeDay === i ? "tabActive" : "pill"}
                  onClick={() => setActiveDay(i)}
                  className="shrink-0"
                >
                  {d.name}
                  {d.exerciseIds.length > 0 && (
                    <span className="ml-1.5 text-xs opacity-60">
                      ({d.exerciseIds.length})
                    </span>
                  )}
                </Button>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Input
                className="flex-1"
                value={day.name}
                onChange={(e) => renameDay(activeDay, e.target.value)}
                placeholder="Day name"
                aria-label="Day name"
              />
              <Button variant="secondary" onClick={() => duplicateDay(activeDay)}>
                Duplicate day
              </Button>
            </div>
          </div>
        </Card>

        <MuscleBalancePanel balance={dayBalance} title={`${day.name} balance`} compact />

        {day.exerciseIds.length > 0 && (
          <SortableExerciseList
            exerciseIds={day.exerciseIds}
            onReorder={reorderDayExercises}
            onRemove={(id) => toggleExercise(id)}
          />
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
              selected={day.exerciseIds.includes(exercise.id)}
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
          title="Programs"
          description="Multi-day splits with full muscle coverage at a glance"
        />
        <Button fullWidth className="sm:w-auto" onClick={startNew}>
          + New program
        </Button>
      </div>

      {programs.length === 0 ? (
        <EmptyState
          message="No programs yet."
          action={
            <Button variant="ghost" className="text-accent-text" onClick={startNew}>
              Create your first program →
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {programs.map((program) => {
            const balance = analyzeProgramBalance(program);
            return (
              <Card key={program.id} padding="sm" className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <Heading as="h3" variant="h4" className="truncate">
                      {program.name}
                    </Heading>
                    <Text variant="caption" className="mt-1">
                      {program.days.length} day
                      {program.days.length !== 1 ? "s" : ""} · repeats every{" "}
                      {program.cycleDays} days
                    </Text>
                    <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                      {program.days.map((d) => (
                        <Badge
                          key={d.id}
                          className="px-2 py-0.5 text-[11px] sm:px-2.5 sm:text-xs"
                        >
                          {d.name}: {d.exerciseIds.length}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
                    <Button
                      variant="secondary"
                      className="flex-1 sm:flex-none"
                      onClick={() => startEdit(program)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1 sm:flex-none"
                      onClick={() => removeProgram(program.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <MuscleBalancePanel
                  balance={balance}
                  title="Program muscle balance"
                  compact
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
