"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExerciseBrowser } from "@/components/dashboard/ExerciseBrowser";
import { ProgramBuilder } from "@/components/dashboard/ProgramBuilder";
import { TrainHub } from "@/components/dashboard/TrainHub";
import { WorkoutBuilder } from "@/components/dashboard/WorkoutBuilder";
import { WorkoutHistory } from "@/components/dashboard/WorkoutHistory";
import { SessionDraftBanner } from "@/components/dashboard/shared/SessionDraftBanner";
import { UserSettingsPanel } from "@/components/dashboard/shared/UserSettingsPanel";
import { PostSessionPrompt } from "@/components/dashboard/session/PostSessionPrompt";
import { QuickSessionPrep } from "@/components/dashboard/session/QuickSessionPrep";
import { SelectionActionSheet } from "@/components/dashboard/session/SelectionActionSheet";
import { SessionRunner } from "@/components/dashboard/session/SessionRunner";
import { cn } from "@/lib/cn";
import { appShellClass } from "@/lib/app-shell";
import { buildSessionTitle } from "@/lib/session-utils";
import type { Program, SavedWorkout, WorkoutSession } from "@/lib/types";
import { useVeloStorage } from "@/lib/velo-storage";
import { Heading, TabButton, Text } from "@/components/ui";
import {
  IconBookmark,
  IconClock,
  IconDumbbell,
  IconLayers,
  IconPlay,
} from "@/components/ui/icons";

type Tab = "exercises" | "programs" | "workouts" | "train" | "history";

type View =
  | { kind: "tabs" }
  | { kind: "quick-prep"; exerciseIds: string[] }
  | {
      kind: "session";
      exerciseIds: string[];
      source: WorkoutSession["source"];
      title: string;
      programId?: string;
      programName?: string;
      dayId?: string;
      dayName?: string;
      workoutId?: string;
      workoutName?: string;
      initialLogs?: WorkoutSession["exercises"];
      initialActiveExercise?: number;
    }
  | { kind: "post-session"; session: WorkoutSession };

const tabs: {
  id: Tab;
  label: string;
  shortLabel: string;
  icon: typeof IconDumbbell;
}[] = [
  { id: "exercises", label: "Exercises", shortLabel: "Moves", icon: IconDumbbell },
  { id: "programs", label: "Programs", shortLabel: "Programs", icon: IconLayers },
  { id: "workouts", label: "Workouts", shortLabel: "Workouts", icon: IconBookmark },
  { id: "train", label: "Train", shortLabel: "Train", icon: IconPlay },
  { id: "history", label: "History", shortLabel: "Log", icon: IconClock },
];

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const dashboardShell = appShellClass;

