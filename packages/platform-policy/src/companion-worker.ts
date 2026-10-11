/** Sources the companion may read. Nothing here is a write credential. */
export const READ_ONLY_DISCOVERY_SOURCES = [
  "proprietary_read_only_database",
  "selected_local_files",
  "private_configuration",
] as const;

export function discoveryAccessMode(): "read_only" {
  return "read_only";
}

export function configurationAccessMode(): "read_only" {
  return "read_only";
}

export function buyerStartsOnWebMarketplace(channel: string): boolean {
  return channel === "web_marketplace";
}

/** Resources stay unselected until the seller turns them on. */
export function explicitMinimumSubset<T extends { selected: boolean }>(resources: T[]): T[] {
  return resources.filter((resource) => resource.selected);
}

/** A finished job returns declared output keys and approved metadata, nothing else. */
export function projectDeclaredResult(
  output: Record<string, unknown>,
  declaredOutputKeys: string[],
  approvedMetadataKeys: string[],
): Record<string, unknown> {
  const allowed = new Set([...declaredOutputKeys, ...approvedMetadataKeys]);
  const projected: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(output)) {
    if (allowed.has(key)) {
      projected[key] = value;
    }
  }
  return projected;
}

export type CompanionPublication = {
  discoveryMode: "read_only" | "write";
  scanShown: boolean;
  resources: Array<{ id: string; selected: boolean }>;
  workerConfigId: string;
  personalConfigId: string;
  credentialStore: "worker" | "personal_openclaw";
  connection: "outbound" | "inbound";
  receivesPaidJobs: boolean;
  runtime: "restricted_sandbox" | "host";
  output: Record<string, unknown>;
  declaredOutputKeys: string[];
  approvedMetadataKeys: string[];
  auditRecorded: boolean;
  buyerChannel: string;
};

/** §1 — the companion publishes only when all ten boundaries hold. */
export function acceptCompanionPublication(input: CompanionPublication): {
  ok: boolean;
  reasons: string[];
  result: Record<string, unknown>;
} {
  const reasons: string[] = [];
  if (input.discoveryMode !== discoveryAccessMode()) {
    reasons.push("discovery");
  }
  if (!input.scanShown) {
    reasons.push("scan");
  }
  if (explicitMinimumSubset(input.resources).some((resource) => !resource.selected)) {
    reasons.push("subset");
  }
  if (!input.workerConfigId || input.workerConfigId === input.personalConfigId) {
    reasons.push("separate_config");
  }
  if (input.credentialStore !== "worker") {
    reasons.push("credentials");
  }
  if (input.connection !== "outbound") {
    reasons.push("connection");
  }
  if (!input.receivesPaidJobs) {
    reasons.push("paid_jobs");
  }
  if (input.runtime !== "restricted_sandbox") {
    reasons.push("runtime");
  }
  if (!input.auditRecorded) {
    reasons.push("audit");
  }
  if (!buyerStartsOnWebMarketplace(input.buyerChannel)) {
    reasons.push("buyer_channel");
  }
  const result = projectDeclaredResult(input.output, input.declaredOutputKeys, input.approvedMetadataKeys);
  return { ok: reasons.length === 0, reasons, result };
}
