import type { JobStatus } from "@kivro/domain";

export type V1JobCreateSuccess = {
  jobId: string;
  status: JobStatus | string;
  capabilityId: string;
  capabilityVersion: string;
  price: { currency: string; amountMinor: number };
};

export type V1JobCreateError = {
  error: string;
  reasons?: string[];
};

export function formatV1JobCreateSuccess(input: {
  jobId: string;
  status: JobStatus | string;
  capabilityId: string;
  versionNumber: number;
  currency: string;
  priceCents: number;
}): V1JobCreateSuccess {
  return {
    jobId: input.jobId,
    status: input.status,
    capabilityId: input.capabilityId,
    capabilityVersion: String(input.versionNumber),
    price: { currency: input.currency, amountMinor: input.priceCents },
  };
}

export function mapV1PaymentError(error: string): string {
  if (error === "INSUFFICIENT_CREDITS") {
    return "INSUFFICIENT_FUNDS";
  }
  return error;
}
