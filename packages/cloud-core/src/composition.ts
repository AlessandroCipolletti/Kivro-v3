import { PROTOCOL_VERSION } from "@kivro/contracts";
import type { DurableWorkPort } from "./durable-work-port.js";
import { createInMemoryDurableWorkStub } from "./durable-work-port.js";
import type { WorkerTransportPort } from "./ports.js";

/** Single public API contract revision for all profiles (ARCH-UNI-011). */
export const SHARED_API_CONTRACT_VERSION = "v1-mvp" as const;

export type CloudProfileId = "netsons" | "aws";

export type DurableWorkProfile = "netsons-db-cron" | "aws-managed-queue";
export type ObjectStorageProfile = "s3-compatible" | "aws-s3";

/** Provider composition root descriptor — shared app, profile-specific adapters (ARCH-UNI-001..003). */
export interface KivroCloudComposition {
  profile: CloudProfileId;
  apiContractVersion: typeof SHARED_API_CONTRACT_VERSION;
  workerProtocolVersion: typeof PROTOCOL_VERSION;
  workerTransport: WorkerTransportPort;
  durableWorkProfile: DurableWorkProfile;
  durableWork: DurableWorkPort;
  objectStorageProfile: ObjectStorageProfile;
}

export function attachDurableWorkPort(
  composition: Omit<KivroCloudComposition, "durableWork">,
): KivroCloudComposition {
  const profile =
    composition.durableWorkProfile === "netsons-db-cron"
      ? "netsons-db-cron"
      : "aws-managed-queue";
  return {
    ...composition,
    durableWork: createInMemoryDurableWorkStub(profile),
  };
}

export function assertCompositionParity(
  netsons: KivroCloudComposition,
  aws: KivroCloudComposition,
): void {
  if (netsons.apiContractVersion !== aws.apiContractVersion) {
    throw new Error("API contract drift between composition roots");
  }
  if (netsons.workerProtocolVersion !== aws.workerProtocolVersion) {
    throw new Error("Worker Protocol version drift between composition roots");
  }
}
