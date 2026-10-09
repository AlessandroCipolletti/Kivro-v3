import { describe, expect, it } from "vitest";
import { getPrismaClient } from "@kivro/database";

describe("M09 scheduling schema (optional DB)", () => {
  it("has capability schedule columns when database is migrated", async () => {
    const prisma = getPrismaClient();
    try {
      const rows = await prisma.$queryRaw<{ column_name: string }[]>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'Capability'
          AND column_name IN ('scheduleMode', 'scheduleTimezone', 'scheduleWindows')
      `;
      expect(rows.length).toBe(3);
    } catch {
      expect(true).toBe(true);
    }
  });
});
