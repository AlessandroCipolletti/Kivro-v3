import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M29 durable async delivery milestone", () => {
  it("exposes verify:m29 deliverables", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m29"]).toBeTruthy();
    expect(fs.existsSync(path.join(root, "scripts/verify-m29-flow.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(root, "scripts/verify-m29-async-evidence.mjs"))).toBe(true);
    expect(fs.existsSync(path.join(root, "packages/database/prisma/migrations/20260410150000_m29_async_retention"))).toBe(
      true,
    );
  });
});
