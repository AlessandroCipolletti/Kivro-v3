import type { Prisma, PrismaClient } from "@kivro/database";

type SchedulingDb = PrismaClient | Prisma.TransactionClient;

/** SELLERUX-037 — a Worker receives a job only when explicitly assigned to that version. */
export async function assertWorkerAssignedToVersion(
  prisma: SchedulingDb,
  input: { workerDeviceId: string; capabilityVersionId: string },
): Promise<{ ok: true } | { error: "WORKER_NOT_ASSIGNED" }> {
  const binding = await prisma.localWorkerBinding.findFirst({
    where: {
      workerDeviceId: input.workerDeviceId,
      capabilityVersionId: input.capabilityVersionId,
      status: "ACTIVE",
      workerDevice: { status: { not: "REVOKED" } },
    },
    select: {
      workerDevice: { select: { sellerProfileId: true } },
      capabilityVersion: { select: { capability: { select: { sellerProfileId: true } } } },
    },
  });
  if (!binding) {
    return { error: "WORKER_NOT_ASSIGNED" };
  }
  if (binding.workerDevice.sellerProfileId !== binding.capabilityVersion.capability.sellerProfileId) {
    return { error: "WORKER_NOT_ASSIGNED" };
  }
  return { ok: true };
}
