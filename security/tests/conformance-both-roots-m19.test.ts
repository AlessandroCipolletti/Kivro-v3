import { describe, expect, it } from "vitest";
import { assertCompositionParity, SHARED_API_CONTRACT_VERSION } from "@kivro/cloud-core";
import { createAwsComposition } from "@kivro/cloud-aws";
import { createNetsonsComposition } from "@kivro/cloud-netsons";
import {
  assertTransportSemanticParity,
  createPollingWorkerTransport,
  createWssWorkerTransport,
} from "@kivro/worker-transport";
import { PROTOCOL_VERSION } from "@kivro/contracts";

/**
 * M19 acceptance — representative shared behavior proven on both composition roots (ARCH-UNI-014).
 * Simulates a shared bug fix: poll payload parsing must stay identical regardless of profile default transport.
 */
describe("M19 both composition roots shared conformance", () => {
  it("shared durable-work port contract on netsons and aws roots", async () => {
    const netsons = createNetsonsComposition();
    const aws = createAwsComposition();
    const jobId = "job-m19-shared";
    const workerId = "wd-m19";

    const nSchedule = await netsons.durableWork.scheduleJobPromotion({
      jobId,
      runAt: new Date().toISOString(),
    });
    const aSchedule = await aws.durableWork.scheduleJobPromotion({
      jobId,
      runAt: new Date().toISOString(),
    });
    expect(nSchedule).toEqual(aSchedule);

    const nSignal = await netsons.durableWork.enqueueWorkerSignal({
      workerDeviceId: workerId,
      signal: "POLL",
    });
    const aSignal = await aws.durableWork.enqueueWorkerSignal({
      workerDeviceId: workerId,
      signal: "POLL",
    });
    expect(nSignal).toEqual(aSignal);
    expect(netsons.durableWork.profile).not.toBe(aws.durableWork.profile);
  });

  it("bug-fix regression: transport poll semantics unchanged on both profiles (ARCH-UNI-013/024)", () => {
    const netsons = createNetsonsComposition();
    const aws = createAwsComposition();
    assertCompositionParity(netsons, aws);

    const polling = createPollingWorkerTransport({
      controlPlaneId: "cp-shared",
      workerDeviceId: "wd",
      cloudBaseUrl: "http://localhost:3001",
    });
    const wss = createWssWorkerTransport({
      controlPlaneId: "cp-shared",
      workerDeviceId: "wd",
      wssUrl: "ws://localhost:3001/worker/wss",
    });
    assertTransportSemanticParity(netsons.workerTransport, polling);
    assertTransportSemanticParity(aws.workerTransport, wss);
    expect(netsons.apiContractVersion).toBe(SHARED_API_CONTRACT_VERSION);
    expect(netsons.workerProtocolVersion).toBe(PROTOCOL_VERSION);
  });

  it("PORT-030 — default transports are profile baselines, not hard-coded exclusivity", () => {
    const netsonsPolling = createNetsonsComposition().workerTransport;
    const awsWss = createAwsComposition().workerTransport;
    expect(netsonsPolling.kind).toBe("polling");
    expect(awsWss.kind).toBe("wss");
    const netsonsCanUseWss = createWssWorkerTransport({
      controlPlaneId: "netsons-default",
      workerDeviceId: "wd",
      wssUrl: "ws://localhost:3001/worker/wss",
    });
    const awsCanUsePolling = createPollingWorkerTransport({
      controlPlaneId: "aws-default",
      workerDeviceId: "wd",
      cloudBaseUrl: "http://localhost:3001",
    });
    assertTransportSemanticParity(netsonsPolling, awsCanUsePolling);
    assertTransportSemanticParity(awsWss, netsonsCanUseWss);
  });
});
