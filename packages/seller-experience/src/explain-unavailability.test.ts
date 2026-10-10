import { describe, expect, it } from "vitest";
import { buildExplainableUnavailability } from "./explain-unavailability.js";

describe("buildExplainableUnavailability", () => {
  it("maps concurrency and maintenance with seller copy", () => {
    const rows = buildExplainableUnavailability({
      reasons: ["CONCURRENCY_LIMIT", "SELLER_MAINTENANCE"],
      maintenanceMessage: "Upgrading OpenClaw",
      maintenanceExpectedReturnAt: "2026-04-10T18:00:00.000Z",
    });
    expect(rows[0]?.code).toBe("CONCURRENCY_LIMIT");
    expect(rows[1]?.detail).toContain("Upgrading OpenClaw");
    expect(rows[1]?.detail).toContain("Expected return");
    expect(rows[0]?.remediation).toContain("capacity");
  });
});
