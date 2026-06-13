export type Movement = "push" | "pull" | "legs" | "cardio" | "core";

export type CycleDays = 3 | 5 | 6;

export interface Exercise {
  id: string;
  name: string;
  movement: Movement;
  muscles: string[];
}

export interface RoutineDay {
  id: string;
  name: string;
  exerciseIds: string[];
}

export interface Routine {
  id: string;
  name: string;
  days: RoutineDay[];
  cycleDays: CycleDays;
  createdAt: string;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  dayId: string;
  dayName: string;
  exercises: ExerciseLog[];
  completedAt: string;
}

export const MOVEMENT_LABELS: Record<Movement, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  cardio: "Cardio",
  core: "Core",
};

export const CYCLE_OPTIONS: CycleDays[] = [3, 5, 6];
