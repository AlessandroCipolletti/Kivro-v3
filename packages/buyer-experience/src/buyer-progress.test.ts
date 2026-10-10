import { describe, expect, it } from "vitest";
import { sanitizeBuyerProgressCheckpoints } from "./buyer-progress.js";

describe("sanitizeBuyerProgressCheckpoints (BUYERUX-010)", () => {
  it("drops stages that look like secrets", () => {
    const out = sanitizeBuyerProgressCheckpoints([
      { stageLabel: "Parsing input", recordedAt: new Date("2026-01-01T00:00:00Z") },
      { stageLabel: "Loaded api_key from env", recordedAt: new Date("2026-01-01T00:01:00Z") },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]?.stageLabel).toBe("Parsing input");
  });
});
