import { describe, expect, it } from "vitest";
import { getPrismaClient } from "@kivro/database";
import { DURABLE_WORK_KIND } from "@kivro/cloud-core";
import { createAwsDurableWorkPort, processAwsDurableWorkBatch } from "./durable-work-port.js";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.runIf(hasDb)("AWS durable work (PostgreSQL authoritative)", () => {
  it("enqueues idempotently with aws-managed-queue profile", async () => {
    const prisma = getPrismaClient();
    const port = createAwsDurableWorkPort(prisma);
    expect(port.profile).toBe("aws-managed-queue");
    const jobId = `m21-test-${Date.now()}`;
    await port.scheduleJobPromotion({ jobId, runAt: new Date().toISOString() });
    await port.scheduleJobPromotion({ jobId, runAt: new Date().toISOString() });
    const rows = await prisma.durableWorkItem.findMany({
      where: { kind: DURABLE_WORK_KIND.JOB_PROMOTION, idempotencyKey: `job-promotion:${jobId}` },
    });
    expect(rows).toHaveLength(1);
    const batch = await processAwsDurableWorkBatch(prisma, 10);
    expect(batch.completed).toBeGreaterThanOrEqual(1);
    await prisma.durableWorkItem.deleteMany({
      where: { idempotencyKey: `job-promotion:${jobId}` },
    });
  });
});
