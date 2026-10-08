import { describe, expect, it } from "vitest";
import { JobOfferSchema, parseJobOffer } from "./job-offer.js";

describe("JobOfferSchema", () => {
  it("accepts a valid offer", () => {
    const offer = parseJobOffer({
      protocolVersion: 1,
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      workerId: "550e8400-e29b-41d4-a716-446655440001",
      capabilityVersionId: "550e8400-e29b-41d4-a716-446655440002",
      inputManifestId: "550e8400-e29b-41d4-a716-446655440003",
      expiresAt: "2030-01-01T00:00:00.000Z",
      paymentSecured: true,
    });
    expect(offer.protocolVersion).toBe(1);
  });

  it("rejects unknown protocol version", () => {
    const result = JobOfferSchema.safeParse({
      protocolVersion: 2,
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      workerId: "550e8400-e29b-41d4-a716-446655440001",
      capabilityVersionId: "550e8400-e29b-41d4-a716-446655440002",
      inputManifestId: "550e8400-e29b-41d4-a716-446655440003",
      expiresAt: "2030-01-01T00:00:00.000Z",
      paymentSecured: true,
    });
    expect(result.success).toBe(false);
  });
});
