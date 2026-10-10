import { describe, expect, it } from "vitest";
import { summarizePairedWorkers } from "./onboarding-status.js";

describe("summarizePairedWorkers", () => {
  it("treats a later healthy Worker as enough when the first is not ready", () => {
    const pool = summarizePairedWorkers({
      devices: [
        { name: "studio", ready: false },
        { name: "laptop", ready: true },
      ],
    });
    expect(pool.paired).toBe(true);
    expect(pool.workerReady).toBe(true);
    expect(pool.detail).toContain("2 Workers");
  });
});