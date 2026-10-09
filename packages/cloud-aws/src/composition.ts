import type { PrismaClient } from "@kivro/database";
import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  SHARED_API_CONTRACT_VERSION,
  createInMemoryDurableWorkStub,
  type KivroCloudComposition,
} from "@kivro/cloud-core";
import { PROTOCOL_VERSION } from "@kivro/contracts";
import { createWssWorkerTransport } from "@kivro/worker-transport";
import { createAwsDurableWorkPort } from "./durable-work-port.js";

export const CLOUD_PROFILE = "aws" as const;
export const DEFAULT_WORKER_TRANSPORT = "wss" as const;
export { AWS_DEFAULT_CONTROL_PLANE_ID };

export function createAwsComposition(input?: {
  controlPlaneId?: string;
  workerDeviceId?: string;
  wssUrl?: string;
  prisma?: PrismaClient;
}): KivroCloudComposition {
  const controlPlaneId = input?.controlPlaneId ?? AWS_DEFAULT_CONTROL_PLANE_ID;
  const workerDeviceId = input?.workerDeviceId ?? "worker-placeholder";
  const base = process.env.KIVRO_CLOUD_URL ?? "https://api.kivro.example";
  const wssUrl = input?.wssUrl ?? `${base.replace(/^http/, "ws")}/worker/wss`;
  const durableWork = input?.prisma
    ? createAwsDurableWorkPort(input.prisma)
    : createInMemoryDurableWorkStub("aws-managed-queue");
  return {
    profile: CLOUD_PROFILE,
    apiContractVersion: SHARED_API_CONTRACT_VERSION,
    workerProtocolVersion: PROTOCOL_VERSION,
    workerTransport: createWssWorkerTransport({ controlPlaneId, workerDeviceId, wssUrl }),
    durableWorkProfile: "aws-managed-queue",
    durableWork,
    objectStorageProfile: "aws-s3",
  };
}
