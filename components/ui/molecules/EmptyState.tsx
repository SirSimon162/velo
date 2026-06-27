import type { ReactNode } from "react";
import { Card } from "../atoms/Card";
import { Text } from "../atoms/Text";

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <Card variant="dashed" padding="lg" className="text-center">
      <Text variant="faint">{message}</Text>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
