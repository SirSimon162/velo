import { appShellClass } from "@/lib/app-shell";
import { cn } from "@/lib/cn";
import { AppLink, Heading, Text } from "@/components/ui";

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-border-subtle py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 hero-spotlight opacity-50"
        aria-hidden
      />
      <div className={cn(appShellClass, "relative text-center")}>
        <Heading variant="display" className="mx-auto max-w-2xl">
          Ready to log your next session?
        </Heading>
        <Text variant="bodySm" className="mx-auto mt-4 max-w-lg">
          No signup, no sync — open the dashboard and start with a quick
          session or a saved program.
        </Text>
        <div className="mt-8">
          <AppLink href="/dashboard" size="lg" className="hero-cta-glow">
            Open dashboard
          </AppLink>
        </div>
      </div>
    </section>
  );
}
