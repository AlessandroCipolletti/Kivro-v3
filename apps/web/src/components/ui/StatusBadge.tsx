import type { StatusVariant } from "@/lib/status-ui";

const variantClass: Record<StatusVariant, string> = {
  success: "status-badge--success",
  warning: "status-badge--warning",
  danger: "status-badge--danger",
  info: "status-badge--info",
  neutral: "status-badge--neutral",
};

export function StatusBadge(props: {
  label: string;
  variant?: StatusVariant;
  dotLabel?: string;
}) {
  const variant = props.variant ?? "neutral";
  return (
    <span className={`status-badge ${variantClass[variant]}`}>
      <span className="status-badge__dot" aria-hidden />
      <span>{props.label}</span>
      {props.dotLabel && props.dotLabel !== props.label && (
        <span className="visually-hidden"> ({props.dotLabel})</span>
      )}
    </span>
  );
}
