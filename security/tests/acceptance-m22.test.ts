import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M22 dual control-plane milestone", () => {
  it("exposes verify:m22 and migration", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts["verify:m22"]).toBeTruthy();
    expect(
      fs.existsSync(
        path.join(
          root,
          "packages/database/prisma/migrations/20260410140000_m22_execution_control_plane/migration.sql",
        ),
      ),
    ).toBe(true);
  });
});
