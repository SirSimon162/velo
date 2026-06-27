"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconChevronDown } from "../icons";
import { Card } from "../atoms/Card";

interface CollapsibleCardProps {
  open: boolean;
  onToggle: () => void;
  header: ReactNode;
  children: ReactNode;
}

export function CollapsibleCard({
  open,
  onToggle,
  header,
  children,
}: CollapsibleCardProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full min-w-0 items-center justify-between gap-3 p-3.5 text-left transition-colors hover:bg-surface-hover active:bg-surface-active sm:p-4"
      >
        {header}
        <IconChevronDown
          size={18}
          className={cn(
            "shrink-0 text-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="space-y-4 border-t border-border p-3.5 sm:p-4">
          {children}
        </div>
      )}
    </Card>
  );
}
