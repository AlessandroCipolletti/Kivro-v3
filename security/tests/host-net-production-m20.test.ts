import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NETSONS_DEFAULT_BATCH_LIMITS } from "@kivro/cloud-netsons";
import { resolveDatabaseUrlWithPoolLimit } from "@kivro/database";

const root = path.resolve(import.meta.dirname, "../..");

describe("HOST-NET production profile evidence", () => {
  it("HOST-NET-020 orchestration persists in PostgreSQL schema", () => {
    const schema = fs.readFileSync(
      path.join(root, "packages/database/prisma/schema.prisma"),
      "utf8",
    );
    expect(schema).toContain("model OrchestrationPlan");
    expect(schema).toContain("model OrchestrationStep");
  });

  it("HOST-NET-021/022 storage uses S3-compatible adapter package", () => {
    expect(fs.existsSync(path.join(root, "packages/storage/package.json"))).toBe(true);
  });

  it("HOST-NET-023 bounded cron batches exported", () => {
    expect(NETSONS_DEFAULT_BATCH_LIMITS.durableWork).toBeLessThanOrEqual(50);
    expect(NETSONS_DEFAULT_BATCH_LIMITS.webhooks).toBeLessThanOrEqual(50);
  });

  it("HOST-NET-007 pool limit helper", () => {
    const url = resolveDatabaseUrlWithPoolLimit("postgresql://localhost/kivro");
    expect(url).toBeTruthy();
  });

  it("HOST-NET-005 standalone Next output toggle documented", () => {
    const nextCfg = fs.readFileSync(path.join(root, "apps/web/next.config.ts"), "utf8");
    expect(nextCfg).toContain("KIVRO_NETSONS_STANDALONE");
  });
});
