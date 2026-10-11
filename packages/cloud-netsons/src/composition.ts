import type { PrismaClient } from "@kivro/database";
import {
  SHARED_API_CONTRACT_VERSION,
  createInMemoryDurableWorkStub,
  type KivroCloudComposition,
} from "@kivro/cloud-core";
import { PROTOCOL_VERSION } from "@kivro/contracts";
import { NETSONS_DEFAULT_CONTROL_PLANE_ID } from "@kivro/cloud-core";
import { createPollingWorkerTransport } from "@kivro/worker-transport";
import { createNetsonsDurableWorkPort } from "./durable-work-db-port.js";

export const CLOUD_PROFILE = "netsons" as const;
export const DEFAULT_WORKER_TRANSPORT = "polling" as const;
export { NETSONS_DEFAULT_CONTROL_PLANE_ID };

export function createNetsonsComposition(input?: {
  controlPlaneId?: string;
  workerDeviceId?: string;
  cloudBaseUrl?: string;
  prisma?: PrismaClient;
}): KivroCloudComposition {
  const controlPlaneId = input?.controlPlaneId ?? NETSONS_DEFAULT_CONTROL_PLANE_ID;
  const workerDeviceId = input?.workerDeviceId ?? "worker-placeholder";
  const cloudBaseUrl = input?.cloudBaseUrl ?? process.env.KIVRO_CLOUD_URL ?? "http://localhost:3007";
  const durableWork = input?.prisma
    ? createNetsonsDurableWorkPort(input.prisma)
    : createInMemoryDurableWorkStub("netsons-db-cron");
  return {
    profile: CLOUD_PROFILE,
    apiContractVersion: SHARED_API_CONTRACT_VERSION,
    workerProtocolVersion: PROTOCOL_VERSION,
    workerTransport: createPollingWorkerTransport({ controlPlaneId, workerDeviceId, cloudBaseUrl }),
    durableWorkProfile: "netsons-db-cron",
    durableWork,
    objectStorageProfile: "s3-compatible",
  };
}
