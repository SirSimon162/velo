"use client";

import { Badge, Card, Text } from "@/components/ui";
import { MuscleBalancePanel } from "@/components/dashboard/shared/MuscleBalancePanel";
import {
  getTrainableMuscleGroups,
  type MuscleAnalysis,
} from "@/lib/muscles";

interface MuscleCoveragePanelProps {
  analysis: MuscleAnalysis;
}

export function MuscleCoveragePanel({ analysis }: MuscleCoveragePanelProps) {
  const workedSet = new Set(analysis.trained);
  const neglected = getTrainableMuscleGroups().filter((m) => !workedSet.has(m));

  return (
    <div className="space-y-3">
      <MuscleBalancePanel
        balance={{ worked: analysis.trained, neglected }}
        title="Session muscle balance"
      />

      {analysis.lagging.length > 0 && (
        <Card padding="sm" className="border-accent-border bg-accent-subtle/30">
          <Text variant="caption" className="text-accent-text">
            Not trained in the last 14 days
          </Text>
          <Text variant="faint" className="mt-1 text-xs">
            These groups in your lineup haven&apos;t been hit recently — a good
            reason to run this session.
          </Text>
          <ul
            className="mt-2 flex flex-wrap gap-1.5"
            aria-label="Recently neglected muscles"
          >
            {analysis.lagging.map((m) => (
              <li key={m}>
                <Badge className="border-accent-border bg-accent-subtle text-accent-text">
                  {m}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {analysis.lagging.length === 0 && analysis.trained.length > 0 && (
        <Text variant="faint" className="text-xs">
          All targeted muscles were trained in the last 2 weeks.
        </Text>
      )}
    </div>
  );
}
