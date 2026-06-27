"use client";

import type { MuscleHeatmapData } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { Card, Heading, Text } from "@/components/ui";

interface MuscleHeatmapProps {
  data: MuscleHeatmapData;
}

export function MuscleHeatmap({ data }: MuscleHeatmapProps) {
  if (data.muscles.length === 0) {
    return (
      <Card padding="sm" className="text-center">
        <Text variant="faint" className="text-sm">
          Log sessions to see your weekly muscle coverage.
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="sm" className="space-y-3 overflow-x-auto">
      <Heading variant="h4">Weekly muscle heatmap</Heading>
      <div className="min-w-[320px]">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `minmax(88px, 1.2fr) repeat(${data.days.length}, minmax(28px, 1fr))`,
          }}
        >
          <div />
          {data.days.map((day) => (
            <Text
              key={day.date}
              variant="caption"
              className="text-center text-[10px] uppercase"
            >
              {day.label}
            </Text>
          ))}
          {data.muscles.map((muscle) => (
            <div key={muscle} className="contents">
              <Text
                key={`${muscle}-label`}
                variant="caption"
                className="truncate pr-2 text-[11px]"
              >
                {muscle}
              </Text>
              {data.days.map((day) => {
                const cell = data.cells.find(
                  (c) => c.muscle === muscle && c.dayLabel === day.label,
                );
                return (
                  <div
                    key={`${muscle}-${day.date}`}
                    title={
                      cell?.hit
                        ? `${muscle} · ${day.label}`
                        : `${muscle} not trained`
                    }
                    className={cn(
                      "aspect-square rounded-md border",
                      cell?.hit
                        ? "border-accent-border bg-accent-muted"
                        : "border-border-muted bg-bg/40",
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
