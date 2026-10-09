import type { JobControlSource } from "@kivro/contracts";
import type { PrismaClient } from "@kivro/database";
import {
  assertJobTransition,
  isPausableExecutionStatus,
  pauseAllowedForSupport,
  parsePauseSupportLevel,
  type JobStatus,
  type PauseSupportLevel,
} from "@kivro/domain";
import { computePauseDeadline, isPauseDurationExceeded } from "@kivro/platform-policy";
import { planSellerPauseTransition } from "./pause-idempotency.js";
import { evaluateResumeReadiness } from "./resume-readiness.js";

export type JobPauseAuditPayload = {
  jobId: string;
  actor: "SELLER" | "WORKER" | "ADMIN" | "SYSTEM";
  source: JobControlSource;
  requestedAt: string;
  confirmedAt?: string;
  previousState: JobStatus;
  newState: JobStatus;
  reason?: string;
  pauseSupportMode?: PauseSupportLevel;
  commandId: string;
};

async function recordTransition(
  prisma: PrismaClient,
  input: {
    jobId: string;
    from: JobStatus | null;
    to: JobStatus;
    actor: "BUYER" | "SELLER" | "WORKER" | "SYSTEM" | "ADMIN";
    reason?: string;
    correlationId?: string;
  },
): Promise<void> {
  await prisma.jobStateTransition.create({
    data: {
      jobId: input.jobId,
      fromStatus: input.from ?? undefined,
      toStatus: input.to,
      actor: input.actor,
      reason: input.reason,
      correlationId: input.correlationId,
    },
  });
}

async function recordPauseAudit(
  prisma: PrismaClient,
  payload: JobPauseAuditPayload,
): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      jobId: payload.jobId,
      type: "JOB_PAUSE_CONTROL",
      actor: payload.actor === "SELLER" ? "SELLER" : payload.actor === "WORKER" ? "WORKER" : "SYSTEM",
      correlationId: payload.commandId,
      sanitizedPayload: payload,
    },
  });
}

export async function sellerRequestJobPause(
  prisma: PrismaClient,
  input: {
    jobId: string;
    sellerProfileId: string;
    commandId: string;
    source: JobControlSource;
    reason?: string;
    pauseSupportMode?: PauseSupportLevel;
  },
): Promise<{ status: JobStatus; commandId: string } | { error: string }> {
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: {
      capabilityVersion: { include: { capability: true } },
    },
  });
  if (!job) {
    return { error: "JOB_NOT_FOUND" };
  }
  if (job.capabilityVersion.capability.sellerProfileId !== input.sellerProfileId) {
    return { error: "FORBIDDEN" };
  }

  const manifestPause = (job.capabilityVersion.workerManifest as { pauseSupport?: string } | null)
    ?.pauseSupport;
  const support = input.pauseSupportMode ?? parsePauseSupportLevel(manifestPause);
  if (!pauseAllowedForSupport(support)) {
    return { error: "PAUSE_NOT_SUPPORTED" };
  }

  const plan = planSellerPauseTransition(job.status, "pause");
  if (plan.kind === "reject") {
    return { error: plan.code };
  }
  if (plan.kind === "noop") {
    return { status: plan.status, commandId: job.activeControlCommandId ?? input.commandId };
  }

  const from = job.status;
  assertJobTransition(from, plan.next);
  const now = new Date();
  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: plan.next,
      activeControlCommandId: input.commandId,
      pauseRequestedAt: now,
      pauseDeadlineAt: computePauseDeadline(now.getTime()),
      pauseSupportMode: support,
    },
  });
  await recordTransition(prisma, {
    jobId: job.id,
    from,
    to: plan.next,
    actor: "SELLER",
    reason: input.reason,
    correlationId: input.commandId,
  });
  await recordPauseAudit(prisma, {
    jobId: job.id,
    actor: "SELLER",
    source: input.source,
    requestedAt: now.toISOString(),
    previousState: from,
    newState: plan.next,
    reason: input.reason,
    pauseSupportMode: support,
    commandId: input.commandId,
  });

  return { status: plan.next, commandId: input.commandId };
}

export async function workerAcknowledgeJobPaused(
  prisma: PrismaClient,
  input: {
    jobId: string;
    workerDeviceId: string;
    commandId: string;
    localState: "PAUSED" | "PAUSE_NOT_SUPPORTED";
  },
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job || job.workerDeviceId !== input.workerDeviceId) {
    return { error: "FORBIDDEN" };
  }
  if (input.localState === "PAUSE_NOT_SUPPORTED") {
    return { error: "PAUSE_NOT_SUPPORTED" };
  }
  const from = job.status;
  if (from === "PAUSED") {
    return { status: from };
  }
  if (from !== "PAUSE_REQUESTED") {
    return { error: "INVALID_STATE" };
  }
  assertJobTransition(from, "PAUSED");
  const now = new Date();
  await prisma.job.update({
    where: { id: job.id },
    data: { status: "PAUSED", pausedAt: now },
  });
  await recordTransition(prisma, {
    jobId: job.id,
    from,
    to: "PAUSED",
    actor: "WORKER",
    correlationId: input.commandId,
  });
  await recordPauseAudit(prisma, {
    jobId: job.id,
    actor: "WORKER",
    source: "CLI",
    requestedAt: job.pauseRequestedAt?.toISOString() ?? now.toISOString(),
    confirmedAt: now.toISOString(),
    previousState: from,
    newState: "PAUSED",
    commandId: input.commandId,
    pauseSupportMode: (job.pauseSupportMode as PauseSupportLevel | null) ?? undefined,
  });
  return { status: "PAUSED" };
}

