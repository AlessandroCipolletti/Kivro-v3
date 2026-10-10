import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const golden = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
) as { scenarios: Array<{ id: string }> };

const M32_GOLD = [
  "SELLERUX-GOLD-001",
  "SELLERUX-GOLD-002",
  "SELLERUX-GOLD-003",
  "SELLERUX-GOLD-004",
  "SELLERUX-GOLD-005",
  "SELLERUX-GOLD-006",
  "SELLERUX-GOLD-012",
  "SELLERUX-GOLD-016",
  "SELLERUX-GOLD-017",
  "SELLERUX-GOLD-018",
];

describe("M32 SELLERUX-GOLD registry", () => {
  it("golden registry lists M32 exit SELLERUX-GOLD scenarios", () => {
    const ids = new Set(golden.scenarios.map((s) => s.id));
    for (const id of M32_GOLD) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("SELLERUX-GOLD-001 guided onboarding", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/onboarding-status.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(root, "apps/web/src/app/seller/onboarding/page.tsx"))).toBe(true);
  });

  it("SELLERUX-GOLD-002 discovery consent", () => {
    expect(fs.existsSync(path.join(root, "packages/capability-publish/src/import-consent.ts"))).toBe(
      true,
    );
  });

  it("SELLERUX-GOLD-003 AI draft boundary", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/ai-draft-boundary.ts"))).toBe(
      true,
    );
  });

  it("SELLERUX-GOLD-004 dependency permission review", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/effective-permissions.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(root, "packages/capability-publish/src/dependency-analyze.ts"))).toBe(
      true,
    );
  });

  it("SELLERUX-GOLD-005 buyer preview readiness", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/draft-buyer-preview.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/publish-readiness.ts"))).toBe(
      true,
    );
  });

  it("SELLERUX-GOLD-006 secrets health", () => {
    expect(fs.existsSync(path.join(root, "packages/worker-store/src/local-credentials.ts"))).toBe(true);
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/credential-ref-metadata.ts"))).toBe(
      true,
    );
  });

  it("SELLERUX-GOLD-012 version diff", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/semantic-version-diff.ts"))).toBe(
      true,
    );
  });

  it("SELLERUX-GOLD-016 doctor diagnostics", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/doctor-sanitize.ts"))).toBe(true);
  });

  it("SELLERUX-GOLD-017 security disclosure", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/seller-security-disclosure.ts"))).toBe(
      true,
    );
  });

  it("SELLERUX-GOLD-018 marketplace identity", () => {
    expect(fs.existsSync(path.join(root, "packages/seller-experience/src/marketplace-identity.ts"))).toBe(
      true,
    );
  });
});
