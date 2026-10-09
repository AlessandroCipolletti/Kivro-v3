import {
  SHARED_API_CONTRACT_VERSION,
  type KivroCloudComposition,
} from "@kivro/cloud-core";
import { PROTOCOL_VERSION } from "@kivro/contracts";
import { createWssWorkerTransport } from "@kivro/worker-transport";

export const CLOUD_PROFILE = "aws" as const;
export const DEFAULT_WORKER_TRANSPORT = "wss" as const;

export function createAwsComposition(input?: {
  controlPlaneId?: string;
  workerDeviceId?: string;
  wssUrl?: string;
}): KivroCloudComposition {
  const controlPlaneId = input?.controlPlaneId ?? "aws-default";
  const workerDeviceId = input?.workerDeviceId ?? "worker-placeholder";
  const base = process.env.KIVRO_CLOUD_URL ?? "https://api.kivro.example";
  const wssUrl = input?.wssUrl ?? `${base.replace(/^http/, "ws")}/worker/wss`;
  return {
    profile: CLOUD_PROFILE,
    apiContractVersion: SHARED_API_CONTRACT_VERSION,
    workerProtocolVersion: PROTOCOL_VERSION,
    workerTransport: createWssWorkerTransport({ controlPlaneId, workerDeviceId, wssUrl }),
    durableWorkProfile: "aws-managed-queue",
    objectStorageProfile: "aws-s3",
  };
}
