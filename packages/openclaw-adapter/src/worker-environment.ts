import type { WorkerManifest } from "@kivro/contracts";
import {
  MARKETPLACE_SANDBOX_BASELINE,
  buildDockerSandboxSpec,
  mergeSandboxConfig,
} from "@kivro/sandbox";
import fs from "node:fs";
import path from "node:path";
import type { WorkerEnvironment } from "./types.js";

export function marketplaceConfigPayload(manifest: WorkerManifest): Record<string, unknown> {
  return {
    baselineVersion: MARKETPLACE_SANDBOX_BASELINE.baselineVersion,
    sandbox: mergeSandboxConfig(),
    dockerSpec: buildDockerSandboxSpec(manifest),
    manifest: {
      tools: manifest.tools,
      network: manifest.network,
      resources: manifest.resources,
      limits: manifest.limits,
      skills: manifest.skills.map((s) => ({ name: s.name, contentHash: s.contentHash })),
    },
  };
}

export function writeMarketplaceWorkerEnvironment(
  runtimeRoot: string,
  manifest: WorkerManifest,
): WorkerEnvironment {
  const configDir = path.join(runtimeRoot, "marketplace", manifest.capabilityVersionId);
  const workspaceRoot = path.join(configDir, "workspace");
  fs.mkdirSync(workspaceRoot, { recursive: true });
  const configPath = path.join(configDir, "openclaw.marketplace.json");
  fs.writeFileSync(configPath, `${JSON.stringify(marketplaceConfigPayload(manifest), null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  return { configPath, workspaceRoot };
}
