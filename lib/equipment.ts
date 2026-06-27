export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "kettlebell"
  | "band"
  | "smith"
  | "cardio"
  | "other";

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  cable: "Cable",
  machine: "Machine",
  bodyweight: "Bodyweight",
  kettlebell: "Kettlebell",
  band: "Band",
  smith: "Smith",
  cardio: "Cardio",
  other: "Other",
};

export const EQUIPMENTS: Equipment[] = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "kettlebell",
  "band",
  "smith",
  "cardio",
  "other",
];

const RULES: { equipment: Equipment; match: (id: string) => boolean }[] = [
  {
    equipment: "cardio",
    match: (id) =>
      /treadmill|stairmaster|bike|cycle|rower|rowing|elliptical|sled|prowler|battle-rope|fan-cycle|assault|ski-erg|stepper|incline-walk/.test(
        id,
      ),
  },
  { equipment: "smith", match: (id) => id.includes("smith") },
  { equipment: "kettlebell", match: (id) => id.includes("kettlebell") },
  { equipment: "band", match: (id) => id.includes("band") },
  { equipment: "cable", match: (id) => id.includes("cable") },
  {
    equipment: "machine",
    match: (id) =>
      id.includes("machine") ||
      id.includes("leg-press") ||
      id.includes("hack-squat") ||
      id.includes("pec-deck") ||
      id.includes("lat-pulldown") ||
      id.includes("seated-row") ||
      id.includes("leg-curl") ||
      id.includes("leg-extension") ||
      id.includes("calf-raise-machine"),
  },
  { equipment: "dumbbell", match: (id) => id.includes("dumbbell") || id.includes("db-") },
  { equipment: "barbell", match: (id) => id.includes("barbell") || id.includes("bb-") },
  {
    equipment: "bodyweight",
    match: (id) =>
      /push-up|pull-up|chin-up|dip|plank|crunch|sit-up|burpee|muscle-up|l-sit|hanging|inverted-row|ring-row|bodyweight|pistol|nordic|glute-bridge$|hip-thrust$/.test(
        id,
      ),
  },
];

export function inferEquipment(exerciseId: string): Equipment {
  for (const rule of RULES) {
    if (rule.match(exerciseId)) return rule.equipment;
  }
  return "other";
}

export function getEquipmentCounts(
  exerciseIds: string[],
): Record<Equipment, number> {
  const counts = Object.fromEntries(
    EQUIPMENTS.map((e) => [e, 0]),
  ) as Record<Equipment, number>;
  for (const id of exerciseIds) {
    counts[inferEquipment(id)]++;
  }
  return counts;
}
