import { getExerciseById } from "./exercises";
import { getLoggingType, isSetLogged } from "./logging-profiles";
import type { ExerciseLog, WorkoutSession } from "./types";

export function filterLoggedExercises(logs: ExerciseLog[]): ExerciseLog[] {
  return logs
    .map((log) => {
      const ex = getExerciseById(log.exerciseId);
      const type = ex ? getLoggingType(ex) : "weighted";
      return {
        ...log,
        sets: log.sets.filter((s) => isSetLogged(type, s)),
      };
    })
    .filter((log) => log.sets.length > 0);
}

export function buildSessionTitle(options: {
  source: WorkoutSession["source"];
  programName?: string;
  dayName?: string;
}): string {
  if (options.source === "program" && options.programName && options.dayName) {
    return `${options.programName} · ${options.dayName}`;
  }
  return "Quick Session";
}
