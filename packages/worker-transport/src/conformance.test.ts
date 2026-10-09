import { describe, expect, it } from "vitest";
import {
  assertPollParsingParity,
  assertTransportSemanticParity,
  createBrokenTransportDriftProbe,
  createPollingWorkerTransport,
  createWssWorkerTransport,
} from "./index.js";

const base = {
  controlPlaneId: "cp-test",
  workerDeviceId: "wd-test",
  cloudBaseUrl: "https://api.example.test",
  wssUrl: "wss://api.example.test/worker",
};

describe("worker-transport conformance", () => {
  it("polling and wss share poll semantics", () => {
    const polling = createPollingWorkerTransport(base);
    const wss = createWssWorkerTransport(base);
    expect(() => assertTransportSemanticParity(polling, wss)).not.toThrow();
  });

  it("drift canary detects broken adapter", () => {
    const polling = createPollingWorkerTransport(base);
    const broken = createBrokenTransportDriftProbe(polling);
    const wss = createWssWorkerTransport(base);
    expect(() => assertPollParsingParity(broken, wss)).toThrow(/semantic drift/);
  });
});
