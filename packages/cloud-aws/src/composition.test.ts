import { describe, expect, it } from "vitest";
import { AWS_DEFAULT_CONTROL_PLANE_ID, createAwsComposition } from "./index.js";

describe("cloud-aws composition root", () => {
  it("exposes wss baseline transport (ARCH-UNI-008)", () => {
    const c = createAwsComposition();
    expect(c.profile).toBe("aws");
    expect(c.workerTransport.kind).toBe("wss");
    expect(c.durableWorkProfile).toBe("aws-managed-queue");
    expect(c.workerTransport.buildPoll().controlPlaneId).toBe(AWS_DEFAULT_CONTROL_PLANE_ID);
  });
});
