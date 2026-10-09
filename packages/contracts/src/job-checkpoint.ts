import { z } from "zod";
import { parseWithSchema } from "./validate.js";

/** Master Spec §435 — durable step checkpoints for long-running jobs. */
export const JobCheckpointRecordSchema = z.object({
  type: z.literal("JOB_CHECKPOINT"),
  protocolVersion: z.literal(1),
  jobId: z.string().uuid(),
  attemptNumber: z.number().int().positive(),
  stageLabel: z.string().min(1).max(120),
  checkpointKey: z.string().min(1).max(120),
  recordedAt: z.string().datetime(),
  payload: z.record(z.unknown()).optional(),
});

export type JobCheckpointRecord = z.infer<typeof JobCheckpointRecordSchema>;

export function parseJobCheckpointRecord(data: unknown): JobCheckpointRecord {
  return parseWithSchema(JobCheckpointRecordSchema, data);
}
