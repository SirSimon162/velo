"use client";

import { motion } from "framer-motion";

interface VolumeChartProps {
  bars: readonly number[];
  animate?: boolean;
  className?: string;
}

export function VolumeChart({
  bars,
  animate = true,
  className,
}: VolumeChartProps) {
  return (
    <div className={className}>
      <div className="flex h-24 items-end gap-1 sm:h-28">
        {bars.map((height, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm bg-accent/40"
            initial={animate ? { height: 0, opacity: 0.4 } : false}
            animate={{ height: `${height}%`, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: animate ? i * 0.04 : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ backgroundColor: "var(--palette-accent)" }}
          />
        ))}
      </div>
    </div>
  );
}
