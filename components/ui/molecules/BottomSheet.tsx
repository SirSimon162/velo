"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl border border-border-muted bg-bg-elevated pb-safe",
              className,
            )}
          >
            <div className="shrink-0 border-b border-border-muted bg-bg-elevated px-4 py-3">
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border" />
              {title && (
                <p className="text-center text-sm font-semibold text-foreground">
                  {title}
                </p>
              )}
            </div>
            <div className="scrollbar-none min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
