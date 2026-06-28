"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HomePreview } from "@/components/home/HomePreview";
import { appShellClass } from "@/lib/app-shell";
import { exercises } from "@/lib/exercises";
import { cn } from "@/lib/cn";
import { AppLink, Text } from "@/components/ui";
import { IconCheck, IconDumbbell } from "@/components/ui/icons";

const fadeUp = (delay: number, reduced: boolean) => ({
  initial: reduced ? false : { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const highlights = [
  "Programs & reusable workouts",
  "Set logging with PR hints",
  "Stored locally — no account",
];

export function HeroSection() {
  const reduced = !!useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
      <div className={cn(appShellClass, "grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16")}>
        <div className="max-w-xl">
          <motion.div {...fadeUp(0, reduced)}>
            <Text variant="caption" className="text-accent-text">
              Gym workout tracker
            </Text>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08, reduced)}
            className="mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="text-foreground">Train with </span>
            <span className="hero-gradient-text italic">clarity.</span>
          </motion.h1>

          <motion.div {...fadeUp(0.16, reduced)}>
            <Text className="mt-5 max-w-lg text-base leading-relaxed">
              Browse exercises, build programs and workouts, log sets with
              previous performance and PRs, and review history — all stored
              locally in your browser.
            </Text>
          </motion.div>

          <motion.div {...fadeUp(0.24, reduced)} className="mt-8 space-y-4">
            <div className="inline-flex max-w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-muted/50 px-4 py-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent-text">
                <IconDumbbell size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  <span className="tabular-nums">{exercises.length}+</span>{" "}
                  exercises built in
                </p>
                <p className="mt-0.5 text-xs text-faint">
                  Filter by muscle, equipment, and movement
                </p>
              </div>
            </div>

            <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <IconCheck
                    size={16}
                    className="shrink-0 text-accent-text"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeUp(0.32, reduced)} className="mt-8">
            <AppLink href="/dashboard" size="lg" className="hero-cta-glow">
              Open dashboard
            </AppLink>
          </motion.div>
        </div>

        <motion.div
          className="w-full"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <HomePreview />
        </motion.div>
      </div>
    </section>
  );
}
