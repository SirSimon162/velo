import { MOVEMENT_BADGE_CLASS } from "./movement-styles";
import { MOVEMENT_LABELS, type Movement } from "./types";

export const MOVEMENTS: Movement[] = [
  "push",
  "pull",
  "legs",
  "cardio",
  "core",
  "fullbody",
];

const ALIASES: Record<string, Movement> = {
  "full-body": "fullbody",
  "full body": "fullbody",
};

export function normalizeMovement(raw: string): Movement {
  const key = raw.toLowerCase().trim().replace(/\s+/g, "-");
  if (MOVEMENTS.includes(key as Movement)) return key as Movement;
  if (ALIASES[key]) return ALIASES[key];
  const spaced = raw.toLowerCase().trim();
  if (ALIASES[spaced]) return ALIASES[spaced];
  return "fullbody";
}

export function getMovementLabel(movement: string): string {
  return MOVEMENT_LABELS[normalizeMovement(movement)];
}

export function getMovementBadgeClass(movement: string): string {
  return MOVEMENT_BADGE_CLASS[normalizeMovement(movement)];
}

export { MOVEMENT_LABELS, MOVEMENT_BADGE_CLASS };
