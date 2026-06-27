"use client";

import { useState } from "react";
import { getExerciseById } from "@/lib/exercises";
import {
  cloneSet,
  displaySetFieldValue,
  EFFORT_FIELDS,
  formatSetSummary,
  getFieldHint,
  getFieldLabel,
  getLoggingType,
  getSetDisplayFields,
  parseSetFieldValue,
  type SetField,
} from "@/lib/logging-profiles";
import { CARDIO_INTERVAL_PRESETS } from "@/lib/types";
import type { WorkoutSet } from "@/lib/types";
import { useVeloStorage } from "@/lib/velo-storage";
import { Button, Card, Input, Text } from "@/components/ui";

interface SetEntryFormProps {
  exerciseId: string;
  sets: WorkoutSet[];
  lastSets?: WorkoutSet[] | null;
  prSetIndices?: number[];
  onUpdateSet: (
    setIndex: number,
    field: SetField,
    value: number,
  ) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onApplyLastSet?: (setIndex: number) => void;
  onApplyPreset?: (setIndex: number, preset: WorkoutSet) => void;
}

export function SetEntryForm({
  exerciseId,
  sets,
  lastSets,
  prSetIndices = [],
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onApplyLastSet,
  onApplyPreset,
}: SetEntryFormProps) {
  const { preferences } = useVeloStorage();
  const exercise = getExerciseById(exerciseId);
  const loggingType = exercise ? getLoggingType(exercise) : "weighted";
  const fields = getSetDisplayFields(loggingType, exerciseId);
  const showEffortFields = loggingType !== "cardio";
  const canRemoveSet = sets.length > 1;
  const [effortOpen, setEffortOpen] = useState<Record<number, boolean>>({});

  function isEffortOpen(setIndex: number, set: WorkoutSet) {
    return effortOpen[setIndex] ?? (set.rpe > 0 || set.rir > 0);
  }

  function renderFieldInput(
    field: SetField,
    set: WorkoutSet,
    setIndex: number,
    options?: { showDesktopLabel?: boolean },
  ) {
    const hint = getFieldHint(field);
    return (
      <label
        key={field}
        className={options?.showDesktopLabel ? "space-y-1" : "space-y-1 sm:contents"}
      >
        <span
          className={
            options?.showDesktopLabel
              ? "text-xs font-medium text-faint"
              : "text-xs font-medium text-faint sm:hidden"
          }
        >
          {getFieldLabel(field, loggingType, preferences)}
        </span>
        {hint && options?.showDesktopLabel && (
          <Text variant="caption" className="text-[11px] text-disabled">
            {hint}
          </Text>
        )}
        <Input
          type="number"
          inputMode={
            field === "reps" || field === "rpe" || field === "rir"
              ? "numeric"
              : "decimal"
          }
          min={0}
          max={field === "rpe" ? 10 : field === "rir" ? 5 : undefined}
          step={
            field === "weight" || field === "speed" || field === "distanceKm"
              ? 0.5
              : 1
          }
          value={displaySetFieldValue(field, set, preferences) || ""}
          onChange={(e) => {
            const raw =
              field === "reps" ||
              field === "durationMin" ||
              field === "rpe" ||
              field === "rir"
                ? parseInt(e.target.value) || 0
                : parseFloat(e.target.value) || 0;
            onUpdateSet(
              setIndex,
              field,
              parseSetFieldValue(field, raw, preferences),
            );
          }}
          placeholder={field === "rpe" || field === "rir" ? "—" : "0"}
          className="py-3 sm:py-2.5"
          aria-label={getFieldLabel(field, loggingType, preferences)}
        />
      </label>
    );
  }

  return (
    <div className="space-y-3">
      {lastSets && lastSets.length > 0 && (
        <Card padding="sm" className="border-border-muted bg-surface-subtle/50">
          <Text variant="caption" className="mb-2 block uppercase tracking-wide">
            Last session
          </Text>
          <div className="flex flex-wrap gap-1.5">
            {lastSets.map((set, i) => (
              <span
                key={i}
                className="rounded-md border border-border bg-bg px-2 py-1 text-[11px] text-subtle"
              >
                {formatSetSummary(loggingType, set, preferences)}
              </span>
            ))}
          </div>
        </Card>
      )}

      {loggingType === "cardio" && onApplyPreset && (
        <div className="flex flex-wrap gap-2">
          {CARDIO_INTERVAL_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="pill"
              size="sm"
              onClick={() => {
                const targetIndex = sets.findIndex(
                  (s) => s.durationMin === 0 && s.distanceKm === 0,
                );
                onApplyPreset(targetIndex >= 0 ? targetIndex : sets.length - 1, {
                  ...cloneSet(sets[targetIndex >= 0 ? targetIndex : sets.length - 1]),
                  ...preset,
                });
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}

      {sets.map((set, si) => {
        const isPr = prSetIndices.includes(si);
        return (
          <Card
            key={si}
            padding="sm"
            className="border-border sm:border-0 sm:bg-transparent sm:p-0"
          >
            <div className="mb-2 flex items-center justify-between sm:hidden">
              <div className="flex items-center gap-2">
                <Text variant="inverse" className="text-sm font-medium">
                  Set {si + 1}
                </Text>
                {isPr && (
                  <span className="rounded-lg bg-accent-muted px-2 py-0.5 text-[10px] font-semibold text-accent-text">
                    PR
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {onApplyLastSet && lastSets?.[Math.min(si, lastSets.length - 1)] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent-text"
                    onClick={() => onApplyLastSet(si)}
                  >
                    Repeat
                  </Button>
                )}
                {canRemoveSet && (
                  <Button
                    variant="ghost"
                    className="px-2 text-lg text-disabled hover:text-danger"
                    onClick={() => onRemoveSet(si)}
                    aria-label={`Remove set ${si + 1}`}
                    title="Remove this set"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
            <div
              className={`grid gap-3 sm:items-center sm:gap-2 ${
                fields.length <= 2
                  ? "grid-cols-2 sm:grid-cols-[2.5rem_1fr_1fr_2.5rem]"
                  : fields.length <= 4
                    ? "grid-cols-2 sm:grid-cols-[2.5rem_repeat(3,1fr)_2.5rem]"
                    : "grid-cols-2 sm:grid-cols-[2.5rem_repeat(4,1fr)_2.5rem]"
              }`}
            >
              <span className="hidden items-center gap-2 text-sm font-medium text-muted sm:flex">
                {si + 1}
                {isPr && (
                  <span className="rounded-lg bg-accent-muted px-1.5 py-0.5 text-[10px] text-accent-text">
                    PR
                  </span>
                )}
              </span>
              {fields.map((field) => renderFieldInput(field, set, si))}
              <div className="hidden gap-1 sm:flex">
                {onApplyLastSet && lastSets?.[Math.min(si, lastSets.length - 1)] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent-text"
                    onClick={() => onApplyLastSet(si)}
                  >
                    ↺
                  </Button>
                )}
                {canRemoveSet && (
                  <Button
                    variant="ghost"
                    className="text-disabled hover:text-danger"
                    onClick={() => onRemoveSet(si)}
                    aria-label={`Remove set ${si + 1}`}
                    title="Remove this set"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
            {showEffortFields && (
              <div className="mt-3 rounded-lg border border-border-muted bg-surface-subtle/40">
                <button
                  type="button"
                  onClick={() =>
                    setEffortOpen((prev) => ({
                      ...prev,
                      [si]: !isEffortOpen(si, set),
                    }))
                  }
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-faint"
                  aria-expanded={isEffortOpen(si, set)}
                >
                  <span>Effort tracking (optional)</span>
                  <span aria-hidden>{isEffortOpen(si, set) ? "−" : "+"}</span>
                </button>
                {isEffortOpen(si, set) && (
                  <div className="grid gap-3 border-t border-border-muted p-3 sm:grid-cols-2">
                    {EFFORT_FIELDS.map((field) =>
                      renderFieldInput(field, set, si, {
                        showDesktopLabel: true,
                      }),
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}

      <Button variant="ghost" className="text-accent-text" onClick={onAddSet}>
        + Add set
      </Button>
    </div>
  );
}
