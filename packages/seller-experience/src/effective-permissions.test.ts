import { describe, expect, it } from "vitest";
import { buildEffectivePermissionSummary } from "./effective-permissions.js";

describe("effective permissions SELLERUX-006", () => {
  it("mirrors manifest categories in human-readable rows", () => {
    const summary = buildEffectivePermissionSummary({
      permissionManifest: {
        manifestVersion: 1,
        categories: [
          {
            key: "AI_INFERENCE",
            buyerLabel: "AI inference",
            state: "USED",
            detail: "Sandbox inference",
          },
          {
            key: "LOCAL_FILES",
            buyerLabel: "Local files",
            state: "NOT_USED",
            detail: "",
          },
        ],
      },
    });
    expect(summary.rows).toHaveLength(2);
    expect(summary.rows.find((r) => r.key === "AI_INFERENCE")?.state).toBe("ACTIVE");
    expect(summary.rows.find((r) => r.key === "LOCAL_FILES")?.state).toBe("NOT_USED");
  });
});
