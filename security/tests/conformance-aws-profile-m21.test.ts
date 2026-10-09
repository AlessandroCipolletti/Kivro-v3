import { describe, expect, it } from "vitest";
import { createAwsComposition } from "@kivro/cloud-aws";
import { createNetsonsComposition } from "@kivro/cloud-netsons";
import { assertCompositionParity } from "@kivro/cloud-core";

describe("M21 AWS profile conformance (shared release)", () => {
  it("AWS and Netsons roots stay parity-compatible without Prisma", () => {
    assertCompositionParity(createNetsonsComposition(), createAwsComposition());
  });

  it("AWS root uses WSS transport and aws-managed-queue durable profile", () => {
    const aws = createAwsComposition();
    const netsons = createNetsonsComposition();
    expect(aws.workerTransport.kind).toBe("wss");
    expect(netsons.workerTransport.kind).toBe("polling");
    expect(aws.durableWorkProfile).toBe("aws-managed-queue");
    expect(netsons.durableWorkProfile).toBe("netsons-db-cron");
    expect(aws.objectStorageProfile).toBe("aws-s3");
    expect(netsons.objectStorageProfile).toBe("s3-compatible");
  });

  it("both roots share API contract and protocol version", () => {
    const aws = createAwsComposition();
    const netsons = createNetsonsComposition();
    expect(aws.apiContractVersion).toBe(netsons.apiContractVersion);
    expect(aws.workerProtocolVersion).toBe(netsons.workerProtocolVersion);
  });
});
