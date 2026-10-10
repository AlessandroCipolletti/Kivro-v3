import { describe, expect, it, vi } from "vitest";

vi.mock("@kivro/storage", () => ({
  deleteObject: vi.fn(async () => {}),
}));

describe("purgeExpiredJobDeliverables (ASYNC-GOLD-007)", () => {
  it("deletes expired JOB_DELIVERABLE rows", async () => {
    const { purgeExpiredJobDeliverables } = await import("./retention-cleanup.js");
    const { deleteObject } = await import("@kivro/storage");
    const prisma = {
      storedAsset: {
        findMany: vi.fn(async () => [
          {
            id: "a1",
            bucket: "b",
            objectKey: "k",
            purpose: "JOB_DELIVERABLE",
          },
        ]),
        delete: vi.fn(async () => ({})),
      },
    };
    const result = await purgeExpiredJobDeliverables(prisma as never);
    expect(result.purgedAssets).toBe(1);
    expect(deleteObject).toHaveBeenCalledWith({ bucket: "b", objectKey: "k" });
  });
});
