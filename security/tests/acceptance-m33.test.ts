import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M33 acceptance", () => {
  it("schema revision includes M33 migration", () => {
    const matrix = JSON.parse(
      fs.readFileSync(path.join(root, "packages/compatibility/matrix.json"), "utf8"),
    ) as { database: { schemaRevision: string } };
    expect(matrix.database.schemaRevision).toBe("20260410210000");
  });

  it("seller operations mounted from server composition root", () => {
    const src = fs.readFileSync(path.join(root, "apps/api/src/server.ts"), "utf8");
    expect(src).toContain("sellerOperationsRoutes");
  });
});
