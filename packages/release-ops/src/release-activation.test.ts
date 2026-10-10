import { describe, expect, it } from "vitest";
import { evaluateReleaseActivation } from "./release-activation.js";

const baseManifest = {
  generatedAt: new Date().toISOString(),
  gitCommit: "abc123def4567890",
  exactReleaseId: "kivro@abc123def456",
  cloudReleaseChannel: "mvp",
  apiContractVersion: "v1-mvp",
  workerProtocolMin: 1,
  workerProtocolMax: 1,
  capabilityManifestSchemaVersion: 1,
  databaseSchemaRevision: "20260410140000",
  schemaRolloutPhase: "contract" as const,
  workerReleaseChannel: "stable",
  workerMinSupportedVersion: "0.0.0-m07",
  workerLatestSupportedVersion: "0.0.0-m07",
  adapterProfiles: {
    netsons: { revision: "cloud-netsons@workspace" },
    aws: { revision: "cloud-aws@workspace" },
  },
  parityReportPath: "docs/audits/M24-provider-parity-report.json",
  conformanceManifestPath: "tests/fixtures/backend-conformance-manifest.json",
  performanceEnvelopePath: "docs/audits/M27-performance-envelope.json",
  operationalAlarmsPath: "docs/audits/M27-operational-alarms.json",
};

describe("release activation gate (M27 / HARD-027)", () => {
  it("M27-GOLD-003 accepts complete activation evidence", () => {
    const r = evaluateReleaseActivation({
      manifest: baseManifest,
      parityReport: { parityAsserted: true, profiles: { netsons: {}, aws: {} } },
      conformanceManifest: { profiles: { netsons: {}, aws: {} } },
      m25HarnessComplete: true,
      m26HarnessComplete: true,
      performanceEnvelopeValid: true,
    });
    expect(r.ok).toBe(true);
  });

  it("M27-GOLD-002 rejects mismatched exactReleaseId", () => {
    const r = evaluateReleaseActivation({
      manifest: { ...baseManifest, exactReleaseId: "kivro@wrong000000" },
      parityReport: { parityAsserted: true, profiles: { netsons: {}, aws: {} } },
      conformanceManifest: { profiles: { netsons: {}, aws: {} } },
      m25HarnessComplete: true,
      m26HarnessComplete: true,
      performanceEnvelopeValid: true,
    });
    expect(r.ok).toBe(false);
  });

  it("M27-GOLD-007 rejects apiContractVersion drift in parity report", () => {
    const r = evaluateReleaseActivation({
      manifest: baseManifest,
      parityReport: {
        parityAsserted: true,
        profiles: { netsons: {}, aws: {} },
        apiContractVersion: "v2-wrong",
      },
      conformanceManifest: { profiles: { netsons: {}, aws: {} }, apiContractVersion: "v1-mvp" },
      m25HarnessComplete: true,
      m26HarnessComplete: true,
      performanceEnvelopeValid: true,
    });
    expect(r.ok).toBe(false);
  });

  it("M27-GOLD-002 rejects missing parity assertion", () => {
    const r = evaluateReleaseActivation({
      manifest: baseManifest,
      parityReport: { parityAsserted: false, profiles: { netsons: {}, aws: {} } },
      conformanceManifest: { profiles: { netsons: {}, aws: {} } },
      m25HarnessComplete: true,
      m26HarnessComplete: true,
      performanceEnvelopeValid: true,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reasons.some((x) => x.includes("parity"))).toBe(true);
    }
  });
});
