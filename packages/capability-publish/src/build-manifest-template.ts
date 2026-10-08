import type { WorkerManifest } from "@kivro/contracts";

const PLACEHOLDER = "00000000-0000-0000-0000-000000000000";

export function buildWorkerManifestTemplate(input: {
  skills: Array<{ name: string; contentHash: string }>;
  toolAllow?: string[];
}): WorkerManifest {
  return {
    manifestVersion: 1,
    workerId: PLACEHOLDER,
    capabilityVersionId: PLACEHOLDER,
    runtime: {
      type: "openclaw",
      supportedVersionRange: ">=2026.8.0",
    },
    skills: input.skills,
    tools: {
      allow: input.toolAllow ?? [],
      deny: ["browser", "gateway", "nodes", "cron"],
    },
    resources: [],
    network: {
      default: "deny",
      allow: [],
    },
    limits: {
      timeoutSeconds: 120,
      memoryMb: 1024,
      cpu: 1,
      maxPids: 128,
      maxInputBytes: 10_485_760,
      maxOutputBytes: 52_428_800,
    },
  };
}
