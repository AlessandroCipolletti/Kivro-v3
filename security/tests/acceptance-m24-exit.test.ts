import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

/** Runs at end of verify:m24 after audit-m24-exit-criteria.mjs */
describe("M24 exit criteria artifact", () => {
  it("reports harness complete after full verify flow steps", () => {
    const exitPath = path.join(root, "docs/audits/M24-exit-criteria.json");
    expect(fs.existsSync(exitPath)).toBe(true);
    const exitDoc = JSON.parse(fs.readFileSync(exitPath, "utf8")) as {
      m24HarnessComplete: boolean;
      criteria: { id: string; status: string }[];
    };
    expect(exitDoc.m24HarnessComplete).toBe(true);
    const open = exitDoc.criteria.filter((c) => !String(c.status).startsWith("DEFERRED"));
    expect(open.every((c) => c.status === "PASS")).toBe(true);
  });
});
