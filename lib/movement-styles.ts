import type { Movement } from "./types";

export const MOVEMENT_BADGE_CLASS: Record<Movement, string> = {
  push: "bg-movement-push-bg text-movement-push border-movement-push-border",
  pull: "bg-movement-pull-bg text-movement-pull border-movement-pull-border",
  legs: "bg-movement-legs-bg text-movement-legs border-movement-legs-border",
  cardio: "bg-movement-cardio-bg text-movement-cardio border-movement-cardio-border",
  core: "bg-movement-core-bg text-movement-core border-movement-core-border",
  fullbody:
    "bg-movement-fullbody-bg text-movement-fullbody border-movement-fullbody-border",
};
