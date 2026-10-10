import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parsePerformanceEnvelope, runEnvelopeLoadSuite } from "@kivro/release-ops";

const root = path.resolve(import.meta.dirname, "../..");

/** M27-GOLD-001 / HARD-019 */
describe("M27 performance envelope — authoritative artifact", () => {
  it("M27-GOLD-001 loads docs envelope and passes both-profile load suite", () => {
    const raw = JSON.parse(
      fs.readFileSync(path.join(root, "docs/audits/M27-performance-envelope.json"), "utf8"),
    );
    const envelope = parsePerformanceEnvelope(raw);
    expect(runEnvelopeLoadSuite(envelope).ok).toBe(true);
  });
});
