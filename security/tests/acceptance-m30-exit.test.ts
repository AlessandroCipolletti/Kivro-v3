import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M30 exit criteria artifact", () => {
  it("m30HarnessComplete when audit JSON present", () => {
    const doc = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M30-exit-criteria.json"), "utf8"),
    );
    expect(doc.m30HarnessComplete).toBe(true);
  });
});
