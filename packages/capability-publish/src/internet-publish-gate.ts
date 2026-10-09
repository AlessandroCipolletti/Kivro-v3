import type { WorkerManifest } from "@kivro/contracts";
import {
  clampInternetResearchPolicy,
  validateInternetResearchPolicy,
} from "@kivro/research-broker";

/** §272 — validate/clamp internet policy stored on immutable worker manifest. */
export function validateInternetPolicyForPublish(manifest: WorkerManifest): {
  ok: boolean;
  issues: string[];
  manifest: WorkerManifest;
} {
  if (!manifest.internet) {
    return { ok: true, issues: [], manifest };
  }
  const validation = validateInternetResearchPolicy(manifest.internet);
  if (!validation.ok) {
    return { ok: false, issues: validation.issues, manifest };
  }
  const clamped = clampInternetResearchPolicy(manifest.internet);
  return {
    ok: true,
    issues: [],
    manifest: { ...manifest, internet: clamped },
  };
}
