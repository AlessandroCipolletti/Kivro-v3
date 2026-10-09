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

  it("documents §39–§46 and §88–§92 artifacts", () => {
    for (const rel of [
      "docs/architecture/IMPLEMENTATION-ROADMAP-STATUS.md",
      "docs/API-CONTRACT-MVP.md",
      "docs/MCP-API-FUTURE.md",
      "docs/OPENCLAW-STUDY-NOTES.md",
      "docs/TECH-EXPERIMENTS.md",
      "docs/MVP-SUCCESS-CHECKLIST.md",
      "docs/PRODUCT-VALIDATION.md",
      "docs/RELEASE-GATES.md",
      "docs/testing/HAPPY-PATH-TRACE.md",
      "docs/testing/FAILURE-PATH-TRACE.md",
      "docs/testing/SECURITY-RELEASE-GATE.md",
      "docs/testing/PRODUCT-RELEASE-GATE.md",
      "docs/testing/INTEGRATION-TEST-MATRIX.md",
    ]) {
      expect(fs.existsSync(path.join(root, rel))).toBe(true);
    }
  });

  it("§88 happy-path trace JSON is wired", () => {
    const trace = JSON.parse(
      fs.readFileSync(path.join(root, "tests/fixtures/happy-path-trace.json"), "utf8"),
    ) as { steps: unknown[] };
    expect(trace.steps.length).toBeGreaterThanOrEqual(10);
  });

  it("§91 security gate lists automated tests", () => {
    const gate = JSON.parse(
      fs.readFileSync(path.join(root, "tests/fixtures/security-release-gate.json"), "utf8"),
    ) as { automated: unknown[] };
    expect(gate.automated.length).toBeGreaterThanOrEqual(6);
  });
});

describe("M16 acceptance — repository structure §40", () => {
  it("monorepo layout matches spec intent", () => {
    for (const dir of [
      "apps/api",
      "apps/web",
      "apps/worker",
      "packages/contracts",
      "packages/job-protocol",
      "packages/policy-engine",
      "packages/openclaw-adapter",
      "security",
    ]) {
      expect(fs.existsSync(path.join(root, dir))).toBe(true);
    }
  });
});

describe("M16 acceptance — §95 implementation objective", () => {
  it("README references spec authority and milestone gates", () => {
    const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
    expect(readme).toMatch(/MASTER-SPEC/);
    expect(readme).toMatch(/IMPLEMENTATION-PLAN/);
  });
});
