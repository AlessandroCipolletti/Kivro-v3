import { describe, expect, it } from "vitest";
import { networkPrimitivesForPurpose } from "./network-purpose.js";

describe("network purpose", () => {
  it("does not grant extra network primitives", () => {
    expect(networkPrimitivesForPurpose("NONE")).toEqual([]);
    expect(networkPrimitivesForPurpose("PUBLIC_HTTPS")).toEqual(["https"]);
    expect(networkPrimitivesForPurpose("DECLARED_HOST")).not.toContain("shell");
  });
});
