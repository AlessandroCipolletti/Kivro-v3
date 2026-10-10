/** §533 — unified buyer/marketplace status labels and semantic variants. */

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

/** Hour-and-minute wait. Seconds would look more precise than the schedule is. */
export function approximateStartLabel(now: Date, nextAvailableAt: Date): string {
  const minutes = Math.max(1, Math.round((nextAvailableAt.getTime() - now.getTime()) / 60_000));
  if (minutes < 60) {
    return `Starts in approximately ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? `Starts in approximately ${hours}h`
    : `Starts in approximately ${hours}h ${rest}m`;
}

/** Buyer-local clock without seconds. The seller schedule stays in its own timezone. */
export function formatBuyerLocalTime(iso: string, timeZone: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return null;
  }
}

export function marketplaceAvailabilityUi(input: {
  status?: string;
  accepting?: boolean;
  cardLabel?: string | null;
}): { label: string; variant: StatusVariant; dotLabel: string } {
  const status = input.status ?? "UNKNOWN";
  if (input.cardLabel && status === "SCHEDULED_OFFLINE") {
    return { label: input.cardLabel, variant: "info", dotLabel: "Scheduled" };
  }
  if (status === "OFFLINE") {
    return { label: "Provider offline", variant: "neutral", dotLabel: "Offline" };
  }
  if (status === "SECURITY_BLOCKED") {
    return { label: "Unavailable", variant: "danger", dotLabel: "Blocked" };
  }
  if (status === "PAUSED") {
    return { label: "Temporarily paused", variant: "warning", dotLabel: "Paused" };
  }
  if (input.accepting === false && status !== "SCHEDULED_OFFLINE") {
    return { label: "Not accepting", variant: "warning", dotLabel: "Paused" };
  }
  switch (status) {
    case "ONLINE":
      return { label: "Available now", variant: "success", dotLabel: "Available" };
    case "BUSY":
      return { label: "Busy", variant: "warning", dotLabel: "Busy" };
    case "SCHEDULED_OFFLINE":
      return { label: input.cardLabel ?? "Eligible to start later", variant: "info", dotLabel: "Scheduled" };
    case "OFFLINE":
      return { label: "Provider offline", variant: "neutral", dotLabel: "Offline" };
    default:
      return { label: "Unknown", variant: "neutral", dotLabel: "Unknown" };
  }
}

export function buyerJobStatusUi(buyerVisibleLabel: string, rawStatus?: string): StatusVariant {
  const label = buyerVisibleLabel.toLowerCase();
  if (label.includes("complete")) {
    return "success";
  }
  if (label.includes("fail") || label.includes("reject") || label.includes("expired")) {
    return "danger";
  }
  if (label.includes("cancel")) {
    return "neutral";
  }
  if (label.includes("run") || label.includes("start") || rawStatus === "RUNNING") {
    return "info";
  }
  if (label.includes("queue") || label.includes("schedule") || label.includes("wait")) {
    return "warning";
  }
  return "neutral";
}

export function sellerHealthUi(healthLabel: string): StatusVariant {
  const h = healthLabel.toLowerCase();
  if (h.includes("critical") || h.includes("blocked")) {
    return "danger";
  }
  if (h.includes("warning") || h.includes("degraded")) {
    return "warning";
  }
  if (h.includes("healthy") || h.includes("online")) {
    return "success";
  }
  return "neutral";
}
