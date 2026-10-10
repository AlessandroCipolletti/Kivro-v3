import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M28 golden registry wiring", () => {
  it("registry includes M28 terminal audit scenarios", () => {
    const registry = JSON.parse(
      fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
    );
    const ids = registry.scenarios.map((s: { id: string }) => s.id);
    for (const id of [
      "M28-GOLD-001",
      "M28-GOLD-002",
      "M28-GOLD-003",
      "M28-GOLD-004",
      "M28-GOLD-005",
      "M28-GOLD-006",
    ]) {
      expect(ids).toContain(id);
    }
  });
});
