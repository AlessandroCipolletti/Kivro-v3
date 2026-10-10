import type { PrismaClient } from "@kivro/database";
import { assertImmediateSubmissionBeforePayment } from "@kivro/job-scheduling";
import { assessHardDeliveryDeadline } from "./deadline-feasibility.js";

export type BuyerExecutionPreflightResult =
  | {
      ok: true;
      accepting: boolean;
      reasons: string[];
      nextAvailableAt?: string;
      deadline: ReturnType<typeof assessHardDeliveryDeadline>;
    }
  | { ok: false; error: string };

/** BUYERUX-001/005 — hard readiness before quote or purchase. */
export async function runBuyerExecutionPreflight(
  prisma: PrismaClient,
  input: {
    capabilityId: string;
    immediate: boolean;
    hardDeliveryDeadlineAt?: Date | null;
    scheduledRunAt?: Date | null;
    estimatedDurationMinutes?: number | null;
  },
): Promise<BuyerExecutionPreflightResult> {
  const capability = await prisma.capability.findUnique({
    where: { id: input.capabilityId },
    include: { currentVersion: true },
  });
  if (!capability?.currentVersion || capability.status !== "PUBLISHED") {
    return { ok: false, error: "CAPABILITY_NOT_AVAILABLE" };
  }
  const deadline = assessHardDeliveryDeadline({
    hardDeliveryDeadlineAt: input.hardDeliveryDeadlineAt,
    scheduledRunAt: input.scheduledRunAt,
    estimatedDurationMinutes: input.estimatedDurationMinutes,
  });
  if (!deadline.feasible) {
    return {
      ok: true,
      accepting: false,
      reasons: [deadline.code],
      deadline,
    };
  }
  if (input.immediate) {
    const gate = await assertImmediateSubmissionBeforePayment(prisma, input.capabilityId);
    if (!("ok" in gate)) {
      return {
        ok: true,
        accepting: false,
        reasons: gate.reasons.length > 0 ? gate.reasons : [gate.error],
        nextAvailableAt: gate.nextAvailableAt,
        deadline,
      };
    }
    return { ok: true, accepting: true, reasons: [], deadline };
  }
  return { ok: true, accepting: true, reasons: [], deadline };
}
