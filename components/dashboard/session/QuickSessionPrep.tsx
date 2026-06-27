"use client";

import { useMemo } from "react";
import { MuscleCoveragePanel } from "@/components/dashboard/session/MuscleCoveragePanel";
import { SortableExerciseList } from "@/components/dashboard/shared/SortableExerciseList";
import { analyzeMuscleCoverage } from "@/lib/muscles";
import { useVeloStorage } from "@/lib/velo-storage";
import { Button, PageHeader } from "@/components/ui";
import { BackButton } from "@/components/ui/molecules/BackButton";

interface QuickSessionPrepProps {
  exerciseIds: string[];
  onStart: () => void;
  onBack: () => void;
  onRemoveExercise: (id: string) => void;
  onAddMore: () => void;
  onReorder: (ids: string[]) => void;
}

export function QuickSessionPrep({
  exerciseIds,
  onStart,
  onBack,
  onRemoveExercise,
  onAddMore,
  onReorder,
}: QuickSessionPrepProps) {
  const { workouts } = useVeloStorage();

  const analysis = useMemo(
    () => analyzeMuscleCoverage(exerciseIds, workouts),
    [exerciseIds, workouts],
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <BackButton onClick={onBack} />
        <Button variant="ghost" className="text-accent-text" onClick={onAddMore}>
          + Add more
        </Button>
      </div>

      <PageHeader
        title="Quick Session"
        description="Review and reorder your lineup before you start"
      />

      <MuscleCoveragePanel analysis={analysis} />

      <SortableExerciseList
        exerciseIds={exerciseIds}
        onReorder={onReorder}
        onRemove={onRemoveExercise}
        title={`${exerciseIds.length} exercises`}
      />

      <Button
        fullWidth
        shape="square"
        disabled={exerciseIds.length === 0}
        onClick={onStart}
      >
        Start session
      </Button>
    </div>
  );
}
