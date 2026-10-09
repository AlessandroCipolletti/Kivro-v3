import { describe, expect, it } from "vitest";
import { WORKER_PROTOCOL_COMPATIBILITY_WINDOW, PROTOCOL_VERSION } from "@kivro/contracts";
import {
  buildWorkerServiceDiscoveryDocument,
  listAdvertisedTransportKinds,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
} from "./worker-discovery.js";

describe("worker service discovery (M22 / PORT-003, PORT-018)", () => {
  it("includes protocol version and compatibility window", () => {
    const doc = buildWorkerServiceDiscoveryDocument({
      protocolVersion: PROTOCOL_VERSION,
      publicApiBaseUrl: "https://cloud.example",
      controlPlanes: [
        {
          controlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
          lifecycleState: "ACTIVE",
          transports: [
            {
              kind: "polling",
              protocolVersion: PROTOCOL_VERSION,
              baseUrl: "https://cloud.example",
              pollPath: "/worker/poll",
              heartbeatPath: "/worker/heartbeat",
            },
          ],
        },
      ],
    });
    expect(doc.protocolVersion).toBe(PROTOCOL_VERSION);
    expect(doc.compatibilityWindow).toEqual(WORKER_PROTOCOL_COMPATIBILITY_WINDOW);
    expect(listAdvertisedTransportKinds(doc)).toEqual(["polling"]);
  });

  it("normalizes polling baseUrl from public API URL (endpoint rotation)", () => {
    const doc = buildWorkerServiceDiscoveryDocument({
      protocolVersion: PROTOCOL_VERSION,
      publicApiBaseUrl: "https://new-host.example",
      controlPlanes: [
        {
          controlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
          lifecycleState: "DRAINING",
          transports: [
            {
              kind: "polling",
              protocolVersion: PROTOCOL_VERSION,
              baseUrl: "",
              pollPath: "/worker/poll",
              heartbeatPath: "/worker/heartbeat",
            },
          ],
        },
      ],
    });
    const polling = doc.controlPlanes[0]?.transports[0];
    expect(polling?.kind).toBe("polling");
    if (polling?.kind === "polling") {
      expect(polling.baseUrl).toBe("https://new-host.example");
    }
  });
});
