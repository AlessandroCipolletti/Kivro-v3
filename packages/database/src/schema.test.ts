import { describe, expect, it } from "vitest";
import { JobStatus, LedgerEntryType } from "@prisma/client";

describe("Prisma domain enums", () => {
  it("includes core job statuses", () => {
    expect(JobStatus.CREATED).toBe("CREATED");
    expect(JobStatus.COMPLETED).toBe("COMPLETED");
  });

  it("includes ledger types", () => {
    expect(LedgerEntryType.JOB_CAPTURE).toBe("JOB_CAPTURE");
  });
});
