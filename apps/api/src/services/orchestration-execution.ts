import { submitPaidJob } from "@kivro/billing";
import { parseCapabilityContract } from "@kivro/contracts";
import type { PrismaClient } from "@kivro/database";
import { prepareAgentJobSubmission } from "@kivro/job-io";
import {
  buildStepAgentDraft,
  findRunnableSteps,
  stepCompletedOutputs,
  synthesizePlanSummary,
  toStepRecord,
  type OrchestrationStepRecord,
} from "@kivro/marketplace-agent";
import { parseJobOutputAssetManifest } from "@kivro/marketplace";

export async function reserveOrchestrationBudget(
  db: PrismaClient,
  planId: string,
  amountCents: number,
): Promise<void> {
  await db.orchestrationPlan.update({
    where: { id: planId },
    data: { budgetReservedCents: amountCents },
  });
}

export async function releaseOrchestrationBudget(db: PrismaClient, planId: string): Promise<void> {
  await db.orchestrationPlan.update({
    where: { id: planId },
    data: { budgetReservedCents: 0 },
  });
}

export async function submitOrchestrationStepJob(
  db: PrismaClient,
  input: {
    buyerId: string;
    planId: string;
    step: OrchestrationStepRecord;
    planGoal: string;
    completedSteps: ReturnType<typeof stepCompletedOutputs>;
  },
): Promise<{ jobId: string } | { error: string }> {
  const capability = await db.capability.findUnique({
    where: { id: input.step.capabilityId },
    include: { currentVersion: true },
  });
  if (!capability?.currentVersion) {
    return { error: "CAPABILITY_NOT_AVAILABLE" };
  }
  const version = capability.currentVersion;
  const contract = parseCapabilityContract({
    name: capability.name,
    description: capability.description,
    currency: version.currency,
    priceTierCents: version.priceSnapshotCents,
    inputs: version.inputSchema,
    output: version.outputSchema,
  });
  const draft = buildStepAgentDraft(input.planGoal, input.step, input.completedSteps);
  const prepared = prepareAgentJobSubmission(contract, draft);
  const structuredInput =
    prepared.validation.ok && prepared.missingRequired.length === 0
      ? prepared.inputs
      : { instructions: draft.instructions, _orchestrationFallback: true };
  const assets = prepared.validation.ok ? prepared.assets : {};

  const result = await submitPaidJob(db, {
    buyerId: input.buyerId,
    capabilityId: input.step.capabilityId,
    structuredInput,
    assetManifest: assets,
  });
  if ("error" in result) {
    return result;
  }
  await db.job.update({
    where: { id: result.jobId },
    data: { orchestrationStepId: input.step.id },
  });
  await db.orchestrationStep.update({
    where: { id: input.step.id },
    data: {
      jobId: result.jobId,
      status: "RUNNING",
      quotedPriceCents: version.priceSnapshotCents,
    },
  });
  return { jobId: result.jobId };
}

export async function startReadyOrchestrationSteps(
  db: PrismaClient,
  buyerId: string,
  planId: string,
): Promise<string[]> {
  const plan = await db.orchestrationPlan.findFirst({
    where: { id: planId, userId: buyerId },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });
  if (!plan) {
    return [];
  }
  const records = plan.steps.map(toStepRecord);
  const runnable = findRunnableSteps(records);
  const completed = stepCompletedOutputs(records);
  const started: string[] = [];
  for (const step of runnable) {
    const result = await submitOrchestrationStepJob(db, {
      buyerId,
      planId,
      step,
      planGoal: plan.goal,
      completedSteps: completed,
    });
    if ("jobId" in result) {
      started.push(result.jobId);
    }
  }
  return started;
}

export async function onOrchestrationJobCompleted(
  db: PrismaClient,
  jobId: string,
): Promise<void> {
  const step = await db.orchestrationStep.findFirst({ where: { jobId } });
  if (!step) {
    return;
  }
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { result: true },
  });
  if (!job || job.status !== "COMPLETED") {
    return;
  }
  const assets = parseJobOutputAssetManifest(job.result?.outputAssetManifest);
  await db.orchestrationStep.update({
    where: { id: step.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      outputAssetRefsJson: assets,
    },
  });

  const plan = await db.orchestrationPlan.findUnique({
    where: { id: step.planId },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });
  if (!plan || plan.status !== "RUNNING") {
    return;
  }

  const refreshed = await db.orchestrationStep.findMany({
    where: { planId: plan.id },
    orderBy: { sortOrder: "asc" },
  });
  const merged = refreshed.map(toStepRecord);
  const pending = merged.filter((s) => s.status !== "COMPLETED" && s.status !== "FAILED");

  if (pending.length === 0) {
    await db.orchestrationPlan.update({
      where: { id: plan.id },
      data: {
        status: "COMPLETED",
        synthesisSummary: synthesizePlanSummary(merged, plan.goal),
        budgetReservedCents: 0,
      },
    });
    return;
  }

  await startReadyOrchestrationSteps(db, plan.userId, plan.id);
}
