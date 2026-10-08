import type { CapabilityPackage } from "@kivro/contracts";
import {
  parseCapabilityContract,
  parseDependencyGraph,
  parseInferenceDependency,
  parsePublicPermissionManifest,
  parseWorkerManifest,
} from "@kivro/contracts";
import type { CapabilityVersion } from "@kivro/database";

export function buildCapabilityPackageFromVersion(
  version: CapabilityVersion,
  contract: unknown,
): CapabilityPackage {
  const workerManifest = parseWorkerManifest(version.workerManifest);
  const dependencyGraph = parseDependencyGraph(version.dependencyGraphSnapshot);
  const permissions = parsePublicPermissionManifest(version.permissionManifest);
  const parsedContract = parseCapabilityContract(contract);
  const inference = parseInferenceDependency(version.inferenceDependency);

  return {
    packageVersion: 1,
    manifest: workerManifest,
    dependencyGraph,
    permissions,
    contract: parsedContract,
    runtime: { inference },
    pricing: {
      priceTierCents: version.priceSnapshotCents,
      currency: "USD",
    },
  };
}
