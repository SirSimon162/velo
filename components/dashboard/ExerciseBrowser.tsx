"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  defaultExerciseFilters,
  ExerciseFilters,
} from "@/components/dashboard/shared/ExerciseFilters";
import { ExpandableExerciseList } from "@/components/dashboard/shared/ExpandableExerciseList";
import { exercises, filterExercises, sortByRecent } from "@/lib/exercises";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { useVeloStorage } from "@/lib/velo-storage";
import {
  Button,
  ExerciseCard,
  PageHeader,
  Text,
} from "@/components/ui";
import { IconChevronDown, IconChevronUp } from "@/components/ui/icons";

interface ExerciseBrowserProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  onContinue: () => void;
}

export function ExerciseBrowser({
  selectedIds,
  onToggle,
  onClear,
  onContinue,
}: ExerciseBrowserProps) {
  const { favorites, recentExerciseIds, toggleFavorite } = useVeloStorage();
  const [filters, setFilters] = useState(defaultExerciseFilters);
  const [selectionOpen, setSelectionOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = filterExercises({
      movement: filters.movement,
      muscle: filters.muscle,
      query: filters.query,
      equipment: filters.equipment,
      favorites,
      favoritesOnly: filters.scope === "favorites",
      recentIds: recentExerciseIds,
      recentOnly: filters.scope === "recent",
    });
    return filters.scope === "recent"
      ? sortByRecent(list, recentExerciseIds)
      : list;
  }, [filters, favorites, recentExerciseIds]);

  function removeSelected(id: string) {
    if (selectedIds.includes(id)) {
      onToggle(id);
    }
  }

  return (
    <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-[minmax(280px,300px)_1fr] lg:gap-12 xl:grid-cols-[minmax(300px,320px)_1fr] xl:gap-16 lg:items-start">
      <div className="space-y-5 sm:space-y-6 lg:space-y-5 lg:pr-2 xl:pr-4">
        <PageHeader
          title="Exercises"
          description="Browse, filter, and select what you want to train today"
          className="lg:mb-4"
        />
        <ExerciseFilters
          value={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          totalCount={exercises.length}
          favoritesCount={favorites.length}
          recentCount={recentExerciseIds.length}
        />
      </div>

      <div className="space-y-5 sm:space-y-6 min-w-0">
        <motion.div
          key={`${filters.movement}-${filters.muscle}-${filters.query}-${filters.equipment}-${filters.scope}`}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="exercise-card-grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Exercise results"
        >
          {filtered.map((exercise) => (
            <motion.div key={exercise.id} variants={staggerItem} role="listitem" className="h-full min-h-0">
              <ExerciseCard
                exercise={exercise}
                selected={selectedIds.includes(exercise.id)}
                onClick={() => onToggle(exercise.id)}
                showSelect
                favorite={favorites.includes(exercise.id)}
                onToggleFavorite={() => toggleFavorite(exercise.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border-dashed px-4 py-10 text-center">
            <Text variant="faint" className="text-sm">
              No exercises match your filters.
            </Text>
            <Button
              variant="ghost"
              className="mt-2 text-accent-text"
              onClick={() => setFilters(defaultExerciseFilters)}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div
          className="fixed inset-x-0 bottom-20 z-30 md:bottom-6 lg:left-auto lg:right-8 lg:max-w-md lg:inset-x-auto xl:max-w-lg"
          role="status"
          aria-live="polite"
        >
          <div className="mx-4 overflow-hidden rounded-lg border border-border-muted bg-bg/95 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md md:mx-auto md:max-w-2xl lg:mx-0 lg:shadow-xl">
            {selectionOpen && (
              <div className="max-h-56 overflow-y-auto border-b border-border-muted px-4 py-3">
                <ExpandableExerciseList
                  exerciseIds={selectedIds}
                  inline
                  onRemove={removeSelected}
                />
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectionOpen((v) => !v)}
                aria-expanded={selectionOpen}
                className="flex shrink-0 items-center justify-center rounded-lg border border-border-muted px-2.5 py-2 text-faint transition-colors hover:bg-surface-hover hover:text-subtle"
                aria-label={selectionOpen ? "Collapse selected exercises" : "Expand selected exercises"}
              >
                {selectionOpen ? (
                  <IconChevronDown size={18} />
                ) : (
                  <IconChevronUp size={18} />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <Text variant="inverse" className="text-sm font-semibold">
                  {selectedIds.length} selected
                </Text>
                <Text variant="faint" className="text-xs">
                  {selectionOpen ? "Tap to collapse" : "Tap to review & remove"}
                </Text>
              </div>
              <Button variant="ghost" onClick={onClear}>
                Clear
              </Button>
              <Button onClick={onContinue}>Continue</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
