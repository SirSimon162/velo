"use client";

import { useEffect, useMemo, useState } from "react";
import type { Equipment } from "@/lib/equipment";
import { EQUIPMENTS, EQUIPMENT_LABELS } from "@/lib/equipment";
import { filterExercises, getEquipmentCounts, getMovementCounts } from "@/lib/exercises";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import {
  ALL_MUSCLE_FILTER,
  getMuscleGroupsByCategory,
} from "@/lib/muscles";
import type { Movement } from "@/lib/types";
import { MOVEMENTS, MOVEMENT_LABELS } from "@/lib/movement";
import { cn } from "@/lib/cn";
import { Button, Card, Input, Label, Text } from "@/components/ui";
import { IconChevronDown, IconSearch, IconX } from "@/components/ui/icons";
import { SearchableSelect } from "@/components/ui/molecules/SearchableSelect";
import { SegmentedControl } from "@/components/ui/molecules/SegmentedControl";

const movements: (Movement | "all")[] = ["all", ...MOVEMENTS];
const equipments: (Equipment | "all")[] = ["all", ...EQUIPMENTS];
const scopes = ["all", "favorites", "recent"] as const;

export type ExerciseScope = (typeof scopes)[number];

export interface ExerciseFilterState {
  movement: Movement | "all";
  muscle: string;
  query: string;
  equipment: Equipment | "all";
  scope: ExerciseScope;
}

interface ExerciseFiltersProps {
  value: ExerciseFilterState;
  onChange: (value: ExerciseFilterState) => void;
  resultCount: number;
  totalCount: number;
  favoritesCount?: number;
  recentCount?: number;
}

