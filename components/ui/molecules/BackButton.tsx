"use client";

import { IconChevronLeft } from "../icons";
import { Button } from "../atoms/Button";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = "Back" }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      className="-ml-2 gap-1 px-2"
      onClick={onClick}
    >
      <IconChevronLeft size={18} />
      {label}
    </Button>
  );
}