export async function sellerRequestJobResume(
  prisma: PrismaClient,
  input: {
    jobId: string;
    sellerProfileId: string;
    commandId: string;
    source: JobControlSource;
    globalPauseActive?: boolean;
    confirmGlobalPauseOverride?: boolean;
  },
): Promise<{ status: JobStatus; commandId: string } | { error: string }> {
  if (input.globalPauseActive && !input.confirmGlobalPauseOverride) {
    return { error: "GLOBAL_PAUSE_CONFIRMATION_REQUIRED" };
  }
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: {
      capabilityVersion: { include: { capability: true } },
      workerDevice: true,
    },
  });
  if (!job) {
    return { error: "JOB_NOT_FOUND" };
  }
  if (job.capabilityVersion.capability.sellerProfileId !== input.sellerProfileId) {
    return { error: "FORBIDDEN" };
  }
  const readiness = evaluateResumeReadiness({
    jobStatus: job.status,
    workerDeviceStatus: job.workerDevice?.status,
    securityPauseReason: job.securityPauseReason,
    globalPauseActive: input.globalPauseActive,
    confirmGlobalPauseOverride: input.confirmGlobalPauseOverride,
  });
  if (!readiness.ready) {
    return { error: readiness.code };
  }
  const plan = planSellerPauseTransition(job.status, "resume");
  if (plan.kind === "reject") {
    return { error: plan.code };
  }
  if (plan.kind === "noop") {
    return { status: plan.status, commandId: job.activeControlCommandId ?? input.commandId };
  }
  const from = job.status;
  assertJobTransition(from, plan.next);
  const now = new Date();
  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: plan.next,
      activeControlCommandId: input.commandId,
    },
  });
  await recordTransition(prisma, {
    jobId: job.id,
    from,
    to: plan.next,
    actor: "SELLER",
    correlationId: input.commandId,
  });
  await recordPauseAudit(prisma, {
    jobId: job.id,
    actor: "SELLER",
    source: input.source,
    requestedAt: now.toISOString(),
    previousState: from,
    newState: plan.next,
    commandId: input.commandId,
  });
  return { status: plan.next, commandId: input.commandId };
}

export async function workerAcknowledgeJobResumed(
  prisma: PrismaClient,
  input: {
    jobId: string;
    workerDeviceId: string;
    commandId: string;
    outcome: "RUNNING" | "RESUME_NOT_READY" | "SECURITY_BLOCK";
  },
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job || job.workerDeviceId !== input.workerDeviceId) {
    return { error: "FORBIDDEN" };
  }
  const from = job.status;
  if (input.outcome !== "RUNNING") {
    if (from === "SECURITY_PAUSED") {
      return { status: from };
    }
    assertJobTransition(from, "SECURITY_PAUSED");
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "SECURITY_PAUSED", securityPauseReason: input.outcome },
    });
    await recordTransition(prisma, {
      jobId: job.id,
      from,
      to: "SECURITY_PAUSED",
      actor: "WORKER",
      reason: input.outcome,
      correlationId: input.commandId,
    });
    return { status: "SECURITY_PAUSED" };
  }
  if (from === "RUNNING") {
    return { status: from };
  }
  if (from !== "RESUME_REQUESTED") {
    return { error: "INVALID_STATE" };
  }
  assertJobTransition(from, "RUNNING");
  await prisma.job.update({
    where: { id: job.id },
    data: { status: "RUNNING", pausedAt: null, resumedAt: new Date() },
  });
  await recordTransition(prisma, {
    jobId: job.id,
    from,
    to: "RUNNING",
    actor: "WORKER",
    correlationId: input.commandId,
  });
  return { status: "RUNNING" };
}

export async function platformSecurityPauseJob(
  prisma: PrismaClient,
  input: { jobId: string; commandId: string; reason: string },
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job) {
    return { error: "JOB_NOT_FOUND" };
  }
  const from = job.status;
  if (!isPausableExecutionStatus(from) && from !== "PAUSE_REQUESTED") {
    return { error: "JOB_NOT_PAUSABLE" };
  }
  if (from === "SECURITY_PAUSED") {
    return { status: from };
  }
  assertJobTransition(from, "SECURITY_PAUSED");
  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "SECURITY_PAUSED",
      securityPauseReason: input.reason,
      activeControlCommandId: input.commandId,
    },
  });
  await recordTransition(prisma, {
    jobId: job.id,
    from,
    to: "SECURITY_PAUSED",
    actor: "ADMIN",
    reason: input.reason,
    correlationId: input.commandId,
  });
  await recordPauseAudit(prisma, {
    jobId: job.id,
    actor: "SYSTEM",
    source: "PLATFORM_SECURITY",
    requestedAt: new Date().toISOString(),
    previousState: from,
    newState: "SECURITY_PAUSED",
    reason: input.reason,
    commandId: input.commandId,
  });
  return { status: "SECURITY_PAUSED" };
}

export async function enforcePauseDurationTimeout(
  prisma: PrismaClient,
  jobId: string,
): Promise<{ status: JobStatus } | { noop: true }> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "PAUSED" || !job.pauseRequestedAt) {
    return { noop: true };
  }
  if (!isPauseDurationExceeded(job.pauseRequestedAt)) {
    return { noop: true };
  }
  assertJobTransition("PAUSED", "TIMED_OUT");
  await prisma.job.update({
    where: { id: job.id },
    data: { status: "TIMED_OUT", failureCode: "PAUSE_DURATION_EXCEEDED" },
  });
  await recordTransition(prisma, {
    jobId: job.id,
    from: "PAUSED",
    to: "TIMED_OUT",
    actor: "SYSTEM",
    reason: "PAUSE_DURATION_EXCEEDED",
  });
  return { status: "TIMED_OUT" };
}
