import type { WorkerManifest } from "@kivro/contracts";
import { MARKETPLACE_SANDBOX_BASELINE } from "./baseline.js";

export interface SandboxValidationResult {
  ok: boolean;
  issues: string[];
  effectiveMode: "all" | "unknown";
}

export function validateSandboxForManifest(manifest: WorkerManifest): SandboxValidationResult {
  const issues: string[] = [];
  if (manifest.tools.allow.includes("browser") || manifest.tools.allow.includes("gateway")) {
    issues.push("browser/gateway tools cannot be allow-listed for marketplace jobs");
  }
  if (manifest.network.default !== "deny") {
    issues.push("network.default must be deny");
  }
  if (manifest.limits.memoryMb > 1024) {
    issues.push("memory limit exceeds marketplace ceiling");
  }
  if (manifest.limits.maxPids > MARKETPLACE_SANDBOX_BASELINE.docker.pidsLimit) {
    issues.push("pids limit exceeds marketplace baseline");
  }
  return {
    ok: issues.length === 0,
    issues,
    effectiveMode: issues.length === 0 ? "all" : "unknown",
  };
}
