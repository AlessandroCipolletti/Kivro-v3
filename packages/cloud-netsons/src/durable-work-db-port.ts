import type { PrismaClient } from "@kivro/database";
import {
  createPostgresDurableWorkPort,
  DURABLE_WORK_KIND,
  processPostgresDurableWorkBatch,
  type ProcessDurableWorkResult,
} from "@kivro/cloud-core";

export { DURABLE_WORK_KIND };
export type { ProcessDurableWorkResult };

/** HOST-NET-010 — PostgreSQL durable work with idempotent enqueue. */
export function createNetsonsDurableWorkPort(prisma: PrismaClient) {
  return createPostgresDurableWorkPort(prisma, "netsons-db-cron");
}

export const processNetsonsDurableWorkBatch = processPostgresDurableWorkBatch;
