"use client";

import { useEffect, useState } from "react";
import { newId } from "@/lib/storage";
import type { Program, RoutineDay, WorkoutSession } from "@/lib/types";
import { useVeloStorage } from "@/lib/velo-storage";
import {
  Button,
  Card,
  EmptyState,
  Heading,
  Input,
  PageHeader,
  Text,
} from "@/components/ui";
import { BackButton } from "@/components/ui/molecules/BackButton";

interface PostSessionPromptProps {
  session: WorkoutSession;
  onDone: () => void;
}

function emptyDay(index: number): RoutineDay {
  return { id: newId(), name: `Day ${index + 1}`, exerciseIds: [] };
}

export function PostSessionPrompt({ session, onDone }: PostSessionPromptProps) {
  const { programs, upsertProgram, upsertSavedWorkout } = useVeloStorage();
  const [mode, setMode] = useState<
    "choose" | "program" | "new-program" | "workout"
  >("choose");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [newProgramName, setNewProgramName] = useState("My Program");
  const [newWorkoutName, setNewWorkoutName] = useState("My Workout");
  const [saved, setSaved] = useState(false);

  const exerciseIds = session.exercises.map((e) => e.exerciseId);

  useEffect(() => {
    setSelectedProgramId(programs[0]?.id ?? null);
  }, [programs]);

  function saveToProgramDay() {
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
    setSaved(true);
    setMode("choose");
  }

  function createProgram() {
    const program: Program = {
      id: newId(),
      name: newProgramName.trim() || "My Program",
      days: [{ ...emptyDay(0), exerciseIds: [...exerciseIds] }],
      cycleDays: 3,
      createdAt: new Date().toISOString(),
    };
    upsertProgram(program);
    setSaved(true);
    setMode("choose");
  }

  function saveAsWorkout() {
    upsertSavedWorkout({
      id: newId(),
      name: newWorkoutName.trim() || "My Workout",
      exerciseIds: [...exerciseIds],
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
    setMode("choose");
  }

  if (mode === "program") {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => setMode("choose")} />
        <Heading variant="h3">Add to program day</Heading>
        {programs.length === 0 ? (
          <EmptyState
            message="No programs yet."
            action={
              <Button
                variant="ghost"
                className="text-accent-text"
                onClick={() => setMode("new-program")}
              >
                Create one from this session →
              </Button>
            }
          />
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
            <Button fullWidth disabled={!selectedProgramId} onClick={saveToProgramDay}>
              Add exercises to day
            </Button>
          </>
        )}
      </div>
    );
  }

  if (mode === "new-program") {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => setMode("choose")} />
        <Heading variant="h3">Create program from session</Heading>
        <Input
          value={newProgramName}
          onChange={(e) => setNewProgramName(e.target.value)}
          placeholder="Program name"
        />
        <Text variant="faint" className="text-xs">
          Exercises will be saved as Day 1. You can add more days later.
        </Text>
        <Button fullWidth onClick={createProgram}>
          Create program
        </Button>
      </div>
    );
  }

  if (mode === "workout") {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => setMode("choose")} />
        <Heading variant="h3">Save as workout</Heading>
        <Input
          value={newWorkoutName}
          onChange={(e) => setNewWorkoutName(e.target.value)}
          placeholder="Workout name"
        />
        <Button fullWidth onClick={saveAsWorkout}>
          Save workout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Session complete"
        description="Logged to history. Save this lineup for next time?"
      />

      {saved && (
        <Card padding="sm" className="border-accent-border bg-accent-subtle/30">
          <Text variant="accent">Saved successfully.</Text>
        </Card>
      )}

      <div className="grid gap-2">
        <Button variant="secondary" fullWidth onClick={() => setMode("program")}>
          Add to existing program
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setMode("new-program")}>
          Create new program
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setMode("workout")}>
          Save as workout template
        </Button>
        <Button fullWidth shape="square" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
