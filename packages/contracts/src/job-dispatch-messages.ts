import { z } from "zod";
import { parseWithSchema } from "./validate.js";
import { JobOfferSchema } from "./job-offer.js";

export const JobAcceptedSchema = z.object({
  type: z.literal("JOB_ACCEPTED"),
  protocolVersion: z.literal(1),
  jobId: z.string().uuid(),
  workerDeviceId: z.string().uuid(),
  acceptedAt: z.string().datetime(),
});

export const JobRejectedSchema = z.object({
  type: z.literal("JOB_REJECTED"),
  protocolVersion: z.literal(1),
  jobId: z.string().uuid(),
  workerDeviceId: z.string().uuid(),
  reason: z.string().max(200),
});

export const WorkerPollResponseSchema = z.object({
  type: z.literal("WORKER_POLL"),
  protocolVersion: z.literal(1),
  offers: z.array(JobOfferSchema),
  commands: z.array(z.unknown()),
});

export type JobAccepted = z.infer<typeof JobAcceptedSchema>;
export type JobRejected = z.infer<typeof JobRejectedSchema>;

export function parseJobAccepted(data: unknown): JobAccepted {
  return parseWithSchema(JobAcceptedSchema, data);
}
