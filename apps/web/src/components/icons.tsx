/** §542 — single coherent stroke icon family (inline SVG). */

type IconProps = { className?: string; size?: number };

function base(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export function IconKey({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </svg>
  );
}

export function IconWebhook({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3v3M6 6l2 2M18 6l-2 2" />
      <path d="M5 13a7 7 0 0 0 14 0" />
      <path d="M12 13v8" />
    </svg>
  );
}

export function IconSettings({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function IconCheck({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M5 12l4 4L19 6" />
    </svg>
  );
}

export function IconCopy({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconAlert({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 8v5M12 17h.01" />
      <path d="M10.3 4.5h3.4L21 19H3L10.3 4.5z" />
    </svg>
  );
}
