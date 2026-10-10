import { describe, expect, it } from "vitest";
import {
  AWS_DEFAULT_CONTROL_PLANE_ID,
  NETSONS_DEFAULT_CONTROL_PLANE_ID,
  jobVisibleOnControlPlane,
  resolveExecutionControlPlaneForDispatch,
} from "@kivro/cloud-core";

/** M26-FAULT-006 — one control-plane outage must not reroute in-flight execution. */
describe("M26 control-plane outage invariants", () => {
  /** M26-GOLD-006 control-plane outage routing */
  it("M26-GOLD-006 in-flight job stays on DRAINING plane during ACTIVE peer outage", () => {
    const inFlight = NETSONS_DEFAULT_CONTROL_PLANE_ID;
    expect(
      resolveExecutionControlPlaneForDispatch({
        existingExecutionControlPlaneId: inFlight,
        proposedControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toBe(inFlight);

    expect(
      jobVisibleOnControlPlane({
        jobExecutionControlPlaneId: inFlight,
        requestControlPlaneId: NETSONS_DEFAULT_CONTROL_PLANE_ID,
        fallbackControlPlaneId: AWS_DEFAULT_CONTROL_PLANE_ID,
      }),
    ).toBe(true);
  });
});
