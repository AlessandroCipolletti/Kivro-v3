import { submitPaidJob } from "@kivro/billing";
import type { PrismaClient } from "@kivro/database";
import type { CapabilityContract } from "@kivro/contracts";
import { validateBuyerSubmissionAssets } from "@kivro/buyer-experience";
import { validateBuyerInput, type JobAssetRef } from "@kivro/job-io";

export async function createBuyerJobFromApi(
  prisma: PrismaClient,
  input: {
    buyerId: string;
    buyerEmail: string;
    capabilityId: string;
    inputs?: Record<string, unknown>;
    assets?: Record<string, unknown>;
    scheduledRunAt?: Date;
    buyerApiKeyId?: string;
    executionQuoteId?: string;
    buyerHardDeadlineAt?: Date;
  },
): Promise<
  | {
      jobId: string;
      status: string;
      capabilityId: string;
      versionNumber: number;
      currency: string;
      priceCents: number;
    }
  | { error: string; reasons?: string[] }
> {
  const buyer = await prisma.user.findUnique({ where: { id: input.buyerId } });
  if (!buyer?.marketplaceTermsAcceptedAt) {
    return { error: "MARKETPLACE_TERMS_REQUIRED" };
  }
  const capability = await prisma.capability.findUnique({
    where: { id: input.capabilityId },
    include: { currentVersion: true },
  });
  if (!capability?.currentVersion) {
    return { error: "NOT_FOUND" };
  }
  const version = capability.currentVersion;
  const contract = {
    name: capability.name,
    description: capability.description,
    currency: version.currency,
    priceTierCents: version.priceSnapshotCents,
    inputs: version.inputSchema,
    output: version.outputSchema,
  } as CapabilityContract;
  const assetCheck = await validateBuyerSubmissionAssets(prisma, {
    buyerId: input.buyerId,
    assets: input.assets,
  });
  if (!assetCheck.ok) {
    return { error: assetCheck.error };
  }
  const validation = validateBuyerInput({
    contract,
    inputs: input.inputs ?? {},
    assets: assetCheck.normalized as Record<string, JobAssetRef[]>,
  });
  if (!validation.ok) {
    return { error: "VALIDATION_FAILED" };
  }

  const result = await submitPaidJob(prisma, {
    buyerId: input.buyerId,
    capabilityId: input.capabilityId,
    structuredInput: input.inputs ?? {},
    assetManifest: assetCheck.normalized,
    scheduledRunAt: input.scheduledRunAt,
    executionQuoteId: input.executionQuoteId,
    buyerHardDeadlineAt: input.buyerHardDeadlineAt,
  });
  if ("error" in result) {
    return { error: result.error, reasons: "reasons" in result ? (result.reasons as string[]) : undefined };
  }

  if (input.buyerApiKeyId) {
    await prisma.job.update({
      where: { id: result.jobId },
      data: { buyerApiKeyId: input.buyerApiKeyId },
    });
  }

  return {
    jobId: result.jobId,
    status: result.status,
    capabilityId: input.capabilityId,
    versionNumber: version.versionNumber,
    currency: version.currency,
    priceCents: version.priceSnapshotCents,
  };
}
