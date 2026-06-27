import { getExerciseById } from "./exercises";
import { getLoggingType, isSetLogged } from "./logging-profiles";
import { META_MUSCLE_GROUPS } from "./muscles";
import type {
  LoggingType,
  WorkoutSession,
  WorkoutSet,
} from "./types";

export interface ExerciseHistoryEntry {
  sessionId: string;
  completedAt: string;
  sets: WorkoutSet[];
}

export interface PersonalRecord {
  exerciseId: string;
  type: LoggingType;
  metric: string;
  value: number;
  set: WorkoutSet;
  sessionId: string;
  completedAt: string;
}

export interface WeeklyVolumePoint {
  weekStart: string;
  label: string;
  totalVolume: number;
  sessionCount: number;
}

export interface MuscleHeatmapCell {
  muscle: string;
  dayIndex: number;
  dayLabel: string;
  hit: boolean;
  sessionCount: number;
}

export interface MuscleHeatmapData {
  days: { index: number; label: string; date: string }[];
  muscles: string[];
  cells: MuscleHeatmapCell[];
}

function setVolume(type: LoggingType, set: WorkoutSet): number {
  switch (type) {
    case "weighted":
    case "assisted":
      return set.reps * set.weight;
    case "bodyweight":
      return set.reps;
    case "cardio":
      return set.durationMin + set.distanceKm * 10 + set.speed;
  }
}

function compareSets(
  type: LoggingType,
  a: WorkoutSet,
  b: WorkoutSet,
): number {
  switch (type) {
    case "weighted":
      if (a.weight !== b.weight) return a.weight - b.weight;
      return a.reps - b.reps;
    case "assisted":
      if (a.reps !== b.reps) return a.reps - b.reps;
      return b.weight - a.weight;
    case "bodyweight":
      return a.reps - b.reps;
    case "cardio":
      if (a.durationMin !== b.durationMin) return a.durationMin - b.durationMin;
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      return a.speed - b.speed;
  }
}

export function getExerciseHistory(
  exerciseId: string,
  sessions: WorkoutSession[],
): ExerciseHistoryEntry[] {
  return sessions
    .flatMap((session) => {
      const log = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (!log || log.sets.length === 0) return [];
      return [
        {
          sessionId: session.id,
          completedAt: session.completedAt,
          sets: log.sets,
        },
      ];
    })
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
}

export function getLastPerformance(
  exerciseId: string,
  sessions: WorkoutSession[],
): WorkoutSet[] | null {
  const history = getExerciseHistory(exerciseId, sessions);
  return history[0]?.sets ?? null;
}

export function getBestSet(
  exerciseId: string,
  sessions: WorkoutSession[],
  beforeDate?: string,
): WorkoutSet | null {
  const exercise = getExerciseById(exerciseId);
  const type = exercise ? getLoggingType(exercise) : "weighted";
  let best: WorkoutSet | null = null;

  for (const session of sessions) {
    if (beforeDate && session.completedAt >= beforeDate) continue;
    const log = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!log) continue;
    for (const set of log.sets) {
      if (!isSetLogged(type, set)) continue;
      if (!best || compareSets(type, set, best) > 0) best = set;
    }
  }

  return best;
}

export function isSetPersonalRecord(
  exerciseId: string,
  set: WorkoutSet,
  sessions: WorkoutSession[],
  beforeDate?: string,
): boolean {
  const exercise = getExerciseById(exerciseId);
  const type = exercise ? getLoggingType(exercise) : "weighted";
  if (!isSetLogged(type, set)) return false;
  const best = getBestSet(exerciseId, sessions, beforeDate);
  if (!best) return true;
  return compareSets(type, set, best) > 0;
}

export function getPersonalRecords(
  sessions: WorkoutSession[],
): PersonalRecord[] {
  const records = new Map<string, PersonalRecord>();

  for (const session of [...sessions].reverse()) {
    for (const log of session.exercises) {
      const exercise = getExerciseById(log.exerciseId);
      const type = exercise ? getLoggingType(exercise) : "weighted";

      for (const set of log.sets) {
        if (!isSetLogged(type, set)) continue;
        const key = log.exerciseId;
        const existing = records.get(key);
        if (!existing || compareSets(type, set, existing.set) > 0) {
          records.set(key, {
            exerciseId: log.exerciseId,
            type,
            metric: type === "cardio" ? "duration" : "performance",
            value: setVolume(type, set),
            set,
            sessionId: session.id,
            completedAt: session.completedAt,
          });
        }
      }
    }
  }

  return [...records.values()].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

export function getWeeklyVolume(
  sessions: WorkoutSession[],
  weeks = 8,
): WeeklyVolumePoint[] {
  const now = new Date();
  const points: WeeklyVolumePoint[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - w * 7 - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    let totalVolume = 0;
    let sessionCount = 0;

    for (const session of sessions) {
      const t = new Date(session.completedAt).getTime();
      if (t < weekStart.getTime() || t >= weekEnd.getTime()) continue;
      sessionCount++;
      for (const log of session.exercises) {
        const exercise = getExerciseById(log.exerciseId);
        const type = exercise ? getLoggingType(exercise) : "weighted";
        for (const set of log.sets) {
          if (isSetLogged(type, set)) totalVolume += setVolume(type, set);
        }
      }
    }

    points.push({
      weekStart: weekStart.toISOString(),
      label: weekStart.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      totalVolume: Math.round(totalVolume),
      sessionCount,
    });
  }

  return points;
}

export function getWeeklyMuscleHeatmap(
  sessions: WorkoutSession[],
): MuscleHeatmapData {
  const muscleSet = new Set<string>();
  const days: MuscleHeatmapData["days"] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({
      index: 6 - i,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      date: d.toISOString().slice(0, 10),
    });
  }

  for (const session of sessions) {
    for (const log of session.exercises) {
      const ex = getExerciseById(log.exerciseId);
      if (!ex) continue;
      ex.muscles
        .filter((m) => !META_MUSCLE_GROUPS.has(m))
        .forEach((m) => muscleSet.add(m));
    }
  }

  const muscles = [...muscleSet].sort((a, b) => a.localeCompare(b));
  const cells: MuscleHeatmapCell[] = [];

  for (const muscle of muscles) {
    for (const day of days) {
      const dayStart = new Date(day.date).getTime();
      const dayEnd = dayStart + 86400000;
      let sessionCount = 0;

      for (const session of sessions) {
        const t = new Date(session.completedAt).getTime();
        if (t < dayStart || t >= dayEnd) continue;
        const hit = session.exercises.some((log) => {
          const ex = getExerciseById(log.exerciseId);
          return ex?.muscles.includes(muscle);
        });
        if (hit) sessionCount++;
      }

      cells.push({
        muscle,
        dayIndex: day.index,
        dayLabel: day.label,
        hit: sessionCount > 0,
        sessionCount,
      });
    }
  }

  return { days, muscles: muscles.slice(0, 16), cells };
}

export function detectSessionPRs(
  session: WorkoutSession,
  priorSessions: WorkoutSession[],
): Map<string, number[]> {
  const prSets = new Map<string, number[]>();

  for (const log of session.exercises) {
    log.sets.forEach((set, index) => {
      if (isSetPersonalRecord(log.exerciseId, set, priorSessions, session.completedAt)) {
        const list = prSets.get(log.exerciseId) ?? [];
        list.push(index);
        prSets.set(log.exerciseId, list);
      }
    });
  }

  return prSets;
}
