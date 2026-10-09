import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("M16 acceptance — fixtures & release gates", () => {
  it("fixture catalog resolves", () => {
    const catalog = JSON.parse(
      fs.readFileSync(path.join(root, "tests/fixtures/catalog.json"), "utf8"),
    ) as { entries: Array<{ path: string }> };
    for (const entry of catalog.entries) {
      expect(fs.existsSync(path.join(root, entry.path))).toBe(true);
    }
  });

  it("documents §39–§46 artifacts", () => {
    for (const rel of [
      "docs/architecture/IMPLEMENTATION-ROADMAP-STATUS.md",
      "docs/API-CONTRACT-MVP.md",
      "docs/MCP-API-FUTURE.md",
      "docs/OPENCLAW-STUDY-NOTES.md",
      "docs/TECH-EXPERIMENTS.md",
      "docs/MVP-SUCCESS-CHECKLIST.md",
      "docs/PRODUCT-VALIDATION.md",
      "docs/RELEASE-GATES.md",
    ]) {
      expect(fs.existsSync(path.join(root, rel))).toBe(true);
    }
  });
});

describe("M16 acceptance — repository structure §40", () => {
  it("monorepo layout matches spec intent", () => {
    for (const dir of ["apps/api", "apps/web", "packages/contracts", "security"]) {
      expect(fs.existsSync(path.join(root, dir))).toBe(true);
    }
  });
});
