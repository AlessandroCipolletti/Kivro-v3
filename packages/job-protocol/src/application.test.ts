import { describe, expect, it } from "vitest";
import { buildWorkerHeartbeatBody } from "./application.js";
import { PROTOCOL_VERSION } from "@kivro/contracts";

describe("Worker heartbeat application message (M25)", () => {
  it("includes protocolVersion for cloud compatibility gate", () => {
    const body = buildWorkerHeartbeatBody({
      workerVersion: "0.0.0-m07",
      dockerOk: true,
      sandboxOk: true,
      openClawInstalled: false,
      openClawCompatible: true,
      globalPauseActive: false,
    });
    expect(body.protocolVersion).toBe(PROTOCOL_VERSION);
  });
});
