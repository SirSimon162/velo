import type { Program, WorkoutSession } from "./types";
import { exercises, getExerciseById } from "./exercises";

export const ALL_MUSCLE_FILTER = "all" as const;

export const META_MUSCLE_GROUPS = new Set([
  "Cardiovascular",
  "Full Body",
  "Grip",
]);

export function getMuscleGroups(): string[] {
  const groups = new Set<string>();
  for (const ex of exercises) {
    for (const m of ex.muscles) groups.add(m);
  }
  return [...groups].sort((a, b) => a.localeCompare(b));
}

export function getTrainableMuscleGroups(): string[] {
  return getMuscleGroups().filter((m) => !META_MUSCLE_GROUPS.has(m));
}

const MUSCLE_CATEGORY_RULES: { label: string; match: (m: string) => boolean }[] =
  [
    {
      label: "Chest & back",
      match: (m) =>
        /chest|back|lat|trap|delt|shoulder|biceps|triceps|forearm|brachialis|arm/i.test(
          m,
        ) && !/hip|quad|ham|glute|calve|abs|oblique|core|cardio|full body/i.test(m),
    },
    {
      label: "Legs",
      match: (m) =>
        /quad|ham|glute|calve|hip|adduct|abduct|tibialis|shin|leg/i.test(m),
    },
    {
      label: "Core",
      match: (m) => /abs|oblique|core|flexor|spinal|erector/i.test(m),
    },
  ];

export function getMuscleGroupsByCategory(): { label: string; muscles: string[] }[] {
  const trainable = getTrainableMuscleGroups();
  const assigned = new Set<string>();
  const categories: { label: string; muscles: string[] }[] = [];

  for (const rule of MUSCLE_CATEGORY_RULES) {
    const muscles = trainable.filter((m) => rule.match(m) && !assigned.has(m));
    muscles.forEach((m) => assigned.add(m));
    if (muscles.length > 0) {
      categories.push({ label: rule.label, muscles });
    }
  }

  const other = trainable.filter((m) => !assigned.has(m));
  if (other.length > 0) {
    categories.push({ label: "Other", muscles: other });
  }

  return categories;
}

export function getMusclesForExercises(exerciseIds: string[]): string[] {
  const muscles = new Set<string>();
  for (const id of exerciseIds) {
    const ex = getExerciseById(id);
    if (ex) ex.muscles.forEach((m) => muscles.add(m));
  }
  return [...muscles]
    .filter((m) => !META_MUSCLE_GROUPS.has(m))
    .sort((a, b) => a.localeCompare(b));
}

export interface MuscleBalance {
  worked: string[];
  neglected: string[];
}

export function analyzeMuscleBalance(exerciseIds: string[]): MuscleBalance {
  const worked = getMusclesForExercises(exerciseIds);
  const workedSet = new Set(worked);
  const neglected = getTrainableMuscleGroups().filter((m) => !workedSet.has(m));
  return { worked, neglected };
}

export function analyzeProgramBalance(program: Program): MuscleBalance {
  const allIds = program.days.flatMap((d) => d.exerciseIds);
  return analyzeMuscleBalance(allIds);
}

export interface MuscleAnalysis {
  trained: string[];
  lagging: string[];
  recentlyHit: string[];
}

const RECENT_DAYS = 14;

export function analyzeMuscleCoverage(
  exerciseIds: string[],
  pastWorkouts: WorkoutSession[],
): MuscleAnalysis {
  const trained = getMusclesForExercises(exerciseIds);
  const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;

  const recentlyHit = new Set<string>();
  for (const session of pastWorkouts) {
    if (new Date(session.completedAt).getTime() < cutoff) continue;
    for (const log of session.exercises) {
      const ex = getExerciseById(log.exerciseId);
      if (ex) {
        ex.muscles
          .filter((m) => !META_MUSCLE_GROUPS.has(m))
          .forEach((m) => recentlyHit.add(m));
      }
    }
  }

  const lagging = trained.filter((m) => !recentlyHit.has(m));

  return {
    trained,
    lagging,
    recentlyHit: [...recentlyHit].sort(),
  };
}
