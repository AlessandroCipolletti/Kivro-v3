import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("M34 acceptance", () => {
  it("schema revision includes multi-worker routing", () => {
    const matrix = JSON.parse(
      fs.readFileSync(path.join(root, "packages/compatibility/matrix.json"), "utf8"),
    ) as { database: { schemaRevision: string } };
    expect(matrix.database.schemaRevision >= "20260410220000").toBe(true);
  });

  it("seller worker routes are mounted once", () => {
    const src = fs.readFileSync(path.join(root, "apps/api/src/server.ts"), "utf8");
    expect(src).toContain("sellerWorkerRoutes");
  });
});
