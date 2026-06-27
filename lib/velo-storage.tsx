"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearSessionDraft,
  deleteProgram,
  deleteSavedWorkout,
  deleteWorkout,
  getFavorites,
  getPreferences,
  getPrograms,
  getRecentExerciseIds,
  getSavedWorkouts,
  getSessionDraft,
  getWorkouts,
  savePreferences,
  saveProgram,
  saveSavedWorkout,
  saveSessionDraft,
  saveWorkout,
  toggleFavorite as storageToggleFavorite,
  trackRecentExercises,
} from "./storage";
import type {
  Program,
  SavedWorkout,
  SessionDraft,
  UserPreferences,
  WorkoutSession,
} from "./types";

interface VeloStorageContextValue {
  programs: Program[];
  savedWorkouts: SavedWorkout[];
  workouts: WorkoutSession[];
  preferences: UserPreferences;
  favorites: string[];
  recentExerciseIds: string[];
  sessionDraft: SessionDraft | null;
  refresh: () => void;
  setPreferences: (prefs: UserPreferences) => void;
  upsertProgram: (program: Program) => void;
  removeProgram: (id: string) => void;
  upsertSavedWorkout: (workout: SavedWorkout) => void;
  removeSavedWorkout: (id: string) => void;
  addWorkout: (session: WorkoutSession) => void;
  removeWorkout: (id: string) => void;
  toggleFavorite: (id: string) => void;
  recordRecent: (ids: string[]) => void;
  persistDraft: (draft: SessionDraft) => void;
  discardDraft: () => void;
}

const VeloStorageContext = createContext<VeloStorageContextValue | null>(null);

export function VeloStorageProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [preferences, setPreferencesState] = useState(getPreferences());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentExerciseIds, setRecentExerciseIds] = useState<string[]>([]);
  const [sessionDraft, setSessionDraft] = useState<SessionDraft | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setPrograms(getPrograms());
    setSavedWorkouts(getSavedWorkouts());
    setWorkouts(getWorkouts());
    setPreferencesState(getPreferences());
    setFavorites(getFavorites());
    setRecentExerciseIds(getRecentExerciseIds());
    setSessionDraft(getSessionDraft());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const setPreferences = useCallback(
    (prefs: UserPreferences) => {
      savePreferences(prefs);
      setPreferencesState(prefs);
    },
    [],
  );

  const upsertProgram = useCallback((program: Program) => {
    saveProgram(program);
    setPrograms(getPrograms());
  }, []);

  const removeProgram = useCallback((id: string) => {
    deleteProgram(id);
    setPrograms(getPrograms());
  }, []);

  const upsertSavedWorkout = useCallback((workout: SavedWorkout) => {
    saveSavedWorkout(workout);
    setSavedWorkouts(getSavedWorkouts());
  }, []);

  const removeSavedWorkout = useCallback((id: string) => {
    deleteSavedWorkout(id);
    setSavedWorkouts(getSavedWorkouts());
  }, []);

  const addWorkout = useCallback((session: WorkoutSession) => {
    saveWorkout(session);
    trackRecentExercises(session.exercises.map((e) => e.exerciseId));
    clearSessionDraft();
    setWorkouts(getWorkouts());
    setRecentExerciseIds(getRecentExerciseIds());
    setSessionDraft(null);
  }, []);

  const removeWorkout = useCallback((id: string) => {
    deleteWorkout(id);
    setWorkouts(getWorkouts());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(storageToggleFavorite(id));
  }, []);

  const recordRecent = useCallback((ids: string[]) => {
    trackRecentExercises(ids);
    setRecentExerciseIds(getRecentExerciseIds());
  }, []);

  const persistDraft = useCallback((draft: SessionDraft) => {
    saveSessionDraft(draft);
    setSessionDraft(draft);
  }, []);

  const discardDraft = useCallback(() => {
    clearSessionDraft();
    setSessionDraft(null);
  }, []);

  const value = useMemo(
    () => ({
      programs,
      savedWorkouts,
      workouts,
      preferences,
      favorites,
      recentExerciseIds,
      sessionDraft,
      refresh,
      setPreferences,
      upsertProgram,
      removeProgram,
      upsertSavedWorkout,
      removeSavedWorkout,
      addWorkout,
      removeWorkout,
      toggleFavorite,
      recordRecent,
      persistDraft,
      discardDraft,
    }),
    [
      programs,
      savedWorkouts,
      workouts,
      preferences,
      favorites,
      recentExerciseIds,
      sessionDraft,
      refresh,
      setPreferences,
      upsertProgram,
      removeProgram,
      upsertSavedWorkout,
      removeSavedWorkout,
      addWorkout,
      removeWorkout,
      toggleFavorite,
      recordRecent,
      persistDraft,
      discardDraft,
    ],
  );

  if (!ready) return null;

  return (
    <VeloStorageContext.Provider value={value}>
      {children}
    </VeloStorageContext.Provider>
  );
}

export function useVeloStorage() {
  const ctx = useContext(VeloStorageContext);
  if (!ctx) {
    throw new Error("useVeloStorage must be used within VeloStorageProvider");
  }
  return ctx;
}
