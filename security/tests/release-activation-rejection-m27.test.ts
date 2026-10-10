import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateReleaseActivation } from "@kivro/release-ops";

const root = path.resolve(import.meta.dirname, "../..");

/** M27-GOLD-002 — activation must fail closed on incomplete evidence */
describe("M27 release activation rejections", () => {
  it("M27-GOLD-002 blocks activation when M26 harness is incomplete", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/unified-release-manifest.json"), "utf8"),
    );
    const parity = JSON.parse(
      fs.readFileSync(path.join(root, manifest.parityReportPath), "utf8"),
    );
    const conformance = JSON.parse(
      fs.readFileSync(path.join(root, manifest.conformanceManifestPath), "utf8"),
    );
    const r = evaluateReleaseActivation({
      manifest,
      parityReport: parity,
      conformanceManifest: conformance,
      m25HarnessComplete: true,
      m26HarnessComplete: false,
      performanceEnvelopeValid: true,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reasons.some((x) => x.includes("M26"))).toBe(true);
    }
  });

  it("M27-GOLD-002 blocks activation when M25 harness is incomplete", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/unified-release-manifest.json"), "utf8"),
    );
    const parity = JSON.parse(
      fs.readFileSync(path.join(root, manifest.parityReportPath), "utf8"),
    );
    const conformance = JSON.parse(
      fs.readFileSync(path.join(root, manifest.conformanceManifestPath), "utf8"),
    );
    const r = evaluateReleaseActivation({
      manifest,
      parityReport: parity,
      conformanceManifest: conformance,
      m25HarnessComplete: false,
      m26HarnessComplete: true,
      performanceEnvelopeValid: true,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reasons.some((x) => x.includes("M25"))).toBe(true);
    }
  });
});
