"use client";

import { useVeloStorage } from "@/lib/velo-storage";
import { Button, Card, Text } from "@/components/ui";

interface SessionDraftBannerProps {
  onResume: () => void;
}

export function SessionDraftBanner({ onResume }: SessionDraftBannerProps) {
  const { sessionDraft, discardDraft } = useVeloStorage();

  if (!sessionDraft) return null;

  return (
    <Card
      padding="sm"
      className="mb-4 border-accent-border bg-accent-subtle/30"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Text variant="accent" className="text-sm font-semibold">
            Resume unfinished session
          </Text>
          <Text variant="caption" className="mt-0.5 truncate">
            {sessionDraft.title} · {sessionDraft.exerciseIds.length} exercises
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={discardDraft}>
            Discard
          </Button>
          <Button size="sm" onClick={onResume}>
            Resume
          </Button>
        </div>
      </div>
    </Card>
  );
}
