import type { PrismaClient } from "@kivro/database";
import { runCloudMaintenanceSweeps } from "@kivro/cloud-core";
import { AWS_DEFAULT_BATCH_LIMITS } from "./aws-bounds.js";

export async function runAwsMaintenanceSweeps(prisma: PrismaClient) {
  return runCloudMaintenanceSweeps(prisma, {
    paymentReservationSweep: AWS_DEFAULT_BATCH_LIMITS.paymentReservationSweep,
  });
}
