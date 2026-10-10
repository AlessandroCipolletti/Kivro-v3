import { describe, expect, it } from "vitest";
import { backendTransitionRequiresWorkerBinaryUpdate } from "@kivro/compatibility";

describe("M25 backend transition (HARD-013)", () => {
  it("M25-GOLD-003 does not require binary update when protocol and transports match", () => {
    expect(
      backendTransitionRequiresWorkerBinaryUpdate({
        workerProtocolVersion: 1,
        workerAlreadySupportsTransports: ["polling", "wss"],
        targetActiveTransports: ["wss"],
      }),
    ).toBe(false);
  });

  it("requires update when Worker lacks advertised transport", () => {
    expect(
      backendTransitionRequiresWorkerBinaryUpdate({
        workerProtocolVersion: 1,
        workerAlreadySupportsTransports: ["polling"],
        targetActiveTransports: ["wss"],
      }),
    ).toBe(true);
  });
});
