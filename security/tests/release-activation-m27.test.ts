import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertRequiredOperationalAlarms,
  evaluateReleaseActivation,
  parseOperationalAlarmsManifest,
} from "@kivro/release-ops";

const root = path.resolve(import.meta.dirname, "../..");

/** M27-GOLD-002 / M27-GOLD-003 / HARD-027 */
describe("M27 release activation — live audit artifacts", () => {
  it("M27-GOLD-005 operational alarms manifest includes required signals", () => {
    const raw = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M27-operational-alarms.json"), "utf8"),
    );
    expect(assertRequiredOperationalAlarms(parseOperationalAlarmsManifest(raw)).ok).toBe(true);
  });

  it("M27-GOLD-003 unified manifest + parity satisfies activation when M26 complete", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/unified-release-manifest.json"), "utf8"),
    );
    const parity = JSON.parse(
      fs.readFileSync(path.join(root, manifest.parityReportPath), "utf8"),
    );
    const conformance = JSON.parse(
      fs.readFileSync(path.join(root, manifest.conformanceManifestPath), "utf8"),
    );
    const m25 = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M25-exit-criteria.json"), "utf8"),
    );
    const m26 = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M26-exit-criteria.json"), "utf8"),
    );
    const r = evaluateReleaseActivation({
      manifest,
      parityReport: parity,
      conformanceManifest: conformance,
      m25HarnessComplete: m25.m25HarnessComplete === true,
      m26HarnessComplete: m26.m26HarnessComplete === true,
      performanceEnvelopeValid: true,
    });
    expect(r.ok).toBe(true);
  });
});
