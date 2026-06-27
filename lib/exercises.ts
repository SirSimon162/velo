import exercisesData from "@/data/exercises.json";
import type { Equipment } from "./equipment";
import { EQUIPMENTS, inferEquipment } from "./equipment";
import { ALL_MUSCLE_FILTER } from "./muscles";
import { normalizeMovement } from "./movement";
import type { Exercise, Movement } from "./types";

type RawExercise = Omit<Exercise, "movement"> & { movement: string };

function normalizeExercise(raw: RawExercise): Exercise {
  return {
    ...raw,
    movement: normalizeMovement(raw.movement),
  };
}

export const exercises: Exercise[] = (exercisesData as RawExercise[]).map(
  normalizeExercise,
);

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

export function getExercisesByMovement(movement: Movement): Exercise[] {
  return exercises.filter((e) => e.movement === movement);
}

export function getMovementCounts(): Record<Movement, number> {
  const counts: Record<Movement, number> = {
    push: 0,
    pull: 0,
    legs: 0,
    cardio: 0,
    core: 0,
    fullbody: 0,
  };
  for (const e of exercises) counts[e.movement]++;
  return counts;
}

export function getEquipmentCounts(): Record<Equipment, number> {
  const counts = Object.fromEntries(EQUIPMENTS.map((e) => [e, 0])) as Record<
    Equipment,
    number
  >;
  for (const e of exercises) {
    counts[inferEquipment(e.id)]++;
  }
  return counts;
}

export function filterExercises(options: {
  movement?: Movement | "all";
  muscle?: string;
  query?: string;
  equipment?: Equipment | "all";
  favorites?: string[];
  favoritesOnly?: boolean;
  recentIds?: string[];
  recentOnly?: boolean;
}): Exercise[] {
  let result = exercises;

  if (options.movement && options.movement !== "all") {
    result = result.filter((e) => e.movement === options.movement);
  }

  if (options.muscle && options.muscle !== ALL_MUSCLE_FILTER) {
    result = result.filter((e) => e.muscles.includes(options.muscle!));
  }

  if (options.equipment && options.equipment !== "all") {
    result = result.filter(
      (e) => inferEquipment(e.id) === options.equipment,
    );
  }

  if (options.favoritesOnly && options.favorites) {
    result = result.filter((e) => options.favorites!.includes(e.id));
  }

  if (options.recentOnly && options.recentIds?.length) {
    const recentSet = new Set(options.recentIds);
    result = result.filter((e) => recentSet.has(e.id));
  }

  if (options.query?.trim()) {
    const q = options.query.trim().toLowerCase();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscles.some((m) => m.toLowerCase().includes(q)),
    );
  }

  return result;
}

export function getExercisesByIds(ids: string[]): Exercise[] {
  return ids
    .map((id) => getExerciseById(id))
    .filter((e): e is Exercise => e !== undefined);
}

export function sortByRecent(
  list: Exercise[],
  recentIds: string[],
): Exercise[] {
  const order = new Map(recentIds.map((id, i) => [id, i]));
  return [...list].sort((a, b) => {
    const ai = order.get(a.id) ?? 999;
    const bi = order.get(b.id) ?? 999;
    return ai - bi;
  });
}
