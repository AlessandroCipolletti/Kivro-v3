import { describe, expect, it } from "vitest";
import { backendTransitionRequiresWorkerBinaryUpdate } from "./backend-transition.js";

describe("backendTransitionRequiresWorkerBinaryUpdate", () => {
  it("requires update when protocol out of window", () => {
    expect(
      backendTransitionRequiresWorkerBinaryUpdate({
        workerProtocolVersion: 0,
        workerAlreadySupportsTransports: ["polling", "wss"],
        targetActiveTransports: ["wss"],
      }),
    ).toBe(true);
  });
});
