import type { Routine, WorkoutSession } from "./types";

const ROUTINES_KEY = "velo-routines";
const WORKOUTS_KEY = "velo-workouts";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getRoutines(): Routine[] {
  return read<Routine[]>(ROUTINES_KEY, []);
}

export function saveRoutine(routine: Routine): void {
  const routines = getRoutines();
  const index = routines.findIndex((r) => r.id === routine.id);
  if (index >= 0) {
    routines[index] = routine;
  } else {
    routines.push(routine);
  }
  write(ROUTINES_KEY, routines);
}

export function deleteRoutine(id: string): void {
  write(
    ROUTINES_KEY,
    getRoutines().filter((r) => r.id !== id),
  );
}

export function getWorkouts(): WorkoutSession[] {
  return read<WorkoutSession[]>(WORKOUTS_KEY, []);
}

export function saveWorkout(session: WorkoutSession): void {
  const workouts = getWorkouts();
  workouts.unshift(session);
  write(WORKOUTS_KEY, workouts);
}

export function deleteWorkout(id: string): void {
  write(
    WORKOUTS_KEY,
    getWorkouts().filter((w) => w.id !== id),
  );
}
