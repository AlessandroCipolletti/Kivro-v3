import { describe, expect, it } from "vitest";
import { classifySellerTransferStatus } from "./earnings-dashboard.js";

describe("classifySellerTransferStatus", () => {
  it("splits ledger statuses into pending, available, and paid", () => {
    expect(classifySellerTransferStatus("PENDING_CONNECT")).toBe("pending");
    expect(classifySellerTransferStatus("RECORDED")).toBe("available");
    expect(classifySellerTransferStatus("DEV_LEDGER_ONLY")).toBe("available");
    expect(classifySellerTransferStatus("TRANSFERRED")).toBe("paid");
  });
});
