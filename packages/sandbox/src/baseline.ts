/** Master Spec §21 — mandatory marketplace OpenClaw sandbox posture (pinned fields). */
export const MARKETPLACE_SANDBOX_BASELINE = {
  baselineVersion: 1 as const,
  mode: "all" as const,
  backend: "docker" as const,
  scope: "session" as const,
  workspaceAccess: "none" as const,
  docker: {
    readOnlyRoot: true,
    network: "none" as const,
    capDrop: ["ALL"] as const,
    pidsLimit: 128,
    memory: "1g",
    memorySwap: "1g",
    cpus: 1,
    tmpfs: ["/tmp", "/var/tmp", "/run"] as const,
  },
};

export type MarketplaceSandboxBaseline = typeof MARKETPLACE_SANDBOX_BASELINE;
