import type { PrismaClient } from "@kivro/database";
import { runCloudMaintenanceSweeps } from "@kivro/cloud-core";
import { NETSONS_DEFAULT_BATCH_LIMITS } from "./netsons-bounds.js";

/** HOST-NET-019/024/592 — payment and job maintenance without queue daemons. */
export async function runNetsonsMaintenanceSweeps(prisma: PrismaClient) {
  return runCloudMaintenanceSweeps(prisma, {
    paymentReservationSweep: NETSONS_DEFAULT_BATCH_LIMITS.paymentReservationSweep,
  });
}
