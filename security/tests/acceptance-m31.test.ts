import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M31 acceptance", () => {
  it("exposes verify:m31 deliverables", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts["verify:m31"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "scripts/verify-m31-flow.mjs"))).toBe(true);
  });
});
