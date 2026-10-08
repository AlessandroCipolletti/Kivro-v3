import { z } from "zod";
import { parseWithSchema } from "./validate.js";

export const PROTOCOL_VERSION = 1 as const;

export const JobOfferSchema = z.object({
  protocolVersion: z.literal(PROTOCOL_VERSION),
  jobId: z.string().uuid(),
  workerId: z.string().uuid(),
  capabilityVersionId: z.string().uuid(),
  inputManifestId: z.string().uuid(),
  expiresAt: z.string().datetime(),
  paymentSecured: z.literal(true),
});

export type JobOffer = z.infer<typeof JobOfferSchema>;

export function parseJobOffer(data: unknown): JobOffer {
  return parseWithSchema(JobOfferSchema, data);
}
