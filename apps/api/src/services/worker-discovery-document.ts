import {
  buildDualProfileControlPlaneAdvertisements,
  buildWorkerServiceDiscoveryDocument,
} from "@kivro/cloud-core";
import { PROTOCOL_VERSION } from "@kivro/contracts";

/** Unified discovery for backend transition (PORT-021, ARCH-UNI-022). */
export function buildApiWorkerDiscoveryDocument(publicApiBaseUrl: string) {
  const base = publicApiBaseUrl.replace(/\/$/, "");
  return buildWorkerServiceDiscoveryDocument({
    protocolVersion: PROTOCOL_VERSION,
    publicApiBaseUrl: base,
    controlPlanes: buildDualProfileControlPlaneAdvertisements(base, process.env),
  });
}
