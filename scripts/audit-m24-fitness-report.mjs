#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const parity = JSON.parse(
  fs.readFileSync(path.join(root, "docs/audits/M24-provider-parity-report.json"), "utf8"),
);
const golden = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
);
const matrix = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/compatibility-matrix.json"), "utf8"),
);

const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M24",
  goldenScenarioCount: golden.scenarios.length,
  goldenRegistryVersion: golden.version,
  providerParity: parity,
  compatibilityMatrix: matrix,
  fitnessScripts: [
    "scripts/check-architecture.mjs",
    "scripts/check-composition-thinness.mjs",
    "scripts/check-duplicate-semantic-ownership.mjs",
    "scripts/check-api-provider-import-boundary.mjs",
    "scripts/verify-compatibility-matrix.mjs",
    "scripts/verify-golden-registry.mjs",
    "scripts/check-golden-registry-shape.mjs",
  ],
  driftCanaries: [
    "packages/cloud-core createBrokenCompositionDriftProbe",
    "packages/worker-transport createBrokenTransportDriftProbe",
  ],
  deferredToM26: ["HARD-005", "HARD-006 fault-injection matrix"],
  hard004Note: "Golden registry links payment idempotency tests; full paid golden E2E M29+",
};

fs.writeFileSync(
  path.join(root, "docs/audits/M24-fitness-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

const md = [
  "# M24 architecture fitness report",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  `- Golden scenarios: **${report.goldenScenarioCount}** (registry v${report.goldenRegistryVersion})`,
  `- Provider parity asserted: **${parity.parityAsserted}**`,
  `- API contract: \`${parity.apiContractVersion}\``,
  "",
  "## Fitness scripts",
  "",
  ...report.fitnessScripts.map((s) => `- \`${s}\``),
  "",
  "## Drift canaries",
  "",
  ...report.driftCanaries.map((c) => `- ${c}`),
  "",
  "See `M24-exit-criteria.json` for milestone closure status.",
  "",
].join("\n");

fs.writeFileSync(path.join(root, "docs/audits/M24-fitness-report.md"), md);

console.log("M24 fitness report written");
