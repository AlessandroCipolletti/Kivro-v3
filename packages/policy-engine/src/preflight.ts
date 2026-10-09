import type { WorkerManifest } from "@kivro/contracts";
import { validateSandboxForManifest } from "@kivro/sandbox";
import { evaluateBrowserJobRequest } from "./browser.js";
import { evaluateToolAccess } from "./tools.js";
import type { PolicyDecision } from "./types.js";

export interface ExecutionPreflightResult {
  ok: boolean;
  issues: string[];
}

export function validateExecutionPreflight(manifest: WorkerManifest): ExecutionPreflightResult {
  const issues: string[] = [];
  const sandbox = validateSandboxForManifest(manifest);
  if (!sandbox.ok) {
    issues.push(...sandbox.issues);
  }
  const browser = evaluateBrowserJobRequest();
  if (browser.allowed) {
    issues.push("browser execution must remain disabled");
  }
  for (const tool of manifest.tools.allow) {
    const decision = evaluateToolAccess(manifest, tool);
    if (!decision.allowed && decision.reason) {
      issues.push(`tool ${tool}: ${decision.reason}`);
    }
  }
  return { ok: issues.length === 0, issues };
}

export function assertPolicyAllowed(decision: PolicyDecision): void {
  if (!decision.allowed) {
    throw new Error(decision.reason ?? "policy denied");
  }
}
