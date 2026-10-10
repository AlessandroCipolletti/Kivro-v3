import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M25 exit criteria artifact", () => {
  it("reports harness complete", () => {
    const doc = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M25-exit-criteria.json"), "utf8"),
    ) as { m25HarnessComplete: boolean };
    expect(doc.m25HarnessComplete).toBe(true);
  });
});
