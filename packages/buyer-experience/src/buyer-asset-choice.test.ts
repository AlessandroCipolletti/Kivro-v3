import { describe, expect, it } from "vitest";
import { buyerAssetChoice } from "./buyer-asset-choice.js";

describe("buyer asset choice", () => {
  it("lets the buyer reuse an asset they own and refuses someone else's", () => {
    expect(buyerAssetChoice({ assetId: null, requesterId: "buyer", ownerId: null })).toBe("upload_new");
    expect(
      buyerAssetChoice({ assetId: "asset-1", requesterId: "buyer", ownerId: "buyer" }),
    ).toBe("reuse_previous");
    expect(
      buyerAssetChoice({ assetId: "asset-2", requesterId: "buyer", ownerId: "other" }),
    ).toBe("forbidden");
  });
});
