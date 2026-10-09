import { describe, expect, it } from "vitest";
import { getPrismaClient } from "@kivro/database";
import {
  createNetsonsDurableWorkPort,
  DURABLE_WORK_KIND,
  processNetsonsDurableWorkBatch,
} from "./durable-work-db-port.js";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.runIf(hasDb)("Netsons durable work (PostgreSQL)", () => {
  it("enqueues idempotently and processes bounded batches", async () => {
    const prisma = getPrismaClient();
    const port = createNetsonsDurableWorkPort(prisma);
    const jobId = `m20-test-${Date.now()}`;
    await port.scheduleJobPromotion({
      jobId,
      runAt: new Date().toISOString(),
    });
    await port.scheduleJobPromotion({
      jobId,
      runAt: new Date().toISOString(),
    });
    const rows = await prisma.durableWorkItem.findMany({
      where: { kind: DURABLE_WORK_KIND.JOB_PROMOTION, idempotencyKey: `job-promotion:${jobId}` },
    });
    expect(rows).toHaveLength(1);

    const batch = await processNetsonsDurableWorkBatch(prisma, 10);
    expect(batch.claimed).toBeGreaterThanOrEqual(1);
    expect(batch.completed).toBeGreaterThanOrEqual(1);

    await prisma.durableWorkItem.deleteMany({
      where: { idempotencyKey: `job-promotion:${jobId}` },
    });
  });
});
