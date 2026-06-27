import Link from "next/link";
import { appShellClass } from "@/lib/app-shell";
import { cn } from "@/lib/cn";
import { AppLink, Heading, Text } from "@/components/ui";

export function HomeNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border-muted bg-bg/80 pt-safe backdrop-blur-xl">
      <div
        className={cn(
          appShellClass,
          "flex items-center justify-between py-3 sm:py-4",
        )}
      >
        <Link href="/" className="group min-w-0">
          <Heading
            as="span"
            variant="brand"
            className="truncate transition-opacity group-hover:opacity-80 sm:text-xl"
          >
            Velo
          </Heading>
          <Text variant="caption" className="truncate">
            Gym workout tracker
          </Text>
        </Link>
        <AppLink href="/dashboard" variant="outline" size="sm">
          Open dashboard
        </AppLink>
      </div>
    </header>
  );
}
