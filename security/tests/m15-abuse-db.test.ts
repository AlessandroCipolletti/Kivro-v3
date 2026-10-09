import { beforeAll, describe, expect, it } from "vitest";
import { getPrismaClient } from "@kivro/database";
import { evaluateCapabilityAbuseTriage } from "@kivro/abuse-controls";

let dbReady = false;

beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    return;
  }
  try {
    await getPrismaClient().$queryRaw`SELECT "id" FROM "AbuseReport" LIMIT 1`;
    dbReady = true;
  } catch {
    dbReady = false;
  }
});

describe("M15 abuse triage (database)", () => {
  it("returns open report count for unknown capability", async (ctx) => {
    if (!dbReady) {
      ctx.skip();
    }
    const result = await evaluateCapabilityAbuseTriage(
      getPrismaClient(),
      "00000000-0000-0000-0000-000000000000",
    );
    expect(result.openReports).toBe(0);
    expect(result.paused).toBe(false);
  });
});
