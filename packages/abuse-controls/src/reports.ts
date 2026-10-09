import type { PrismaClient } from "@kivro/database";
import { randomUUID } from "node:crypto";
import { evaluateCapabilityAbuseTriage } from "./triage.js";

const REPORT_REASONS = new Set([
  "SPAM",
  "MALICIOUS_INPUT",
  "IP_VIOLATION",
  "HARASSMENT",
  "MISLEADING_CAPABILITY",
  "OTHER",
]);

export function isValidAbuseReason(reason: string): boolean {
  return REPORT_REASONS.has(reason);
}

export async function createAbuseReport(
  prisma: PrismaClient,
  input: {
    reporterUserId: string;
    targetType: "CAPABILITY" | "BUYER" | "SELLER";
    targetId: string;
    capabilityId?: string;
    reason: string;
    details?: string;
  },
): Promise<{ id: string } | { error: string }> {
  if (!isValidAbuseReason(input.reason)) {
    return { error: "INVALID_REASON" };
  }
  if (input.details && input.details.length > 4000) {
    return { error: "DETAILS_TOO_LONG" };
  }
  const id = randomUUID();
  await prisma.abuseReport.create({
    data: {
      id,
      reporterUserId: input.reporterUserId,
      targetType: input.targetType,
      targetId: input.targetId,
      capabilityId: input.capabilityId,
      reason: input.reason,
      details: input.details,
    },
  });
  if (input.targetType === "CAPABILITY" && input.capabilityId) {
    await evaluateCapabilityAbuseTriage(prisma, input.capabilityId);
  }
  return { id };
}
