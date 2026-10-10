import { describe, expect, it, vi } from "vitest";

vi.mock("@kivro/storage", () => ({
  readObjectBytes: vi.fn(async () => new Uint8Array([1, 2, 3])),
}));

import { buildResultZipBuffer } from "./result-bundle.js";

describe("buildResultZipBuffer (BUYERUX-009)", () => {
  it("rejects empty entry list", async () => {
    const result = await buildResultZipBuffer([]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("NO_ENTRIES");
    }
  });

  it("rejects unsafe zip paths", async () => {
    const result = await buildResultZipBuffer([
      { zipPath: "../escape.bin", bucket: "b", objectKey: "k" },
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("UNSAFE_PATH");
    }
  });

  it("builds zip for safe entries", async () => {
    const result = await buildResultZipBuffer([
      { zipPath: "report.pdf", bucket: "b", objectKey: "k" },
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.buffer.length).toBeGreaterThan(0);
    }
  });
});