function ActiveFilterChips({ value }: { value: ExerciseFilterState }) {
  const chips: string[] = [];

  if (value.scope !== "all") {
    chips.push(value.scope === "favorites" ? "Favorites" : "Recent");
  }
  if (value.query.trim()) {
    chips.push(`Search: ${value.query.trim()}`);
  }
  if (value.movement !== "all") {
    chips.push(MOVEMENT_LABELS[value.movement]);
  }
  if (value.equipment !== "all") {
    chips.push(EQUIPMENT_LABELS[value.equipment]);
  }
  if (value.muscle !== ALL_MUSCLE_FILTER) {
    chips.push(value.muscle);
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Active filters">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-md border border-border bg-bg px-2 py-1 text-xs text-subtle"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

export function ExerciseFilters({
  value,
  onChange,
  resultCount,
  totalCount,
  favoritesCount = 0,
  recentCount = 0,
}: ExerciseFiltersProps) {
  const muscleCategories = useMemo(() => getMuscleGroupsByCategory(), []);
  const movementCounts = useMemo(() => getMovementCounts(), []);
  const equipmentCounts = useMemo(() => getEquipmentCounts(), []);

  const [searchDraft, setSearchDraft] = useState(value.query);
  const [mobileOpen, setMobileOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(searchDraft, 300);
  const isSearching = searchDraft !== value.query;

  useEffect(() => {
    setSearchDraft(value.query);
  }, [value.query]);

  useEffect(() => {
    if (debouncedQuery === value.query) return;
    onChange({ ...value, query: debouncedQuery });
  }, [debouncedQuery, value, onChange]);

  const muscleOptions = useMemo(
    () => [
      { value: ALL_MUSCLE_FILTER, label: "All muscle groups" },
      ...muscleCategories.flatMap((cat) =>
        cat.muscles.map((m) => ({
          value: m,
          label: m,
          group: cat.label,
          hint: String(filterExercises({ muscle: m }).length),
        })),
      ),
    ],
    [muscleCategories],
  );

  const hasActiveFilters =
    value.movement !== "all" ||
    value.muscle !== ALL_MUSCLE_FILTER ||
    value.equipment !== "all" ||
    value.scope !== "all" ||
    value.query.trim().length > 0;

  function clearFilters() {
    setSearchDraft("");
    onChange({
      movement: "all",
      muscle: ALL_MUSCLE_FILTER,
      query: "",
      equipment: "all",
      scope: "all",
    });
  }

  return (
    <Card padding="sm" className="overflow-visible border-border-muted bg-surface-muted/80">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left lg:pointer-events-none"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="exercise-filter-panel"
        >
          <Text variant="inverse" className="text-sm font-semibold">
            Find exercises
          </Text>
          <Text variant="faint" className="mt-0.5 text-xs">
            {isSearching
              ? "Searching…"
              : `Showing ${resultCount} of ${totalCount}`}
          </Text>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-accent-text"
              aria-label="Clear filters"
              onClick={clearFilters}
            >
              <IconX size={14} />
              <span className="hidden sm:inline">Clear filters</span>
            </Button>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="exercise-filter-panel"
            aria-label={mobileOpen ? "Collapse filters" : "Expand filters"}
            className="flex items-center justify-center rounded-lg border border-border-muted p-2 text-faint transition-colors hover:bg-surface-hover hover:text-subtle lg:hidden"
          >
            <IconChevronDown
              size={18}
              className={cn(
                "transition-transform duration-200",
                mobileOpen && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      {hasActiveFilters && !mobileOpen && (
        <div className="mt-3 lg:hidden">
          <ActiveFilterChips value={value} />
        </div>
      )}

      <div
        id="exercise-filter-panel"
        className={cn(
          "space-y-4",
          mobileOpen ? "mt-4 lg:mt-4" : "hidden lg:block lg:mt-4",
        )}
      >
      <SegmentedControl
        label="Show"
        options={[...scopes]}
        value={value.scope}
        onChange={(scope) => onChange({ ...value, scope })}
        getLabel={(s) =>
          s === "all" ? "All" : s === "favorites" ? "Favorites" : "Recent"
        }
        getCount={(s) =>
          s === "all" ? totalCount : s === "favorites" ? favoritesCount : recentCount
        }
      />

      <div className="space-y-1.5">
        <Label htmlFor="exercise-search">Search</Label>
        <div className="relative">
          <IconSearch
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            size={16}
          />
          <Input
            id="exercise-search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search by name or muscle…"
            className="pl-9 pr-9"
          />
          {searchDraft && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchDraft("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-faint transition-colors hover:bg-surface-hover hover:text-subtle"
            >
              <IconX size={16} />
            </button>
          )}
        </div>
      </div>

      <SegmentedControl
        label="Movement"
        options={movements}
        value={value.movement}
        onChange={(movement) => onChange({ ...value, movement })}
        getLabel={(m) => (m === "all" ? "All" : MOVEMENT_LABELS[m])}
        getCount={(m) =>
          m === "all" ? totalCount : movementCounts[m as Movement]
        }
      />

      <SegmentedControl
        label="Equipment"
        options={equipments}
        value={value.equipment}
        onChange={(equipment) => onChange({ ...value, equipment })}
        getLabel={(e) => (e === "all" ? "All" : EQUIPMENT_LABELS[e])}
        getCount={(e) =>
          e === "all" ? totalCount : equipmentCounts[e as Equipment]
        }
      />

      <SearchableSelect
        label="Muscle group"
        value={value.muscle}
        options={muscleOptions}
        onChange={(muscle) => onChange({ ...value, muscle })}
        placeholder="All muscle groups"
        searchPlaceholder="Search muscle groups…"
      />

      {hasActiveFilters && (
        <div className="hidden border-t border-border-muted pt-3 lg:block">
          <ActiveFilterChips value={value} />
        </div>
      )}
      </div>
    </Card>
  );
}

export const defaultExerciseFilters: ExerciseFilterState = {
  movement: "all",
  muscle: ALL_MUSCLE_FILTER,
  query: "",
  equipment: "all",
  scope: "all",
};
