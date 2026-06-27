export type Movement = "push" | "pull" | "legs" | "cardio" | "core" | "fullbody";

export type CycleDays = 3 | 4 | 5 | 6 | 7;

export type LoggingType = "weighted" | "bodyweight" | "assisted" | "cardio";

export type SessionSource = "quick" | "program" | "workout";

export type WeightUnit = "kg" | "lb";

export type SpeedUnit = "kmh" | "mph";

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

export interface Program {
  id: string;
  name: string;
  days: RoutineDay[];
  cycleDays: CycleDays;
  createdAt: string;
}

export interface SavedWorkout {
  id: string;
  name: string;
  exerciseIds: string[];
  createdAt: string;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  durationMin: number;
  incline: number;
  speed: number;
  distanceKm: number;
  rpe: number;
  rir: number;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  source: SessionSource;
  title: string;
  exercises: ExerciseLog[];
  completedAt: string;
  programId?: string;
  programName?: string;
  dayId?: string;
  dayName?: string;
  workoutId?: string;
  workoutName?: string;
}

export interface UserPreferences {
  weightUnit: WeightUnit;
  speedUnit: SpeedUnit;
}

export interface SessionDraft {
  exerciseIds: string[];
  logs: ExerciseLog[];
  source: SessionSource;
  title: string;
  activeExercise: number;
  programId?: string;
  programName?: string;
  dayId?: string;
  dayName?: string;
  workoutId?: string;
  workoutName?: string;
  updatedAt: string;
}

export const MOVEMENT_LABELS: Record<Movement, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  cardio: "Cardio",
  core: "Core",
  fullbody: "Full body",
};

export const CYCLE_OPTIONS: CycleDays[] = [3, 4, 5, 6, 7];

export const LOGGING_LABELS: Record<LoggingType, string> = {
  weighted: "Weight & reps",
  bodyweight: "Reps only",
  assisted: "Reps & assist",
  cardio: "Duration & settings",
};

export const CARDIO_INTERVAL_PRESETS = [
  { label: "10 min", durationMin: 10, incline: 0, speed: 0, distanceKm: 0 },
  { label: "20 min", durationMin: 20, incline: 0, speed: 0, distanceKm: 0 },
  { label: "30 min", durationMin: 30, incline: 0, speed: 0, distanceKm: 0 },
  { label: "5K pace", durationMin: 25, incline: 1, speed: 10, distanceKm: 5 },
  { label: "HIIT 15", durationMin: 15, incline: 5, speed: 12, distanceKm: 0 },
] as const;
