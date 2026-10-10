/** §533 — unified buyer/marketplace status labels and semantic variants. */

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

export function marketplaceAvailabilityUi(input: {
  status?: string;
  accepting?: boolean;
}): { label: string; variant: StatusVariant; dotLabel: string } {
  const status = input.status ?? "UNKNOWN";
  if (status === "OFFLINE") {
    return { label: "Provider offline", variant: "neutral", dotLabel: "Offline" };
  }
  if (status === "PAUSED") {
    return { label: "Temporarily paused", variant: "warning", dotLabel: "Paused" };
  }
  if (input.accepting === false) {
    return { label: "Not accepting", variant: "warning", dotLabel: "Paused" };
  }
  switch (status) {
    case "ONLINE":
      return { label: "Available now", variant: "success", dotLabel: "Available" };
    case "BUSY":
      return { label: "Busy", variant: "warning", dotLabel: "Busy" };
    case "SCHEDULED_OFFLINE":
      return { label: "Schedulable", variant: "info", dotLabel: "Scheduled" };
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
