import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const golden = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
) as { scenarios: Array<{ id: string }> };

describe("M34 SELLERUX-GOLD registry", () => {
  it("golden registry lists SELLERUX-GOLD-019", () => {
    expect(golden.scenarios.some((s) => s.id === "SELLERUX-GOLD-019")).toBe(true);
  });

  it("SELLERUX-GOLD-019 multi-worker routing is shared", () => {
    const routing = fs.readFileSync(
      path.join(root, "packages/job-scheduling/src/worker-routing.ts"),
      "utf8",
    );
    const availability = fs.readFileSync(
      path.join(root, "packages/job-scheduling/src/availability-service.ts"),
      "utf8",
    );
    const dispatch = fs.readFileSync(
      path.join(root, "packages/job-dispatch/src/dispatch-service.ts"),
      "utf8",
    );
    expect(routing).toContain("selectEligibleAssignedWorker");
    expect(availability).not.toContain("bindings[0]");
    expect(dispatch).toContain("assertWorkerAssignedToVersion");
    expect(dispatch).toContain('status: "QUEUED"');
    const publish = fs.readFileSync(
      path.join(root, "packages/capability-publish/src/publish.ts"),
      "utf8",
    );
    expect(publish).toContain("assignmentsToCarryForward");
    expect(fs.existsSync(path.join(root, "apps/api/src/routes/seller-workers.ts"))).toBe(true);
  });
});
