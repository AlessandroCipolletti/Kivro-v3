import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M29 exit criteria artifact", () => {
  it("M29 exit JSON reports harness complete", () => {
    const doc = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M29-exit-criteria.json"), "utf8"),
    );
    expect(doc.m29HarnessComplete).toBe(true);
  });
});
