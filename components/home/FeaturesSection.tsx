import { appShellClass } from "@/lib/app-shell";
import { Card, Heading, Text } from "@/components/ui";
import {
  IconBookmark,
  IconClock,
  IconDumbbell,
  IconLayers,
  IconPlay,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const features = [
  {
    icon: IconDumbbell,
    title: "Exercises",
    description:
      "Browse the full library, filter by movement, equipment, or muscle, and multi-select into a session.",
  },
  {
    icon: IconLayers,
    title: "Programs",
    description:
      "Build multi-day splits with muscle balance checks and drag-to-reorder days.",
  },
  {
    icon: IconBookmark,
    title: "Workouts",
    description:
      "Save exercise lists as reusable templates for days you repeat often.",
  },
  {
    icon: IconPlay,
    title: "Train",
    description:
      "Start a program day or saved workout in one tap when you are ready to go.",
  },
  {
    icon: IconClock,
    title: "History",
    description:
      "Review sessions, weekly volume, personal records, and a muscle coverage heatmap.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border-subtle py-16 sm:py-20">
      <div className={cn(appShellClass, "space-y-10")}>
        <div className="max-w-2xl">
          <Heading variant="display">What you get in the app</Heading>
          <Text variant="bodySm" className="mt-4">
            Five tabs, one workflow — pick exercises, build structure, train,
            and track progress. Everything stays on your device.
          </Text>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              padding="sm"
              className="space-y-3 border-border-muted bg-surface-muted/80"
            >
              <feature.icon size={20} className="text-accent-text" />
              <Heading as="h3" variant="h4">
                {feature.title}
              </Heading>
              <Text variant="bodySm">{feature.description}</Text>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
