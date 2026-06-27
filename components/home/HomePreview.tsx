"use client";

import { useCallback, useState } from "react";
import { exercises } from "@/lib/exercises";
import {
  Button,
  Card,
  ExerciseCard,
  Heading,
  TabButton,
  Text,
} from "@/components/ui";
import {
  IconBookmark,
  IconClock,
  IconDumbbell,
  IconLayers,
  IconPlay,
} from "@/components/ui/icons";

type PreviewTab = "exercises" | "programs" | "workouts" | "train" | "history";

const tabs: {
  id: PreviewTab;
  label: string;
  shortLabel: string;
  icon: typeof IconDumbbell;
}[] = [
  { id: "exercises", label: "Exercises", shortLabel: "Moves", icon: IconDumbbell },
  { id: "programs", label: "Programs", shortLabel: "Programs", icon: IconLayers },
  { id: "workouts", label: "Workouts", shortLabel: "Workouts", icon: IconBookmark },
  { id: "train", label: "Train", shortLabel: "Train", icon: IconPlay },
  { id: "history", label: "History", shortLabel: "Log", icon: IconClock },
];

const previewExercises = exercises.slice(0, 4);

const tabCopy: Record<
  PreviewTab,
  { title: string; description: string }
> = {
  exercises: {
    title: "Exercises",
    description: "Tap cards to select · star to favorite",
  },
  programs: {
    title: "Programs",
    description: "Multi-day splits with muscle balance",
  },
  workouts: {
    title: "Workouts",
    description: "Reusable exercise lists",
  },
  train: {
    title: "Train",
    description: "Start a program day or saved workout",
  },
  history: {
    title: "History",
    description: "Sessions, volume, PRs, and muscle heatmap",
  },
};

export function HomePreview() {
  const [tab, setTab] = useState<PreviewTab>("exercises");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    previewExercises[0] ? [previewExercises[0].id] : [],
  );
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const toggleExercise = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const copy = tabCopy[tab];

  return (
    <div className="overflow-hidden rounded-lg border border-border-muted bg-bg-elevated/80 shadow-xl backdrop-blur-sm">
      <div className="scrollbar-none flex gap-1 overflow-x-auto overscroll-x-contain border-b border-border-muted px-3 py-2">
        {tabs.map((t) => (
          <TabButton
            key={t.id}
            active={tab === t.id}
            label={t.label}
            shortLabel={t.shortLabel}
            onClick={() => setTab(t.id)}
            layout="top"
            tabLayoutId="home-preview-tab"
          />
        ))}
      </div>

      <div className="border-b border-border-muted px-4 py-3">
        <Text variant="inverse" className="text-sm font-semibold">
          {copy.title}
        </Text>
        <Text variant="faint" className="text-xs">
          {copy.description}
        </Text>
      </div>

      <div className="p-4 overflow-hidden">
        {tab === "exercises" && (
          <div className="exercise-card-grid gap-3 sm:grid-cols-2">
            {previewExercises.map((exercise) => (
              <div key={exercise.id} className="h-full min-h-0">
                <ExerciseCard
                  exercise={exercise}
                  selected={selectedIds.includes(exercise.id)}
                  showSelect
                  favorite={favoriteIds.includes(exercise.id)}
                  onClick={() => toggleExercise(exercise.id)}
                  onToggleFavorite={() => toggleFavorite(exercise.id)}
                />
              </div>
            ))}
          </div>
        )}

        {tab === "programs" && (
          <div className="space-y-3">
            {["Push / Pull / Legs", "Upper / Lower"].map((name) => (
              <Card key={name} padding="sm" className="space-y-1">
                <Heading as="h3" variant="h4">
                  {name}
                </Heading>
                <Text variant="caption">3 days · muscle balance tracked</Text>
              </Card>
            ))}
          </div>
        )}

        {tab === "workouts" && (
          <div className="space-y-3">
            {["Push Day", "Leg Day"].map((name) => (
              <Card key={name} padding="sm" className="flex items-center justify-between gap-3">
                <div>
                  <Heading as="h3" variant="h4">
                    {name}
                  </Heading>
                  <Text variant="caption">6 exercises</Text>
                </div>
                <Button size="sm" variant="secondary" disabled>
                  Edit
                </Button>
              </Card>
            ))}
          </div>
        )}

        {tab === "train" && (
          <div className="space-y-3">
            <Card padding="sm" className="flex items-center justify-between gap-3">
              <div>
                <Heading as="h3" variant="h4">
                  Push / Pull / Legs
                </Heading>
                <Text variant="caption">Day 1 · Push</Text>
              </div>
              <Button size="sm">Start</Button>
            </Card>
            <Card padding="sm" className="flex items-center justify-between gap-3">
              <div>
                <Heading as="h3" variant="h4">
                  Push Day
                </Heading>
                <Text variant="caption">Saved workout</Text>
              </div>
              <Button size="sm">Start</Button>
            </Card>
          </div>
        )}

        {tab === "history" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Card padding="sm" className="space-y-3">
              <Heading variant="h4">Weekly volume</Heading>
              <div className="flex h-20 items-end gap-1.5">
                {[40, 65, 55, 80, 45, 70, 60].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-accent/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </Card>
            <Card padding="sm" className="space-y-2">
              <Heading variant="h4">Recent PRs</Heading>
              <Text variant="caption">Barbell Bench Press · 100 kg × 5</Text>
              <Text variant="caption">Squats · 140 kg × 3</Text>
            </Card>
          </div>
        )}
      </div>

      {tab === "exercises" && selectedIds.length > 0 && (
        <div className="border-t border-border-muted px-4 py-3">
          <Text variant="caption" className="text-accent-text">
            {selectedIds.length} selected — try it out, nothing is saved here
          </Text>
        </div>
      )}
    </div>
  );
}
