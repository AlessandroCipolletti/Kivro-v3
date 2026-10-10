import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

/** M27-GOLD-001 — golden registry includes performance/release ops scenarios */
describe("M27 golden registry wiring", () => {
  it("M27-GOLD-001 registry lists performance envelope scenarios", () => {
    const registry = JSON.parse(
      fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
    );
    const ids = registry.scenarios.map((s: { id: string }) => s.id);
    for (const id of [
      "M27-GOLD-001",
      "M27-GOLD-002",
      "M27-GOLD-003",
      "M27-GOLD-004",
      "M27-GOLD-005",
      "M27-GOLD-006",
      "M27-GOLD-007",
      "M27-GOLD-008",
      "M27-GOLD-009",
    ]) {
      expect(ids).toContain(id);
    }
  });
});
