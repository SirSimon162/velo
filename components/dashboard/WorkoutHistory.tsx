"use client";

import { useMemo, useState } from "react";
import {
  detectSessionPRs,
  getPersonalRecords,
  getWeeklyMuscleHeatmap,
  getWeeklyVolume,
} from "@/lib/analytics";
import { getExerciseById } from "@/lib/exercises";
import { formatSetSummary, getLoggingType } from "@/lib/logging-profiles";
import type { WorkoutSession } from "@/lib/types";
import { useVeloStorage } from "@/lib/velo-storage";
import { MuscleHeatmap } from "@/components/dashboard/shared/MuscleHeatmap";
import { VolumeChart } from "@/components/dashboard/shared/VolumeChart";
import {
  Badge,
  Button,
  Card,
  CollapsibleCard,
  EmptyState,
  Heading,
  PageHeader,
  Text,
} from "@/components/ui";

export function WorkoutHistory() {
  const { workouts, preferences, removeWorkout } = useVeloStorage();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [exerciseFilter, setExerciseFilter] = useState<string>("all");

  const weeklyVolume = useMemo(() => getWeeklyVolume(workouts), [workouts]);
  const heatmap = useMemo(() => getWeeklyMuscleHeatmap(workouts), [workouts]);
  const records = useMemo(() => getPersonalRecords(workouts), [workouts]);

  const maxVolume = Math.max(...weeklyVolume.map((w) => w.totalVolume), 1);
  const volumeBars = weeklyVolume.map((w) =>
    Math.max(8, (w.totalVolume / maxVolume) * 100),
  );

  const exerciseOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const w of workouts) {
      for (const log of w.exercises) ids.add(log.exerciseId);
    }
    return [...ids].sort();
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    if (exerciseFilter === "all") return workouts;
    return workouts.filter((w) =>
      w.exercises.some((e) => e.exerciseId === exerciseFilter),
    );
  }, [workouts, exerciseFilter]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function sessionStats(session: WorkoutSession) {
    let sets = 0;
    let reps = 0;
    let volume = 0;
    for (const log of session.exercises) {
      const ex = getExerciseById(log.exerciseId);
      const type = ex ? getLoggingType(ex) : "weighted";
      for (const set of log.sets) {
        if (set.reps > 0 || set.durationMin > 0 || set.distanceKm > 0) {
          sets++;
          reps += set.reps;
          volume +=
            type === "weighted" || type === "assisted"
              ? set.reps * set.weight
              : set.reps;
        }
      }
    }
    const prior = workouts.filter(
      (w) => new Date(w.completedAt).getTime() < new Date(session.completedAt).getTime(),
    );
    const prs = detectSessionPRs(session, prior);
    let prCount = 0;
    prs.forEach((indices) => {
      prCount += indices.length;
    });
    return { sets, reps, volume: Math.round(volume), prCount };
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="History"
        description="Sessions, progress, and muscle coverage"
      />

      {workouts.length === 0 ? (
        <EmptyState
          message="No sessions logged yet."
          action={
            <Text variant="faint" className="text-sm">
              Select exercises and start a Quick Session to begin tracking.
            </Text>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="sm" className="space-y-3">
              <Heading variant="h4">Weekly volume</Heading>
              <VolumeChart bars={volumeBars} />
              <div className="flex justify-between gap-1">
                {weeklyVolume.map((w) => (
                  <Text key={w.weekStart} variant="caption" className="text-[10px]">
                    {w.label}
                  </Text>
                ))}
              </div>
            </Card>
            <Card padding="sm" className="space-y-3">
              <Heading variant="h4">Recent PRs</Heading>
              {records.length === 0 ? (
                <Text variant="faint" className="text-sm">
                  Log more sessions to track personal records.
                </Text>
              ) : (
                <ul className="space-y-2">
                  {records.slice(0, 5).map((pr) => {
                    const ex = getExerciseById(pr.exerciseId);
                    return (
                      <li key={pr.exerciseId} className="text-sm">
                        <Text variant="inverse" className="font-medium">
                          {ex?.name ?? pr.exerciseId}
                        </Text>
                        <Text variant="caption">
                          {formatSetSummary(pr.type, pr.set, preferences)}
                        </Text>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          <MuscleHeatmap data={heatmap} />

          {exerciseOptions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={exerciseFilter === "all" ? "pillActive" : "pill"}
                size="sm"
                onClick={() => setExerciseFilter("all")}
              >
                All exercises
              </Button>
              {exerciseOptions.slice(0, 8).map((id) => {
                const ex = getExerciseById(id);
                return (
                  <Button
                    key={id}
                    variant={exerciseFilter === id ? "pillActive" : "pill"}
                    size="sm"
                    onClick={() => setExerciseFilter(id)}
                  >
                    {ex?.name ?? id}
                  </Button>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            {filteredWorkouts.map((w) => {
              const stats = sessionStats(w);
              const prior = workouts.filter(
                (x) =>
                  new Date(x.completedAt).getTime() <
                  new Date(w.completedAt).getTime(),
              );
              const sessionPrs = detectSessionPRs(w, prior);
              return (
                <CollapsibleCard
                  key={w.id}
                  open={expanded === w.id}
                  onToggle={() =>
                    setExpanded(expanded === w.id ? null : w.id)
                  }
                  header={
                    <div className="min-w-0">
                      <Heading
                        as="p"
                        variant="h4"
                        className="truncate text-[15px] sm:text-base"
                      >
                        {w.title}
                      </Heading>
                      <Text variant="caption" className="mt-0.5 truncate">
                        {formatDate(w.completedAt)} · {w.exercises.length}{" "}
                        exercises · {stats.sets} sets
                        {stats.prCount > 0 && ` · ${stats.prCount} PR${stats.prCount > 1 ? "s" : ""}`}
                      </Text>
                    </div>
                  }
                >
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    <Card padding="sm" variant="subtle">
                      <Text variant="caption">Sets</Text>
                      <Text variant="inverse" className="text-lg font-semibold">
                        {stats.sets}
                      </Text>
                    </Card>
                    <Card padding="sm" variant="subtle">
                      <Text variant="caption">Reps</Text>
                      <Text variant="inverse" className="text-lg font-semibold">
                        {stats.reps}
                      </Text>
                    </Card>
                    <Card padding="sm" variant="subtle">
                      <Text variant="caption">Volume</Text>
                      <Text variant="inverse" className="text-lg font-semibold">
                        {stats.volume}
                      </Text>
                    </Card>
                  </div>

                  {w.exercises.map((log) => {
                    const ex = getExerciseById(log.exerciseId);
                    const type = ex ? getLoggingType(ex) : "weighted";
                    const prIndices = sessionPrs.get(log.exerciseId) ?? [];
                    return (
                      <div key={log.exerciseId} className="min-w-0">
                        <Text
                          variant="inverse"
                          className="break-words text-sm font-medium"
                        >
                          {ex?.name ?? log.exerciseId}
                        </Text>
                        <div className="mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
                          {log.sets.map((s, i) => (
                            <Badge
                              key={i}
                              className={`rounded px-2 py-1 text-[11px] sm:text-xs ${
                                prIndices.includes(i)
                                  ? "border-accent-border bg-accent-muted text-accent-text"
                                  : ""
                              }`}
                            >
                              Set {i + 1}: {formatSetSummary(type, s, preferences)}
                              {prIndices.includes(i) && " · PR"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="danger" onClick={() => removeWorkout(w.id)}>
                    Delete session
                  </Button>
                </CollapsibleCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
