import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("SELLERUX-035 public seller API", () => {
  it("marketplace seller route uses public identity guard", () => {
    const src = fs.readFileSync(
      path.join(root, "apps/api/src/routes/marketplace-sellers.ts"),
      "utf8",
    );
    expect(src).toContain("buildPublicSellerIdentity");
    expect(src).toContain("assertPublicSellerPayloadSafe");
    expect(src).not.toContain("legalNameForKyc");
  });
});
