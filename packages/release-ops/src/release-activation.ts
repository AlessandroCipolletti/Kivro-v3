import type { UnifiedReleaseManifest } from "@kivro/compatibility";
import { expectedExactReleaseId } from "./release-evidence.js";

/** HARD-022 / HARD-027 — exact-release activation gates. */

export type ProviderParityReport = {
  parityAsserted?: boolean;
  profiles?: Record<string, unknown>;
  apiContractVersion?: string;
};

export type ConformanceManifest = {
  profiles?: Record<string, unknown>;
  apiContractVersion?: string;
};

export type ReleaseActivationEvidence = {
  manifest: UnifiedReleaseManifest;
  parityReport: ProviderParityReport;
  conformanceManifest: ConformanceManifest;
  m25HarnessComplete: boolean;
  m26HarnessComplete: boolean;
  performanceEnvelopeValid: boolean;
  requireExactGitCommit?: boolean;
  currentGitCommit?: string | null;
};

export function evaluateReleaseActivation(
  evidence: ReleaseActivationEvidence,
): { ok: true; exactReleaseId: string } | { ok: false; reasons: string[] } {
  const reasons: string[] = [];
  const { manifest } = evidence;

  if (!manifest.gitCommit) {
    reasons.push("manifest.gitCommit is required for activation");
  }
  if (!manifest.exactReleaseId) {
    reasons.push("manifest.exactReleaseId is required for activation");
  } else if (manifest.gitCommit && manifest.exactReleaseId !== expectedExactReleaseId(manifest.gitCommit)) {
    reasons.push("exactReleaseId does not match gitCommit-derived release identifier");
  }
  if (manifest.workerProtocolMin > manifest.workerProtocolMax) {
    reasons.push("worker protocol window is invalid");
  }
  if (evidence.requireExactGitCommit && evidence.currentGitCommit) {
    if (manifest.gitCommit !== evidence.currentGitCommit) {
      reasons.push("manifest gitCommit does not match current HEAD");
    }
  }
  if (evidence.parityReport.parityAsserted !== true) {
    reasons.push("provider parity report is not asserted");
  }
  const parityProfiles = Object.keys(evidence.parityReport.profiles ?? {});
  for (const required of ["netsons", "aws"]) {
    if (!parityProfiles.includes(required)) {
      reasons.push(`parity report missing profile ${required}`);
    }
  }
  const confProfiles = Object.keys(evidence.conformanceManifest.profiles ?? {});
  for (const required of ["netsons", "aws"]) {
    if (!confProfiles.includes(required)) {
      reasons.push(`conformance manifest missing profile ${required}`);
    }
  }
  if (!evidence.m25HarnessComplete) {
    reasons.push("M25 compatibility/Worker update harness is not complete");
  }
  if (!evidence.m26HarnessComplete) {
    reasons.push("M26 DR/fault harness is not complete");
  }
  if (
    evidence.parityReport.apiContractVersion &&
    evidence.parityReport.apiContractVersion !== manifest.apiContractVersion
  ) {
    reasons.push("parity report apiContractVersion mismatch vs release manifest");
  }
  if (
    evidence.conformanceManifest.apiContractVersion &&
    evidence.conformanceManifest.apiContractVersion !== manifest.apiContractVersion
  ) {
    reasons.push("conformance manifest apiContractVersion mismatch vs release manifest");
  }
  if (!evidence.performanceEnvelopeValid) {
    reasons.push("performance envelope validation failed");
  }
  if (!manifest.parityReportPath || !manifest.conformanceManifestPath) {
    reasons.push("manifest must reference parity and conformance evidence paths");
  }
  if (!manifest.performanceEnvelopePath || !manifest.operationalAlarmsPath) {
    reasons.push("manifest must reference performance envelope and operational alarms paths");
  }
  const adapterRevisions = Object.values(manifest.adapterProfiles ?? {});
  if (adapterRevisions.length < 2) {
    reasons.push("manifest must declare both adapter profiles");
  }

  if (reasons.length > 0) {
    return { ok: false, reasons };
  }
  return { ok: true, exactReleaseId: manifest.exactReleaseId! };
}
