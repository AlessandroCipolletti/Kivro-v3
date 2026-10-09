import { describe, expect, it } from "vitest";
import {
  jobCaptureIdempotencyKey,
  jobReleaseIdempotencyKey,
  creditPurchaseIdempotencyKey,
} from "./ledger-service.js";
import { buildLedgerIdempotencyKey } from "./ledger.js";

describe("payment idempotency keys", () => {
  it("uses stable job-scoped keys", () => {
    const jobId = "job-abc";
    expect(jobCaptureIdempotencyKey(jobId)).toBe("job:job-abc:capture");
    expect(jobReleaseIdempotencyKey(jobId)).toBe("job:job-abc:release");
    expect(buildLedgerIdempotencyKey(["job", jobId, "seller-earning"])).toBe(
      "job:job-abc:seller-earning",
    );
  });

  it("scopes credit purchases by external id", () => {
    expect(creditPurchaseIdempotencyKey("cs_test_1")).toBe("credit:cs_test_1");
  });
});
