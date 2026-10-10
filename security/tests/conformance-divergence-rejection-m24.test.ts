import { describe, expect, it } from "vitest";
import {
  assertCompositionParity,
  createBrokenCompositionDriftProbe,
} from "@kivro/cloud-core";
import { createNetsonsComposition } from "@kivro/cloud-netsons";
import { createAwsComposition } from "@kivro/cloud-aws";
import {
  assertPollParsingParity,
  createBrokenTransportDriftProbe,
  createPollingWorkerTransport,
  createWssWorkerTransport,
} from "@kivro/worker-transport";

/** M24 required test — intentional divergence rejection (IMPLEMENTATION-PLAN exit). M24-GOLD-008 */
describe("M24 divergence rejection (both canaries)", () => {
  it("rejects broken composition adapter", () => {
    expect(() =>
      assertCompositionParity(
        createNetsonsComposition(),
        createBrokenCompositionDriftProbe(createAwsComposition()),
      ),
    ).toThrow(/API contract drift/);
  });

  it("rejects broken transport adapter", () => {
    const polling = createPollingWorkerTransport({
      controlPlaneId: "cp",
      workerDeviceId: "wd",
      cloudBaseUrl: "http://localhost:3001",
    });
    const wss = createWssWorkerTransport({
      controlPlaneId: "cp",
      workerDeviceId: "wd",
      wssUrl: "ws://localhost:3001/worker/wss",
    });
    expect(() => assertPollParsingParity(createBrokenTransportDriftProbe(polling), wss)).toThrow(
      /semantic drift/,
    );
  });
});
