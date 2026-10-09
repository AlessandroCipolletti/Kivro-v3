import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { assertCompositionParity } from "@kivro/cloud-core";
import { createNetsonsComposition } from "@kivro/cloud-netsons";
import { createAwsComposition } from "@kivro/cloud-aws";
import {
  assertTransportSemanticParity,
  createPollingWorkerTransport,
  createWssWorkerTransport,
} from "@kivro/worker-transport";
import {
  isProtocolVersionWithinCompatibilityWindow,
  WORKER_PROTOCOL_COMPATIBILITY_WINDOW,
} from "@kivro/contracts";
import { buildJobAcceptedMessage, buildWorkerHeartbeatBody, PROTOCOL_VERSION } from "@kivro/job-protocol";

const root = process.cwd();

describe("M19 golden conformance registry", () => {
  it("loads backend-conformance-golden.json", () => {
    const golden = JSON.parse(
      fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
    ) as { scenarios: Array<{ id: string }> };
    expect(golden.scenarios.length).toBeGreaterThanOrEqual(3);
  });

  it("M19-GOLD-001 composition parity", () => {
    assertCompositionParity(createNetsonsComposition(), createAwsComposition());
  });

  it("M19-GOLD-002 transport poll semantics", () => {
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
    assertTransportSemanticParity(polling, wss);
  });

  it("M19-GOLD-003 application protocol messages", () => {
    const hb = buildWorkerHeartbeatBody({
      workerVersion: "1",
      dockerOk: true,
      sandboxOk: true,
      openClawInstalled: false,
      openClawCompatible: true,
      globalPauseActive: false,
    });
    expect(hb.workerVersion).toBe("1");
    const accepted = buildJobAcceptedMessage({ jobId: "j", workerDeviceId: "d" });
    expect(accepted.protocolVersion).toBe(PROTOCOL_VERSION);
  });

  it("M19-GOLD-006 protocol compatibility window (ARCH-UNI-024)", () => {
    expect(isProtocolVersionWithinCompatibilityWindow(PROTOCOL_VERSION)).toBe(true);
    expect(WORKER_PROTOCOL_COMPATIBILITY_WINDOW.minSupportedProtocolVersion).toBe(PROTOCOL_VERSION);
  });

  it("both roots expose durable work ports", () => {
    expect(createNetsonsComposition().durableWork.profile).toBe("netsons-db-cron");
    expect(createAwsComposition().durableWork.profile).toBe("aws-managed-queue");
  });
});
