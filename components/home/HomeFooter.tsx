import { appShellClass } from "@/lib/app-shell";
import { cn } from "@/lib/cn";
import { Heading, Text } from "@/components/ui";

export function HomeFooter() {
  return (
    <footer className="border-t border-border-subtle py-8">
      <div
        className={cn(
          appShellClass,
          "flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center",
        )}
      >
        <Heading as="p" variant="brand" className="text-muted">
          Velo
        </Heading>
        <Text variant="caption">Simple training. Stored locally.</Text>
      </div>
    </footer>
  );
}
