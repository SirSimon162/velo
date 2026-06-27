"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { IconProps } from "@/components/ui/icons";

interface TabButtonProps {
  active: boolean;
  label: string;
  shortLabel: string;
  onClick: () => void;
  layout: "top" | "bottom";
  icon?: ComponentType<IconProps>;
  tabLayoutId?: string;
}

export function TabButton({
  active,
  label,
  shortLabel,
  onClick,
  layout,
  icon: Icon,
  tabLayoutId = "dashboard-top-tab",
}: TabButtonProps) {
  const isBottom = layout === "bottom";

  if (isBottom && Icon) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 transition-colors",
          active ? "text-accent-text" : "text-faint active:text-muted",
        )}
      >
        {active && (
          <motion.span
            layoutId="bottom-tab-pill"
            className="absolute inset-x-0.5 inset-y-1 rounded-lg bg-accent-muted shadow-[inset_0_0_0_1px_var(--palette-accent-border)]"
            transition={{ type: "spring", stiffness: 480, damping: 36 }}
          />
        )}
        <Icon
          size={20}
          className={cn(
            "relative z-10 transition-[color,opacity,transform] duration-200",
            active ? "opacity-100" : "opacity-70",
          )}
        />
        <span
          className={cn(
            "relative z-10 max-w-full truncate text-[10px] leading-none tracking-wide transition-colors sm:text-[11px]",
            active ? "font-semibold" : "font-medium",
          )}
        >
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{label}</span>
        </span>
      </motion.button>
    );
  }

  if (isBottom) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors sm:text-xs",
          active ? "text-accent-text" : "text-faint active:text-muted",
        )}
      >
        <span className="sm:hidden">{shortLabel}</span>
        <span className="hidden sm:inline">{label}</span>
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
        active ? "text-inverse-text" : "text-muted hover:bg-surface-hover hover:text-subtle",
      )}
    >
      {active && (
        <motion.span
          layoutId={tabLayoutId}
          className="absolute inset-0 rounded-lg bg-inverse"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}
