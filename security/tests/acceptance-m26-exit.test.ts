import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M26 exit criteria artifact", () => {
  it("reports harness complete with fitness report", () => {
    const doc = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M26-exit-criteria.json"), "utf8"),
    ) as { m26HarnessComplete: boolean };
    expect(doc.m26HarnessComplete).toBe(true);
    expect(fs.existsSync(path.join(root, "docs/audits/M26-fitness-report.json"))).toBe(true);
  });
});
