import { describe, expect, it } from "vitest";
import { planSafeDownloadBundleEntries } from "./download-bundle-plan.js";

describe("planSafeDownloadBundleEntries (BUYERUX-022)", () => {
  it("dedupes zip paths and strips traversal", () => {
    const plan = planSafeDownloadBundleEntries([
      { id: "1", filename: "../evil.pdf" },
      { id: "2", filename: "evil.pdf" },
    ]);
    expect(plan.ok).toBe(true);
    if (plan.ok) {
      expect(plan.entries.every((e) => !e.zipPath.includes(".."))).toBe(true);
      expect(new Set(plan.entries.map((e) => e.zipPath)).size).toBe(2);
    }
  });
});
