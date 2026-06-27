"use client";

import { useState } from "react";
import { Badge, Button, Text } from "@/components/ui";
import { IconChevronDown } from "@/components/ui/icons";
import type { MuscleBalance } from "@/lib/muscles";
import { cn } from "@/lib/cn";

interface MuscleBalancePanelProps {
  balance: MuscleBalance;
  title?: string;
  compact?: boolean;
  maxVisible?: number;
  className?: string;
}

function MuscleList({
  id,
  label,
  muscles,
  variant,
  maxVisible,
  expanded,
  onToggle,
}: {
  id: string;
  label: string;
  muscles: string[];
  variant: "worked" | "neglected";
  maxVisible: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const visible = expanded ? muscles : muscles.slice(0, maxVisible);
  const hidden = muscles.length - visible.length;

  if (muscles.length === 0) {
    return (
      <div>
        <Text
          id={id}
          variant="caption"
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-faint"
        >
          {label}
        </Text>
        <Text variant="faint" className="text-xs">
          None
        </Text>
      </div>
    );
  }

  return (
    <div role="region" aria-labelledby={id}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Text
          id={id}
          variant="caption"
          className="text-xs font-medium uppercase tracking-wide text-faint"
        >
          {label}{" "}
          <span className="tabular-nums text-muted">({muscles.length})</span>
        </Text>
        {muscles.length > maxVisible && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto gap-0.5 px-2 py-0.5 text-xs text-accent-text"
            onClick={onToggle}
            aria-expanded={expanded}
          >
            {expanded ? "Less" : `+${hidden} more`}
            <IconChevronDown
              size={14}
              className={cn("transition-transform", expanded && "rotate-180")}
            />
          </Button>
        )}
      </div>
      <ul className="flex flex-wrap gap-1.5" aria-label={label}>
        {visible.map((m) => (
          <li key={m}>
            <Badge
              className={cn(
                "text-[11px] sm:text-xs",
                variant === "worked"
                  ? "border-accent-border bg-accent-muted text-accent-text"
                  : "border-border-dashed bg-surface-subtle text-faint",
              )}
            >
              {m}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MuscleBalancePanel({
  balance,
  title = "Muscle coverage",
  compact = false,
  maxVisible = compact ? 6 : 12,
  className,
}: MuscleBalancePanelProps) {
  const [workedExpanded, setWorkedExpanded] = useState(false);
  const [neglectedExpanded, setNeglectedExpanded] = useState(false);

  const workedPct =
    balance.worked.length + balance.neglected.length > 0
      ? Math.round(
          (balance.worked.length /
            (balance.worked.length + balance.neglected.length)) *
            100,
        )
      : 0;

  return (
    <section
      className={cn(
        "rounded-lg border border-border-muted bg-bg/40",
        compact ? "p-3" : "p-4",
        className,
      )}
      aria-label={title}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <Text variant="inverse" className="text-sm font-semibold">
          {title}
        </Text>
        {balance.worked.length > 0 && (
          <Text variant="caption" className="shrink-0 tabular-nums">
            {workedPct}% covered
          </Text>
        )}
      </div>

      {balance.worked.length + balance.neglected.length > 0 && (
        <div
          className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-hover"
          role="progressbar"
          aria-valuenow={workedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Muscle groups covered"
        >
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${workedPct}%` }}
          />
        </div>
      )}

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <MuscleList
          id="muscles-worked"
          label="Worked"
          muscles={balance.worked}
          variant="worked"
          maxVisible={maxVisible}
          expanded={workedExpanded}
          onToggle={() => setWorkedExpanded((v) => !v)}
        />
        <MuscleList
          id="muscles-neglected"
          label="Neglected"
          muscles={balance.neglected}
          variant="neglected"
          maxVisible={maxVisible}
          expanded={neglectedExpanded}
          onToggle={() => setNeglectedExpanded((v) => !v)}
        />
      </div>
    </section>
  );
}
