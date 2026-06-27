import type { LoggingType, UserPreferences, WorkoutSet } from "./types";
import {
  assistLabel,
  displayDistance,
  displaySpeed,
  displayWeight,
  distanceLabel,
  distanceUnitSymbol,
  inputDistanceToKm,
  inputSpeedToKmh,
  inputWeightToKg,
  speedLabel,
  speedUnitSymbol,
  weightUnitSymbol,
} from "./units";

const ASSISTED_KEYWORDS = [
  "pull-up",
  "pull-ups",
  "chin-up",
  "chin-ups",
  "muscle-up",
];

const BODYWEIGHT_KEYWORDS = [
  "push-up",
  "push-ups",
  "crunch",
  "crunches",
  "sit-up",
  "sit-ups",
  "plank",
  "leg-raise",
  "leg-raises",
  "hanging",
  "l-sit",
  "v-up",
  "toe-touch",
  "hollow",
  "flutter",
  "mountain-climber",
  "burpee",
  "superman",
  "dead-bug",
  "bird-dog",
  "cobra",
  "dip",
  "dips",
  "ring-dip",
  "inverted-row",
  "ring-row",
];

const CARDIO_KEYWORDS = ["sled-pull", "sled-push", "prowler", "battle-rope"];

const DISTANCE_CARDIO_KEYWORDS = [
  "treadmill",
  "rower",
  "rowing",
  "bike",
  "cycle",
  "elliptical",
  "run",
  "walk",
  "sprint",
];

function matchesKeyword(id: string, keywords: string[]) {
  return keywords.some((k) => id.includes(k));
}

export function getLoggingType(exercise: {
  id: string;
  movement: string;
}): LoggingType {
  if (
    exercise.movement === "cardio" ||
    matchesKeyword(exercise.id, CARDIO_KEYWORDS)
  ) {
    return "cardio";
  }
  if (matchesKeyword(exercise.id, ASSISTED_KEYWORDS)) return "assisted";
  if (matchesKeyword(exercise.id, BODYWEIGHT_KEYWORDS)) return "bodyweight";
  if (
    exercise.movement === "core" &&
    !exercise.id.includes("cable") &&
    !exercise.id.includes("machine") &&
    !exercise.id.includes("weight")
  ) {
    return "bodyweight";
  }
  return "weighted";
}

export function supportsDistance(exerciseId: string): boolean {
  return matchesKeyword(exerciseId, DISTANCE_CARDIO_KEYWORDS);
}

export function emptySet(_type: LoggingType): WorkoutSet {
  return {
    reps: 0,
    weight: 0,
    durationMin: 0,
    incline: 0,
    speed: 0,
    distanceKm: 0,
    rpe: 0,
    rir: 0,
  };
}

export function isSetLogged(type: LoggingType, set: WorkoutSet): boolean {
  switch (type) {
    case "cardio":
      return set.durationMin > 0 || set.distanceKm > 0;
    case "bodyweight":
    case "assisted":
    case "weighted":
      return set.reps > 0;
  }
}

export function formatSetSummary(
  type: LoggingType,
  set: WorkoutSet,
  prefs: UserPreferences,
): string {
  const parts: string[] = [];

  switch (type) {
    case "cardio": {
      if (set.durationMin > 0) parts.push(`${set.durationMin} min`);
      if (set.distanceKm > 0) {
        parts.push(
          `${displayDistance(set.distanceKm, prefs.speedUnit)} ${distanceUnitSymbol(prefs.speedUnit)}`,
        );
      }
      if (set.incline > 0) parts.push(`${set.incline}% incline`);
      if (set.speed > 0) {
        parts.push(
          `${displaySpeed(set.speed, prefs.speedUnit)} ${speedUnitSymbol(prefs.speedUnit)}`,
        );
      }
      break;
    }
    case "assisted":
      parts.push(`${set.reps} reps`);
      if (set.weight > 0) {
        parts.push(
          `−${displayWeight(set.weight, prefs.weightUnit)} ${weightUnitSymbol(prefs.weightUnit)} assist`,
        );
      }
      break;
    case "bodyweight":
      parts.push(`${set.reps} reps`);
      break;
    case "weighted":
      if (set.weight > 0) {
        parts.push(
          `${set.reps} reps @ ${displayWeight(set.weight, prefs.weightUnit)} ${weightUnitSymbol(prefs.weightUnit)}`,
        );
      } else {
        parts.push(`${set.reps} reps`);
      }
      break;
  }

  if (set.rpe > 0) parts.push(`RPE ${set.rpe}/10`);
  if (set.rir > 0) {
    parts.push(`${set.rir} rep${set.rir === 1 ? "" : "s"} in reserve`);
  }

  return parts.join(" · ");
}

