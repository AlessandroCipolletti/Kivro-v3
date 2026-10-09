import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("M18 acceptance — local dev perimeter", () => {
  it("Docker Compose includes postgres, redis, minio", () => {
    const compose = fs.readFileSync(path.join(root, "docker-compose.yml"), "utf8");
    expect(compose).toMatch(/postgres:/);
    expect(compose).toMatch(/redis:/);
    expect(compose).toMatch(/minio:/);
  });

  it("documents dev commands and §573 checklist", () => {
    for (const rel of [
      "docs/DEV-LOCAL.md",
      "docs/testing/LOCAL-DEV-E2E-CHECKLIST.md",
      "docs/milestones/M18-closure.md",
      "docs/milestones/M18-manual-validation.md",
    ]) {
      expect(fs.existsSync(path.join(root, rel))).toBe(true);
    }
  });

  it("package scripts expose dev:setup, worker:dev, dev:demo, verify:m18", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts["dev:setup"]).toBeTruthy();
    expect(pkg.scripts["worker:dev"]).toBeTruthy();
    expect(pkg.scripts["dev:demo"]).toBeTruthy();
    expect(pkg.scripts["verify:m18"]).toBeTruthy();
    expect(pkg.scripts["test:e2e:local"]).toContain("test-e2e-local");
  });

  it(".env.example documents local endpoints and dev flags", () => {
    const example = fs.readFileSync(path.join(root, ".env.example"), "utf8");
    expect(example).toMatch(/REDIS_URL=/);
    expect(example).toMatch(/KIVRO_FAKE_PAYMENT_ADAPTER=/);
    expect(example).toMatch(/KIVRO_DEV_PAYMENT_SHORTCUTS=true/);
  });
});
