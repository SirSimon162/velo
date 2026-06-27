"use client";

import { useEffect, useState } from "react";
import { getPrograms, newId } from "@/lib/storage";
import { useVeloStorage } from "@/lib/velo-storage";
import { BottomSheet } from "@/components/ui/molecules/BottomSheet";
import { Button, Input, Text } from "@/components/ui";
import { BackButton } from "@/components/ui/molecules/BackButton";

interface SelectionActionSheetProps {
  open: boolean;
  exerciseIds: string[];
  onClose: () => void;
  onQuickSession: () => void;
  onAddToProgram: () => void;
  onSaveAsWorkout: () => void;
}

export function SelectionActionSheet({
  open,
  exerciseIds,
  onClose,
  onQuickSession,
  onAddToProgram,
  onSaveAsWorkout,
}: SelectionActionSheetProps) {
  const { programs, refresh, upsertProgram, upsertSavedWorkout } = useVeloStorage();
  const [mode, setMode] = useState<"main" | "program" | "workout">("main");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [workoutName, setWorkoutName] = useState("My Workout");

  useEffect(() => {
    if (!open) return;
    refresh();
    setMode("main");
    setSelectedProgramId(getPrograms()[0]?.id ?? null);
    setSelectedDayIndex(0);
    setWorkoutName("My Workout");
  }, [open, refresh]);

  function handleClose() {
    setMode("main");
    onClose();
  }

  function addToProgramDay() {
    const program = programs.find((p) => p.id === selectedProgramId);
    if (!program) return;
    upsertProgram({
      ...program,
      days: program.days.map((d, i) =>
        i === selectedDayIndex
          ? {
              ...d,
              exerciseIds: [...new Set([...d.exerciseIds, ...exerciseIds])],
            }
          : d,
      ),
    });
    handleClose();
    onAddToProgram();
  }

  function createWorkout() {
    upsertSavedWorkout({
      id: newId(),
      name: workoutName.trim() || "My Workout",
      exerciseIds: [...exerciseIds],
      createdAt: new Date().toISOString(),
    });
    handleClose();
    onSaveAsWorkout();
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={
        mode === "main"
          ? `${exerciseIds.length} selected`
          : mode === "program"
            ? "Add to program"
            : "Save workout"
      }
    >
      {mode === "main" && (
        <div className="space-y-2 pb-2">
          <Text variant="faint" className="text-sm">
            What would you like to do with these exercises?
          </Text>
          <Button fullWidth shape="square" onClick={onQuickSession}>
            Quick Session
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setMode("program")}>
            Add to existing program
          </Button>
          <Button variant="secondary" fullWidth onClick={onAddToProgram}>
            Open in program builder
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setMode("workout")}>
            Save as workout
          </Button>
          <Button variant="secondary" fullWidth onClick={onSaveAsWorkout}>
            Open in workout builder
          </Button>
          <Button variant="ghost" fullWidth onClick={handleClose}>
            Cancel
          </Button>
        </div>
      )}

      {mode === "program" && (
        <div className="space-y-3 pb-2">
          {programs.length === 0 ? (
            <>
              <Text variant="faint">
                No programs yet. Use the program builder instead.
              </Text>
              <Button fullWidth onClick={onAddToProgram}>
                Open program builder →
              </Button>
              <BackButton onClick={() => setMode("main")} />
            </>
          ) : (
            <>
              <div className="space-y-2">
                {programs.map((p) => (
                  <Button
                    key={p.id}
                    variant={selectedProgramId === p.id ? "pillActive" : "pill"}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedProgramId(p.id);
                      setSelectedDayIndex(0);
                    }}
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
              {selectedProgramId && (
                <div className="flex flex-wrap gap-2">
                  {programs
                    .find((p) => p.id === selectedProgramId)!
                    .days.map((d, i) => (
                      <Button
                        key={d.id}
                        variant={selectedDayIndex === i ? "tabActive" : "pill"}
                        onClick={() => setSelectedDayIndex(i)}
                      >
                        {d.name}
                      </Button>
                    ))}
                </div>
              )}
              <Button fullWidth disabled={!selectedProgramId} onClick={addToProgramDay}>
                Add to day
              </Button>
              <BackButton onClick={() => setMode("main")} />
            </>
          )}
        </div>
      )}

      {mode === "workout" && (
        <div className="space-y-3 pb-2">
          <Input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Workout name"
          />
          <Button fullWidth onClick={createWorkout}>
            Save workout
          </Button>
          <BackButton onClick={() => setMode("main")} />
        </div>
      )}
    </BottomSheet>
  );
}
