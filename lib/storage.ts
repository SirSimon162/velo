import { DEFAULT_PREFERENCES } from "./units";
import type {
  Program,
  SavedWorkout,
  SessionDraft,
  UserPreferences,
  WorkoutSession,
  WorkoutSet,
} from "./types";

const PROGRAMS_KEY = "velo-routines";
const WORKOUTS_KEY = "velo-workouts";
const SAVED_WORKOUTS_KEY = "velo-saved-workouts";
const PREFS_KEY = "velo-prefs";
const FAVORITES_KEY = "velo-favorites";
const RECENT_KEY = "velo-recent-exercises";
const DRAFT_KEY = "velo-session-draft";

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

function normalizeSet(raw: Partial<WorkoutSet> & Record<string, unknown>) {
  return {
    reps: Number(raw.reps) || 0,
    weight: Number(raw.weight) || 0,
    durationMin: Number(raw.durationMin) || 0,
    incline: Number(raw.incline) || 0,
    speed: Number(raw.speed) || 0,
    distanceKm: Number(raw.distanceKm) || 0,
    rpe: Number(raw.rpe) || 0,
    rir: Number(raw.rir) || 0,
  };
}

function normalizeSession(raw: Record<string, unknown>): WorkoutSession {
  const legacy = raw as unknown as WorkoutSession & {
    routineId?: string;
    routineName?: string;
  };

  const exercises = Array.isArray(legacy.exercises)
    ? legacy.exercises.map((log) => ({
        exerciseId: log.exerciseId,
        sets: log.sets.map((s) => normalizeSet(s as Partial<WorkoutSet> & Record<string, unknown>)),
      }))
    : [];

  if (legacy.title && legacy.source) {
    return { ...legacy, exercises };
  }

  return {
    id: legacy.id,
    source: legacy.programId || legacy.routineId ? "program" : "quick",
    title:
      legacy.title ||
      (legacy.programName && legacy.dayName
        ? `${legacy.programName} · ${legacy.dayName}`
        : "Workout"),
    exercises,
    completedAt: legacy.completedAt,
    programId: legacy.programId ?? legacy.routineId,
    programName: legacy.programName ?? legacy.routineName,
    dayId: legacy.dayId,
    dayName: legacy.dayName,
    workoutId: legacy.workoutId,
    workoutName: legacy.workoutName,
  };
}

export function getPrograms(): Program[] {
  return read<Program[]>(PROGRAMS_KEY, []);
}

export function saveProgram(program: Program): void {
  const programs = getPrograms();
  const index = programs.findIndex((p) => p.id === program.id);
  if (index >= 0) programs[index] = program;
  else programs.push(program);
  write(PROGRAMS_KEY, programs);
}

export function deleteProgram(id: string): void {
  write(
    PROGRAMS_KEY,
    getPrograms().filter((p) => p.id !== id),
  );
}

export function getSavedWorkouts(): SavedWorkout[] {
  return read<SavedWorkout[]>(SAVED_WORKOUTS_KEY, []);
}

export function saveSavedWorkout(workout: SavedWorkout): void {
  const list = getSavedWorkouts();
  const index = list.findIndex((w) => w.id === workout.id);
  if (index >= 0) list[index] = workout;
  else list.push(workout);
  write(SAVED_WORKOUTS_KEY, list);
}

export function deleteSavedWorkout(id: string): void {
  write(
    SAVED_WORKOUTS_KEY,
    getSavedWorkouts().filter((w) => w.id !== id),
  );
}

export function getWorkouts(): WorkoutSession[] {
  const raw = read<Record<string, unknown>[]>(WORKOUTS_KEY, []);
  return raw.map(normalizeSession);
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

export function getPreferences(): UserPreferences {
  return read<UserPreferences>(PREFS_KEY, DEFAULT_PREFERENCES);
}

export function savePreferences(prefs: UserPreferences): void {
  write(PREFS_KEY, prefs);
}

export function getFavorites(): string[] {
  return read<string[]>(FAVORITES_KEY, []);
}

function saveFavorites(ids: string[]): void {
  write(FAVORITES_KEY, ids);
}

export function toggleFavorite(id: string): string[] {
  const current = getFavorites();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  saveFavorites(next);
  return next;
}

export function getRecentExerciseIds(): string[] {
  return read<string[]>(RECENT_KEY, []);
}

export function trackRecentExercises(ids: string[]): void {
  const current = getRecentExerciseIds();
  const merged = [...ids, ...current.filter((id) => !ids.includes(id))].slice(
    0,
    12,
  );
  write(RECENT_KEY, merged);
}

export function getSessionDraft(): SessionDraft | null {
  return read<SessionDraft | null>(DRAFT_KEY, null);
}

export function saveSessionDraft(draft: SessionDraft): void {
  write(DRAFT_KEY, draft);
}

export function clearSessionDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

export function newId(): string {
  return crypto.randomUUID();
}
