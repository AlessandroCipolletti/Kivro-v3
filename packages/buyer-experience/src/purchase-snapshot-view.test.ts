import { describe, expect, it } from "vitest";
import { buildPurchaseSnapshotView } from "./purchase-snapshot-view.js";

describe("historical job contract", () => {
  it("shows the contract frozen on the job", () => {
    const view = buildPurchaseSnapshotView({
      capabilityId: "cap",
      versionNumber: 1,
      priceSnapshotCents: 800,
      currency: "USD",
      platformFeeSnapshotCents: 80,
      sellerNetSnapshotCents: 720,
      permissionManifestSnapshot: {},
      inputContractSnapshot: { fields: [{ key: "scene", type: "FILE" }] },
      outputContractSnapshot: { fields: [{ key: "render", type: "FILE" }] },
      scheduledRunAt: null,
      buyerHardDeadlineAt: null,
    });
    expect(view.versionNumber).toBe(1);
    expect(view.inputContract).toEqual({ fields: [{ key: "scene", type: "FILE" }] });
    expect(view.outputContract).toEqual({ fields: [{ key: "render", type: "FILE" }] });
  });
});
