import { z } from "zod";
import { parseWithSchema } from "./validate.js";

export const JOB_CONTROL_SOURCES = ["WEB", "LOCAL_UI", "CLI", "PLATFORM_SECURITY"] as const;

export type JobControlSource = (typeof JOB_CONTROL_SOURCES)[number];

export const JobPauseRequestSchema = z.object({
  type: z.literal("JOB_PAUSE_REQUEST"),
  protocolVersion: z.literal(1),
  jobId: z.string().uuid(),
  commandId: z.string().uuid(),
  requestedAt: z.string().datetime(),
  source: z.enum(JOB_CONTROL_SOURCES),
  reason: z.string().max(500).optional(),
});

export const JobPauseAckSchema = z.object({
  type: z.literal("JOB_PAUSE_ACK"),
  protocolVersion: z.literal(1),
  jobId: z.string().uuid(),
  commandId: z.string().uuid(),
  acknowledgedAt: z.string().datetime(),
  localState: z.enum(["PAUSED", "PAUSE_NOT_SUPPORTED"]),
});

export const JobResumeRequestSchema = z.object({
  type: z.literal("JOB_RESUME_REQUEST"),
  protocolVersion: z.literal(1),
  jobId: z.string().uuid(),
  commandId: z.string().uuid(),
  requestedAt: z.string().datetime(),
  source: z.enum(JOB_CONTROL_SOURCES),
  confirmGlobalPauseOverride: z.boolean().optional(),
});

export const JobResumeAckSchema = z.object({
  type: z.literal("JOB_RESUME_ACK"),
  protocolVersion: z.literal(1),
  jobId: z.string().uuid(),
  commandId: z.string().uuid(),
  acknowledgedAt: z.string().datetime(),
  resumeOutcome: z.enum(["RUNNING", "RESUME_NOT_READY", "SECURITY_BLOCK"]),
});

export const WorkerJobCommandPollSchema = z.object({
  type: z.literal("WORKER_JOB_COMMANDS"),
  protocolVersion: z.literal(1),
  workerDeviceId: z.string().uuid(),
  pending: z.array(
    z.union([JobPauseRequestSchema, JobResumeRequestSchema, z.object({ type: z.literal("JOB_CANCEL") })]),
  ),
});

export type JobPauseRequest = z.infer<typeof JobPauseRequestSchema>;
export type JobPauseAck = z.infer<typeof JobPauseAckSchema>;
export type JobResumeRequest = z.infer<typeof JobResumeRequestSchema>;
export type JobResumeAck = z.infer<typeof JobResumeAckSchema>;

export function parseJobPauseRequest(data: unknown): JobPauseRequest {
  return parseWithSchema(JobPauseRequestSchema, data);
}

export function parseJobPauseAck(data: unknown): JobPauseAck {
  return parseWithSchema(JobPauseAckSchema, data);
}

export function parseJobResumeRequest(data: unknown): JobResumeRequest {
  return parseWithSchema(JobResumeRequestSchema, data);
}

export function parseJobResumeAck(data: unknown): JobResumeAck {
  return parseWithSchema(JobResumeAckSchema, data);
}
