import { describe, expect, it } from "vitest";
import { NETSONS_DEFAULT_CONTROL_PLANE_ID, createNetsonsComposition } from "./index.js";

describe("cloud-netsons composition root", () => {
  it("exposes polling baseline transport (ARCH-UNI-007)", () => {
    const c = createNetsonsComposition();
    expect(c.profile).toBe("netsons");
    expect(c.workerTransport.kind).toBe("polling");
    expect(c.durableWorkProfile).toBe("netsons-db-cron");
    expect(c.workerTransport.buildPoll().controlPlaneId).toBe(NETSONS_DEFAULT_CONTROL_PLANE_ID);
  });
});
