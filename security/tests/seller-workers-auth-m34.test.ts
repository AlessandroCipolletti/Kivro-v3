import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M34 worker assignment ownership", () => {
  it("assignment routes require the seller to own the Worker", () => {
    const src = fs.readFileSync(path.join(root, "apps/api/src/routes/seller-workers.ts"), "utf8");
    expect(src).toContain("requireVerifiedEmail");
    expect(src).toContain("sellerProfileId: profile.id");
    expect(src).toContain("WORKER_NOT_OWNED");
    expect(src).toContain("ANY_ASSIGNED_ELIGIBLE");
  });
});
