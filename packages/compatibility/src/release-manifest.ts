import { KIVRO_COMPATIBILITY_MATRIX } from "./matrix.js";
import type { SchemaRolloutPhase, UnifiedReleaseManifest } from "./types.js";

export function buildUnifiedReleaseManifest(input: {
  gitCommit: string | null;
  schemaRolloutPhase: SchemaRolloutPhase;
  parityReportPath?: string;
  conformanceManifestPath?: string;
}): UnifiedReleaseManifest {
  const m = KIVRO_COMPATIBILITY_MATRIX;
  return {
    generatedAt: new Date().toISOString(),
    gitCommit: input.gitCommit,
    cloudReleaseChannel: m.cloudReleaseChannel,
    apiContractVersion: m.apiContractVersion,
    workerProtocolMin: m.workerProtocolMin,
    workerProtocolMax: m.workerProtocolMax,
    capabilityManifestSchemaVersion: m.capabilityManifestSchemaVersion,
    databaseSchemaRevision: m.database.schemaRevision,
    schemaRolloutPhase: input.schemaRolloutPhase,
    workerReleaseChannel: m.workerRelease.channel,
    workerMinSupportedVersion: m.workerRelease.minSupportedWorkerVersion,
    workerLatestSupportedVersion: m.workerRelease.latestSupportedWorkerVersion,
    adapterProfiles: {
      netsons: { revision: "cloud-netsons@workspace" },
      aws: { revision: "cloud-aws@workspace" },
    },
    parityReportPath: input.parityReportPath ?? "docs/audits/M24-provider-parity-report.json",
    conformanceManifestPath:
      input.conformanceManifestPath ?? "tests/fixtures/backend-conformance-manifest.json",
  };
}

export function validateUnifiedReleaseManifest(manifest: UnifiedReleaseManifest): {
  ok: true;
} | {
  ok: false;
  issues: string[];
} {
  const issues: string[] = [];
  const m = KIVRO_COMPATIBILITY_MATRIX;
  if (manifest.apiContractVersion !== m.apiContractVersion) {
    issues.push("apiContractVersion mismatch vs compatibility matrix");
  }
  if (
    manifest.workerProtocolMin !== m.workerProtocolMin ||
    manifest.workerProtocolMax !== m.workerProtocolMax
  ) {
    issues.push("worker protocol window mismatch");
  }
  if (manifest.workerMinSupportedVersion !== m.workerRelease.minSupportedWorkerVersion) {
    issues.push("worker min version mismatch");
  }
  return issues.length ? { ok: false, issues } : { ok: true };
}
