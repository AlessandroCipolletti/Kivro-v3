import type { PolicyDecision } from "./types.js";

/** Master Spec §17 — arbitrary browser jobs are not supported in MVP. */
export function evaluateBrowserJobRequest(): PolicyDecision {
  return { allowed: false, reason: "browser jobs not supported in MVP" };
}
