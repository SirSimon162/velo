import exercisesData from "@/data/exercises.json";
import type { Exercise, Movement } from "./types";

export const exercises = exercisesData as Exercise[];

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

export function getExercisesByMovement(movement: Movement): Exercise[] {
  return exercises.filter((e) => e.movement === movement);
}

export function getMovementCounts(): Record<Movement, number> {
  const counts = { push: 0, pull: 0, legs: 0, cardio: 0, core: 0 };
  for (const e of exercises) counts[e.movement]++;
  return counts;
}
