#!/usr/bin/env node
/** DEV-LOCAL-022 — verify audit trail correlation for a completed job. */
const jobId = process.env.KIVRO_CORRELATION_JOB_ID;
const expected = process.env.KIVRO_CORRELATION_ID;

async function main() {
  if (!jobId) {
    console.log(JSON.stringify({ skipped: true, reason: "KIVRO_CORRELATION_JOB_ID unset" }));
    process.exit(0);
  }
  const { getPrismaClient } = await import("@kivro/database");
  const prisma = getPrismaClient();
  const events = await prisma.auditEvent.findMany({
    where: { jobId },
    orderBy: { createdAt: "asc" },
  });
  const completed = events.filter((e) => e.type === "JOB_COMPLETED");
  if (!completed.length) {
    throw new Error("no JOB_COMPLETED audit event");
  }
  if (expected) {
    const match = completed.some((e) => e.correlationId === expected);
    if (!match) {
      throw new Error(`correlation mismatch expected ${expected}`);
    }
  } else if (!completed[0].correlationId) {
    throw new Error("JOB_COMPLETED missing correlationId");
  }
  console.log(JSON.stringify({ correlation: "ok", events: events.length }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
