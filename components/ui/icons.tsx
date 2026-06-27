import { cn } from "@/lib/cn";

export interface IconProps {
  className?: string;
  size?: number;
}

const defaults = { size: 18, className: "" };

function base({ className, size }: IconProps) {
  return {
    className: cn("shrink-0", className),
    width: size ?? defaults.size,
    height: size ?? defaults.size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconChevronUp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconList(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconDumbbell(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.5 6a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5Z" />
      <path d="M17.5 13a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5Z" />
      <path d="M8.5 8.5h7M9 13.5h6" />
    </svg>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 2 8 4.5v7L12 18l-8-4.5v-7L12 2z" />
      <path d="m12 12 8-4.5M12 12v6M12 12 4 7.5" />
    </svg>
  );
}

export function IconBookmark(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10 0a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 5v14l11-7L5 5z" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconStar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