export function DashboardApp() {
  const { sessionDraft, refresh } = useVeloStorage();
  const [tab, setTab] = useState<Tab>("exercises");
  const [view, setView] = useState<View>({ kind: "tabs" });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [programPrefill, setProgramPrefill] = useState<string[] | null>(null);
  const [workoutPrefill, setWorkoutPrefill] = useState<string[] | null>(null);

  const toggleExercise = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [tab, view.kind, refresh]);

  function resetFlow() {
    setView({ kind: "tabs" });
    setSelectedIds([]);
    setActionSheetOpen(false);
  }

  function startQuickPrep(ids: string[]) {
    setSelectedIds(ids);
    setActionSheetOpen(false);
    setView({ kind: "quick-prep", exerciseIds: ids });
  }

  function startSession(config: Extract<View, { kind: "session" }>) {
    setView(config);
  }

  function resumeDraft() {
    if (!sessionDraft) return;
    setView({
      kind: "session",
      exerciseIds: sessionDraft.exerciseIds,
      source: sessionDraft.source,
      title: sessionDraft.title,
      programId: sessionDraft.programId,
      programName: sessionDraft.programName,
      dayId: sessionDraft.dayId,
      dayName: sessionDraft.dayName,
      workoutId: sessionDraft.workoutId,
      workoutName: sessionDraft.workoutName,
      initialLogs: sessionDraft.logs,
      initialActiveExercise: sessionDraft.activeExercise,
    });
  }

  function handleStartProgramDay(program: Program, dayIndex: number) {
    const day = program.days[dayIndex];
    startSession({
      kind: "session",
      exerciseIds: day.exerciseIds,
      source: "program",
      title: buildSessionTitle({
        source: "program",
        programName: program.name,
        dayName: day.name,
      }),
      programId: program.id,
      programName: program.name,
      dayId: day.id,
      dayName: day.name,
    });
  }

  function handleStartWorkout(workout: SavedWorkout) {
    startSession({
      kind: "session",
      exerciseIds: workout.exerciseIds,
      source: "workout",
      title: workout.name,
      workoutId: workout.id,
      workoutName: workout.name,
    });
  }

  const showTabs = view.kind === "tabs";
  const inTrainingFlow =
    view.kind === "session" ||
    view.kind === "quick-prep" ||
    view.kind === "post-session";

  return (
    <div className="relative min-h-dvh bg-bg">
      <div className="pointer-events-none fixed inset-0 hero-grid opacity-30" aria-hidden />
      <div className="pointer-events-none fixed inset-0 hero-spotlight opacity-50" aria-hidden />

      <header className="sticky top-0 z-20 border-b border-border-muted bg-bg/80 pt-safe backdrop-blur-xl">
        <div
          className={cn(
            dashboardShell,
            "flex items-center justify-between py-3 sm:py-4",
          )}
        >
          <Link href="/" className="group min-w-0">
            <Heading
              as="h1"
              variant="brand"
              className="truncate transition-opacity group-hover:opacity-80 sm:text-xl"
            >
              Velo
            </Heading>
            <Text variant="caption" className="truncate">
              Gym workout tracker
            </Text>
          </Link>
          <UserSettingsPanel />
        </div>

        {showTabs && (
          <nav
            className={cn(
              dashboardShell,
              "scrollbar-none hidden gap-1 overflow-x-hidden pb-3 md:flex",
            )}
          >
            {tabs.map((t) => (
              <TabButton
                key={t.id}
                active={tab === t.id}
                label={t.label}
                shortLabel={t.shortLabel}
                onClick={() => setTab(t.id)}
                layout="top"
              />
            ))}
          </nav>
        )}
      </header>

      <main
        className={cn(
          dashboardShell,
          "relative py-5 sm:py-8",
          showTabs ? "pb-24 md:pb-8" : inTrainingFlow ? "pb-0" : "pb-8",
        )}
      >
        {showTabs && view.kind === "tabs" && (
          <SessionDraftBanner onResume={resumeDraft} />
        )}

        <AnimatePresence mode="wait">
          {view.kind === "quick-prep" && (
            <motion.div
              key="quick-prep"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <QuickSessionPrep
                exerciseIds={view.exerciseIds}
                onBack={resetFlow}
                onReorder={(ids) => {
                  setSelectedIds(ids);
                  setView({ kind: "quick-prep", exerciseIds: ids });
                }}
                onRemoveExercise={(id) => {
                  const next = view.exerciseIds.filter((x) => x !== id);
                  setSelectedIds(next);
                  if (next.length === 0) resetFlow();
                  else setView({ kind: "quick-prep", exerciseIds: next });
                }}
                onAddMore={() => {
                  setSelectedIds(view.exerciseIds);
                  setView({ kind: "tabs" });
                  setTab("exercises");
                }}
                onStart={() =>
                  startSession({
                    kind: "session",
                    exerciseIds: view.exerciseIds,
                    source: "quick",
                    title: "Quick Session",
                  })
                }
              />
            </motion.div>
          )}

          {view.kind === "session" && (
            <motion.div key="session" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <SessionRunner
                exerciseIds={view.exerciseIds}
                source={view.source}
                title={view.title}
                programId={view.programId}
                programName={view.programName}
                dayId={view.dayId}
                dayName={view.dayName}
                workoutId={view.workoutId}
                workoutName={view.workoutName}
                initialLogs={view.initialLogs}
                initialActiveExercise={view.initialActiveExercise}
                onCancel={resetFlow}
                onComplete={(session) =>
                  setView({ kind: "post-session", session })
                }
              />
            </motion.div>
          )}

          {view.kind === "post-session" && (
            <motion.div key="post-session" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <PostSessionPrompt
                session={view.session}
                onDone={() => {
                  resetFlow();
                  setTab("history");
                }}
              />
            </motion.div>
          )}

          {view.kind === "tabs" && (
            <motion.div
              key={tab}
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {tab === "exercises" && (
                <ExerciseBrowser
                  selectedIds={selectedIds}
                  onToggle={toggleExercise}
                  onClear={() => setSelectedIds([])}
                  onContinue={() => setActionSheetOpen(true)}
                />
              )}
              {tab === "programs" && (
                <ProgramBuilder
                  prefillExerciseIds={programPrefill}
                  onPrefillConsumed={() => setProgramPrefill(null)}
                />
              )}
              {tab === "workouts" && (
                <WorkoutBuilder
                  prefillExerciseIds={workoutPrefill}
                  onPrefillConsumed={() => setWorkoutPrefill(null)}
                />
              )}
              {tab === "train" && (
                <TrainHub
                  onStartProgramDay={handleStartProgramDay}
                  onStartWorkout={handleStartWorkout}
                  onGoToExercises={() => setTab("exercises")}
                  onCreateProgram={() => {
                    setTab("programs");
                  }}
                />
              )}
              {tab === "history" && <WorkoutHistory />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {showTabs && (
        <nav
          className="pointer-events-none fixed inset-x-0 bottom-0 z-20 md:hidden"
          aria-label="Dashboard"
        >
          <div className="pointer-events-auto mx-auto max-w-2xl px-4 pb-safe pt-2">
            <div className="bottom-nav-bar flex rounded-lg border border-border-muted bg-bg-elevated/95 p-1 backdrop-blur-xl">
              {tabs.map((t) => (
                <TabButton
                  key={t.id}
                  active={tab === t.id}
                  label={t.label}
                  shortLabel={t.shortLabel}
                  icon={t.icon}
                  onClick={() => setTab(t.id)}
                  layout="bottom"
                />
              ))}
            </div>
          </div>
        </nav>
      )}

      <SelectionActionSheet
        open={actionSheetOpen}
        exerciseIds={selectedIds}
        onClose={() => setActionSheetOpen(false)}
        onQuickSession={() => startQuickPrep(selectedIds)}
        onAddToProgram={() => {
          setProgramPrefill([...selectedIds]);
          setSelectedIds([]);
          setActionSheetOpen(false);
          setTab("programs");
        }}
        onSaveAsWorkout={() => {
          setWorkoutPrefill([...selectedIds]);
          setSelectedIds([]);
          setActionSheetOpen(false);
          setTab("workouts");
        }}
      />
    </div>
  );
}
