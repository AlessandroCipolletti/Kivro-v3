import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { marketplaceAvailabilityUi } from "../../apps/web/src/lib/status-ui.js";

describe("M14 acceptance — design system doc §541", () => {
  it("documents the design system", () => {
    const doc = path.resolve("docs/design-system.md");
    expect(fs.existsSync(doc)).toBe(true);
    expect(fs.readFileSync(doc, "utf8")).toContain("StatusBadge");
  });
});

describe("M14 acceptance — status consistency §533", () => {
  it("uses the same label for online accepting capabilities", () => {
    expect(marketplaceAvailabilityUi({ status: "ONLINE", accepting: true }).label).toBe(
      "Available now",
    );
  });
});
