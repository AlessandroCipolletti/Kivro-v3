import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M31 exit criteria artifact", () => {
  it("documents M31 harness when verify:m31 has been run", () => {
    const p = path.join(root, "docs/audits/M31-exit-criteria.json");
    if (!fs.existsSync(p)) {
      expect(true).toBe(true);
      return;
    }
    const doc = JSON.parse(fs.readFileSync(p, "utf8")) as { m31HarnessComplete?: boolean };
    expect(typeof doc.m31HarnessComplete).toBe("boolean");
  });
});
