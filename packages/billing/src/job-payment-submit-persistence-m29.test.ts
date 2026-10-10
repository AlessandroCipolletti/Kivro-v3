import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** ASYNC-003/004 — structural evidence that submit persists inputs with the job. */
describe("submitPaidJob persistence contract (M29)", () => {
  it("creates JobInput inside the payment transaction", () => {
    const src = fs.readFileSync(path.join(import.meta.dirname, "job-payment.ts"), "utf8");
    const txStart = src.indexOf("$transaction");
    expect(txStart).toBeGreaterThan(0);
    const txBlock = src.slice(txStart, txStart + 2500);
    expect(txBlock).toContain("jobInput.create");
    expect(txBlock).toContain("structuredInput");
  });
});
