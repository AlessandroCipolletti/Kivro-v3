import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M27 exit criteria artifact", () => {
  it("M27-exit-criteria.json reports harness complete", () => {
    const doc = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M27-exit-criteria.json"), "utf8"),
    );
    expect(doc.m27HarnessComplete).toBe(true);
  });
});
