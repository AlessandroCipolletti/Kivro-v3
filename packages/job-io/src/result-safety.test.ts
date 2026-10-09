import { describe, expect, it } from "vitest";
import {
  escapeForSafeTextDisplay,
  normalizeTextOutput,
  safeExternalUrlForRender,
  sanitizeDownloadFilename,
} from "./result-safety.js";

describe("result safety §31", () => {
  it("escapes HTML-like output", () => {
    expect(escapeForSafeTextDisplay("<script>x</script>")).not.toContain("<script");
  });

  it("rejects non-http(s) URLs", () => {
    expect(safeExternalUrlForRender("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrlForRender("https://example.com/a")).toBe("https://example.com/a");
  });

  it("normalizes and caps text", () => {
    expect(normalizeTextOutput({ a: 1 }).length).toBeGreaterThan(0);
  });

  it("sanitizes download filenames", () => {
    expect(sanitizeDownloadFilename('evil"\n.exe')).not.toContain('"');
  });
});