export const EFFORT_FIELDS: SetField[] = ["rpe", "rir"];

export type SetField =
  | "reps"
  | "weight"
  | "durationMin"
  | "incline"
  | "speed"
  | "distanceKm"
  | "rpe"
  | "rir";

export function getSetDisplayFields(
  type: LoggingType,
  exerciseId?: string,
): SetField[] {
  const base: SetField[] = [];
  switch (type) {
    case "cardio": {
      base.push("durationMin");
      if (exerciseId && supportsDistance(exerciseId)) {
        base.push("distanceKm");
      }
      base.push("incline", "speed");
      break;
    }
    case "assisted":
      base.push("reps", "weight");
      break;
    case "bodyweight":
      base.push("reps");
      break;
    case "weighted":
      base.push("reps", "weight");
      break;
  }
  return base;
}

export function getFieldLabel(
  field: SetField,
  type: LoggingType,
  prefs: UserPreferences,
): string {
  switch (field) {
    case "reps":
      return "Reps";
    case "weight":
      return type === "assisted"
        ? assistLabel(prefs.weightUnit)
        : weightLabel(prefs.weightUnit);
    case "durationMin":
      return "Duration (min)";
    case "incline":
      return "Incline (%)";
    case "speed":
      return speedLabel(prefs.speedUnit);
    case "distanceKm":
      return distanceLabel(prefs.speedUnit);
    case "rpe":
      return "Rate of Perceived Exertion (RPE)";
    case "rir":
      return "Reps in Reserve (RIR)";
  }
}

export function getFieldHint(field: SetField): string | undefined {
  switch (field) {
    case "rpe":
      return "Optional · 1 = very easy, 10 = maximum effort";
    case "rir":
      return "Optional · how many more reps you had left (0–5)";
    default:
      return undefined;
  }
}

function weightLabel(unit: UserPreferences["weightUnit"]) {
  return unit === "lb" ? "Weight (lb)" : "Weight (kg)";
}

export function displaySetFieldValue(
  field: SetField,
  set: WorkoutSet,
  prefs: UserPreferences,
): number | "" {
  const value = set[field];
  if (!value) return "";
  switch (field) {
    case "weight":
      return displayWeight(value, prefs.weightUnit);
    case "speed":
      return displaySpeed(value, prefs.speedUnit);
    case "distanceKm":
      return displayDistance(value, prefs.speedUnit);
    default:
      return value;
  }
}

export function parseSetFieldValue(
  field: SetField,
  raw: number,
  prefs: UserPreferences,
): number {
  if (raw <= 0) return 0;
  switch (field) {
    case "weight":
      return inputWeightToKg(raw, prefs.weightUnit);
    case "speed":
      return inputSpeedToKmh(raw, prefs.speedUnit);
    case "distanceKm":
      return inputDistanceToKm(raw, prefs.speedUnit);
    case "reps":
    case "durationMin":
    case "incline":
    case "rpe":
    case "rir":
      return field === "reps" || field === "durationMin" || field === "rpe" || field === "rir"
        ? Math.round(raw)
        : raw;
    default:
      return raw;
  }
}

export function cloneSet(set: WorkoutSet): WorkoutSet {
  return { ...set };
}
