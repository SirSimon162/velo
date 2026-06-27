"use client";

import { useState } from "react";
import type { SpeedUnit, WeightUnit } from "@/lib/types";
import { useVeloStorage } from "@/lib/velo-storage";
import { cn } from "@/lib/cn";
import { Button, Text } from "@/components/ui";
import { IconChevronDown } from "@/components/ui/icons";

export function UserSettingsPanel() {
  const { preferences, setPreferences } = useVeloStorage();
  const [open, setOpen] = useState(false);

  function setWeightUnit(weightUnit: WeightUnit) {
    setPreferences({ ...preferences, weightUnit });
  }

  function setSpeedUnit(speedUnit: SpeedUnit) {
    setPreferences({ ...preferences, speedUnit });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border-muted bg-bg-elevated px-3 py-2 text-sm font-medium text-subtle shadow-sm transition-colors hover:border-border hover:bg-surface-hover hover:text-foreground",
          open && "border-accent-border bg-accent-subtle/40 text-accent-text",
        )}
      >
        {preferences.weightUnit === "lb" ? "lb" : "kg"}
        <span className="text-faint">·</span>
        {preferences.speedUnit === "mph" ? "mph" : "km/h"}
        <IconChevronDown
          size={14}
          className={cn("text-faint transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30"
            aria-label="Close settings"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-lg border border-border-muted bg-bg-elevated p-4 shadow-xl backdrop-blur-xl">
            <div className="space-y-4">
              <div>
                <Text variant="caption" className="mb-2 block uppercase tracking-wide">
                  Weight
                </Text>
                <div className="flex gap-2">
                  <Button
                    variant={preferences.weightUnit === "kg" ? "pillActive" : "pill"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setWeightUnit("kg")}
                  >
                    kg
                  </Button>
                  <Button
                    variant={preferences.weightUnit === "lb" ? "pillActive" : "pill"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setWeightUnit("lb")}
                  >
                    lb
                  </Button>
                </div>
              </div>
              <div>
                <Text variant="caption" className="mb-2 block uppercase tracking-wide">
                  Speed / distance
                </Text>
                <div className="flex gap-2">
                  <Button
                    variant={preferences.speedUnit === "kmh" ? "pillActive" : "pill"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setSpeedUnit("kmh")}
                  >
                    km/h
                  </Button>
                  <Button
                    variant={preferences.speedUnit === "mph" ? "pillActive" : "pill"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setSpeedUnit("mph")}
                  >
                    mph
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
