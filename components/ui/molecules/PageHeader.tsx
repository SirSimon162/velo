import { cn } from "@/lib/cn";
import { Heading } from "../atoms/Heading";
import { Text } from "../atoms/Text";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn(className)}>
      <Heading as="h2" variant="h3" className="font-sans font-bold">
        {title}
      </Heading>
      {description && (
        <Text variant="caption" className="mt-1">
          {description}
        </Text>
      )}
    </div>
  );
}
