"use client";

import { useState } from "react";
import { ExerciseBrowser } from "@/components/ExerciseBrowser";
import { RoutineBuilder } from "@/components/RoutineBuilder";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { WorkoutRunner } from "@/components/WorkoutRunner";

type Tab = "exercises" | "routines" | "train" | "history";

const tabs: { id: Tab; label: string; shortLabel: string }[] = [
  { id: "exercises", label: "Exercises", shortLabel: "Moves" },
  { id: "routines", label: "Routines", shortLabel: "Plans" },
  { id: "train", label: "Train", shortLabel: "Train" },
  { id: "history", label: "History", shortLabel: "Log" },
];

function TabButton({
  active,
  label,
  shortLabel,
  onClick,
  layout,
}: {
  active: boolean;
  label: string;
  shortLabel: string;
  onClick: () => void;
  layout: "top" | "bottom";
}) {
  const isBottom = layout === "bottom";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`transition-colors ${
        isBottom
          ? `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium sm:text-xs ${
              active
                ? "text-emerald-400"
                : "text-zinc-500 active:text-zinc-300"
            }`
          : `shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium ${
              active
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            }`
      }`}
    >
      {isBottom ? (
        <>
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{label}</span>
          {active && (
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
          )}
        </>
      ) : (
        label
      )}
    </button>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("exercises");
  const [historyKey, setHistoryKey] = useState(0);

  return (
    <div className="min-h-dvh bg-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/90 pt-safe backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-zinc-50 sm:text-xl">
              Velo
            </h1>
            <p className="truncate text-xs text-zinc-500">Gym workout tracker</p>
          </div>
        </div>

        <nav className="mx-auto hidden max-w-2xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6 md:flex">
          {tabs.map((t) => (
            <TabButton
              key={t.id}
              active={tab === t.id}
              label={t.label}
              shortLabel={t.shortLabel}
              onClick={() => setTab(t.id)}
              layout="top"
            />
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4 pb-24 sm:px-6 sm:py-6 md:pb-6">
        {tab === "exercises" && <ExerciseBrowser />}
        {tab === "routines" && <RoutineBuilder />}
        {tab === "train" && (
          <WorkoutRunner onComplete={() => setHistoryKey((k) => k + 1)} />
        )}
        {tab === "history" && <WorkoutHistory key={historyKey} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-800/80 bg-zinc-950/95 pb-safe backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-2xl px-safe">
          {tabs.map((t) => (
            <TabButton
              key={t.id}
              active={tab === t.id}
              label={t.label}
              shortLabel={t.shortLabel}
              onClick={() => setTab(t.id)}
              layout="bottom"
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
