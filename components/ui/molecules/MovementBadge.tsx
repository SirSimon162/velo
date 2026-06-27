import { Badge } from "../atoms/Badge";
import {
  getMovementBadgeClass,
  getMovementLabel,
} from "@/lib/movement";
import { cn } from "@/lib/cn";

interface MovementBadgeProps {
  movement: string;
  className?: string;
}

export function MovementBadge({ movement, className }: MovementBadgeProps) {
  return (
    <Badge
      movementClass={getMovementBadgeClass(movement)}
      className={cn("border font-medium", className)}
    >
      {getMovementLabel(movement)}
    </Badge>
  );
}
