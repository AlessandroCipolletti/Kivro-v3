import { describe, expect, it } from "vitest";
import {
  assertPollParsingParity,
  createBrokenTransportDriftProbe,
  createPollingWorkerTransport,
  createWssWorkerTransport,
} from "@kivro/worker-transport";

/** ARCH-UNI-023 / CONFORMANCE drift canary — non-conformant adapter must fail CI. */
describe("M19 provider divergence detection", () => {
  it("detects deliberately broken transport semantics", () => {
    const polling = createPollingWorkerTransport({
      controlPlaneId: "cp",
      workerDeviceId: "wd",
      cloudBaseUrl: "http://localhost:3001",
    });
    const broken = createBrokenTransportDriftProbe(polling);
    const wss = createWssWorkerTransport({
      controlPlaneId: "cp",
      workerDeviceId: "wd",
      wssUrl: "ws://localhost:3001/worker/wss",
    });
    expect(() => assertPollParsingParity(broken, wss)).toThrow(/semantic drift/);
    expect(() => assertPollParsingParity(polling, wss)).not.toThrow();
  });
});
