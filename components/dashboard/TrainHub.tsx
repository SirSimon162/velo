"use client";

import { ExpandableExerciseList } from "@/components/dashboard/shared/ExpandableExerciseList";
import { MuscleBalancePanel } from "@/components/dashboard/shared/MuscleBalancePanel";
import {
  analyzeMuscleBalance,
  analyzeProgramBalance,
} from "@/lib/muscles";
import type { Program, SavedWorkout } from "@/lib/types";
import { useVeloStorage } from "@/lib/velo-storage";
import {
  Button,
  Card,
  EmptyState,
  Heading,
  PageHeader,
  Text,
} from "@/components/ui";

interface TrainHubProps {
  onStartProgramDay: (program: Program, dayIndex: number) => void;
  onStartWorkout: (workout: SavedWorkout) => void;
  onGoToExercises: () => void;
  onCreateProgram: () => void;
}

export function TrainHub({
  onStartProgramDay,
  onStartWorkout,
  onGoToExercises,
  onCreateProgram,
}: TrainHubProps) {
  const { programs, savedWorkouts } = useVeloStorage();

  if (programs.length === 0 && savedWorkouts.length === 0) {
    return (
      <EmptyState
        message="Nothing to train yet."
        action={
          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="text-accent-text" onClick={onGoToExercises}>
              Browse exercises →
            </Button>
            <Button variant="ghost" className="text-accent-text" onClick={onCreateProgram}>
              Create a program →
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Train"
        description="Start a saved workout or program day"
      />

      {savedWorkouts.length > 0 && (
        <section className="space-y-4" aria-labelledby="saved-workouts-heading">
          <Heading id="saved-workouts-heading" variant="h4">
            Saved workouts
          </Heading>
          {savedWorkouts.map((workout) => (
            <Card key={workout.id} padding="sm" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Heading as="h3" variant="h4" className="truncate">
                    {workout.name}
                  </Heading>
                  <Text variant="caption">
                    {workout.exerciseIds.length} exercises
                  </Text>
                </div>
                <Button
                  disabled={workout.exerciseIds.length === 0}
                  onClick={() => onStartWorkout(workout)}
                >
                  Start
                </Button>
              </div>
              {workout.exerciseIds.length > 0 && (
                <>
                  <ExpandableExerciseList exerciseIds={workout.exerciseIds} />
                  <MuscleBalancePanel
                    balance={analyzeMuscleBalance(workout.exerciseIds)}
                    compact
                    title="Muscle balance"
                  />
                </>
              )}
            </Card>
          ))}
        </section>
      )}

      {programs.length > 0 && (
        <section className="space-y-4" aria-labelledby="programs-heading">
          <Heading id="programs-heading" variant="h4">
            Programs
          </Heading>
          {programs.map((program) => (
            <Card key={program.id} padding="sm" className="space-y-4">
              <div>
                <Heading as="h3" variant="h4" className="truncate">
                  {program.name}
                </Heading>
                <Text variant="caption" className="mt-0.5">
                  Repeats every {program.cycleDays} days
                </Text>
              </div>

              <ExpandableExerciseList
                groups={program.days.map((d) => ({
                  label: d.name,
                  exerciseIds: d.exerciseIds,
                }))}
              />

              <MuscleBalancePanel
                balance={analyzeProgramBalance(program)}
                compact
                title="Full program balance"
              />

              <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                {program.days.map((day, i) => (
                  <Button
                    key={day.id}
                    variant="accentSoft"
                    disabled={day.exerciseIds.length === 0}
                    className="w-full sm:w-auto"
                    onClick={() => onStartProgramDay(program, i)}
                  >
                    Start {day.name}
                    <span className="ml-1 opacity-60">
                      ({day.exerciseIds.length})
                    </span>
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
