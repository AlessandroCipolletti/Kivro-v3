#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const rows = {
  "HARD-021": {
    p: "P0",
    impl: "scripts/generate-unified-release-manifest.mjs, packages/compatibility/src/release-manifest.ts, scripts/verify-unified-release-evidence.mjs",
    tests:
      "security/tests/conformance-golden-m25.test.ts; security/tests/release-activation-m27.test.ts; scripts/verify-m27-flow.mjs",
    notes: "docs/audits/unified-release-manifest.json; docs/milestones/M27-closure.md M27/M28",
  },
  "HARD-022": {
    p: "P0",
    impl: "scripts/generate-provider-parity-report.mjs, scripts/verify-release-activation-gate.mjs",
    tests:
      "security/tests/conformance-golden-m24.test.ts; security/tests/release-activation-m27.test.ts; scripts/verify-m28-flow.mjs",
    notes: "docs/audits/M24-provider-parity-report.json M24/M28",
  },
  "HARD-023": {
    p: "P0",
    impl: "scripts/run-backend-conformance.mjs, scripts/lib/m23-mandatory-runs.mjs, scripts/lib/m28-mandatory-runs.mjs",
    tests:
      "security/tests/conformance-both-roots-m19.test.ts; security/tests/conformance-unified-audit-m28.test.ts; scripts/verify-m28-flow.mjs",
    notes: "docs/audits/M28-compliance-report.json M28",
  },
  "HARD-024": {
    p: "P0",
    impl: "scripts/audit-m28-exit-criteria.mjs, spec/IMPLEMENTATION-PLAN.md milestone contract",
    tests: "security/tests/conformance-unified-audit-m28.test.ts; scripts/verify-m28-flow.mjs",
    notes: "docs/milestones/M28-closure.md M28",
  },
  "HARD-025": {
    p: "P0",
    impl: "scripts/verify-golden-registry.mjs, security/tests/conformance-divergence-rejection-m24.test.ts",
    tests: "security/tests/conformance-golden-m24.test.ts; scripts/verify-m24-flow.mjs",
    notes: "docs/milestones/M24-closure.md M24/M28",
  },
  "HARD-026": {
    p: "P0",
    impl: "packages/cloud-core control-plane policy, packages/worker-transport multi-transport",
    tests:
      "security/tests/conformance-dual-control-plane-restart-m25.test.ts; security/tests/fault-injection-control-plane-m26.test.ts",
    notes: "docs/milestones/M25-closure.md M25/M28",
  },
};

function formatLine(id, { p, impl, tests, notes }) {
  return `  ${id}   ${p}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const out = text.split("\n").map((line) => {
  for (const [id, meta] of Object.entries(rows)) {
    const m = line.match(new RegExp(`^\\s+${id}\\s+`));
    if (m) return formatLine(id, meta);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md HARD-021..026 for M28 terminal audit evidence");
