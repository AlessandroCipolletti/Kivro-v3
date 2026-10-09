import type { WorkerManifest } from "@kivro/contracts";
import type { PolicyDecision } from "./types.js";

const MARKETPLACE_FORBIDDEN_TOOLS = new Set(["browser", "gateway", "nodes", "cron"]);

export function evaluateToolAccess(manifest: WorkerManifest, toolName: string): PolicyDecision {
  const name = toolName.trim();
  if (!name) {
    return { allowed: false, reason: "empty tool name" };
  }
  if (MARKETPLACE_FORBIDDEN_TOOLS.has(name)) {
    return { allowed: false, reason: "tool forbidden for marketplace execution" };
  }
  if (manifest.tools.deny.includes(name)) {
    return { allowed: false, reason: "tool explicitly denied in manifest" };
  }
  if (manifest.tools.allow.length === 0) {
    return { allowed: false, reason: "no tools allow-listed" };
  }
  if (!manifest.tools.allow.includes(name)) {
    return { allowed: false, reason: "tool not in manifest allow list" };
  }
  return { allowed: true };
}
