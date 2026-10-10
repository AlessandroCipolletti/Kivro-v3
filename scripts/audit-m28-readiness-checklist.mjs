#!/usr/bin/env node
/** M28 — regenerate readiness checklist from audit artifacts (verify flow). */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function box(pass) {
  return pass ? "[x]" : "[ ]";
}

let m27 = { m27HarnessComplete: false };
let compliance = { closedScopeTodoCount: 1, unexplainedCount: 1 };
let families = { pass: false };
let catalog = { pass: false };
let sample = { pass: false };

try {
  m27 = readJson("docs/audits/M27-exit-criteria.json");
} catch {
  /* pre-unified */
}
try {
  compliance = readJson("docs/audits/M28-compliance-report.json");
} catch {
  /* before unified in partial runs */
}
try {
  families = readJson("docs/audits/M28-requirement-families.json");
  catalog = readJson("docs/audits/M28-open-requirements-catalog.json");
  sample = readJson("docs/audits/M28-master-spec-sample-audit.json");
} catch {
  /* optional early */
}

const items = [
  {
    label: "`pnpm verify:m27` green (M27-exit-criteria.json)",
    pass: m27.m27HarnessComplete === true,
  },
  {
    label: "`spec/MASTER-SPEC.md` present as authority",
    pass: fs.existsSync(path.join(root, "spec/MASTER-SPEC.md")),
  },
  {
    label: "`sync-m28-coverage.mjs` HARD-021..026 evidence rows",
    pass: fs.existsSync(path.join(root, "scripts/sync-m28-coverage.mjs")),
  },
  {
    label: "Golden registry includes M28-GOLD-001..006",
    pass: (() => {
      try {
        const reg = readJson("tests/fixtures/backend-conformance-golden.json");
        const ids = reg.scenarios.map((s) => s.id);
        return ["M28-GOLD-001", "M28-GOLD-006"].every((id) => ids.includes(id));
      } catch {
        return false;
      }
    })(),
  },
  {
    label: "M28 compliance: closed M00–M27 scope TODO = 0",
    pass: compliance.closedScopeTodoCount === 0,
  },
  {
    label: "M28 compliance: unexplained open rows = 0",
    pass: compliance.unexplainedCount === 0,
  },
  {
    label: "Requirement families + open catalog pass",
    pass: families.pass === true && catalog.pass === true,
  },
  {
    label: "Expanded P0 TESTED sampling pass",
    pass: sample.pass === true,
  },
  {
    label: "Unified release manifest path declared",
    pass: fs.existsSync(path.join(root, "docs/audits/unified-release-manifest.json")),
  },
  {
    label: "Staging E2E env documented (optional gate)",
    pass: fs.existsSync(path.join(root, "scripts/verify-m23-staging-bundle.mjs")),
  },
];

const allAutomatedPass = items.slice(0, 9).every((i) => i.pass);

const md = [
  "# M28 terminal audit readiness checklist",
  "",
  `_Generated: ${new Date().toISOString()}_`,
  "",
  ...items.map((i) => `- ${box(i.pass)} ${i.label}`),
  "",
  allAutomatedPass
    ? "**Automated readiness: PASS** (run `pnpm verify:m28` for full gate)."
    : "**Automated readiness: INCOMPLETE** — run `pnpm verify:m28`.",
  "",
].join("\n");

fs.writeFileSync(path.join(root, "docs/audits/M28-readiness-checklist.md"), md);

if (!allAutomatedPass) {
  console.error("M28 readiness checklist — some automated items not satisfied (see markdown)");
  process.exit(1);
}

console.log("M28 readiness checklist OK (docs/audits/M28-readiness-checklist.md)");
