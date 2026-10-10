/** §425 — a paid job is accepted only when every layer passes. */
export type AvailabilityLayer = {
  layer:
    | "VISIBILITY"
    | "OPERATOR_CONTROL"
    | "SCHEDULE"
    | "DEVICE"
    | "SECURITY_READINESS"
    | "CAPACITY";
  passed: boolean;
};

const OPERATOR = [
  "NOT_PUBLISHED",
  "GLOBAL_DISPATCH_DISABLED",
  "PLATFORM_SECURITY_PAUSE",
  "EMERGENCY_PAUSE",
  "SELLER_MAINTENANCE",
  "MANUALLY_PAUSED",
];

function blocked(reasons: string[], codes: string[]): boolean {
  return codes.some((code) => reasons.includes(code));
}

export function describeAvailabilityLayers(input: {
  visibleToBuyer: boolean;
  reasons: string[];
}): AvailabilityLayer[] {
  return [
    { layer: "VISIBILITY", passed: input.visibleToBuyer },
    { layer: "OPERATOR_CONTROL", passed: !blocked(input.reasons, OPERATOR) },
    { layer: "SCHEDULE", passed: !blocked(input.reasons, ["SCHEDULE_CLOSED"]) },
    { layer: "DEVICE", passed: !blocked(input.reasons, ["WORKER_NOT_ONLINE"]) },
    { layer: "SECURITY_READINESS", passed: !blocked(input.reasons, ["SECURITY_NOT_READY"]) },
    { layer: "CAPACITY", passed: !blocked(input.reasons, ["CONCURRENCY_LIMIT"]) },
  ];
}

export function allAvailabilityLayersPass(layers: AvailabilityLayer[]): boolean {
  return layers.every((layer) => layer.passed);
}
