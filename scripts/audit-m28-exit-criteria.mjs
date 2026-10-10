#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const compliance = readJson("docs/audits/M28-compliance-report.json");
const families = readJson("docs/audits/M28-requirement-families.json");
const sample = readJson("docs/audits/M28-master-spec-sample-audit.json");

const criteria = [
  {
    id: "m27-regression-gate",
    status: readJson("docs/audits/M27-exit-criteria.json").m27HarnessComplete ? "PASS" : "FAIL",
    detail: "verify:m27 chain / M27-exit-criteria.json",
  },
  {
    id: "terminal-compliance-audit",
    status:
      compliance.unexplainedCount === 0 &&
      compliance.closedScopeTodoCount === 0 &&
      compliance.invalidTestedCount === 0
        ? "PASS"
        : "FAIL",
    detail: `unexplained=${compliance.unexplainedCount} closedTodo=${compliance.closedScopeTodoCount}`,
  },
  {
    id: "requirement-families-hard",
    status: families.pass ? "PASS" : "FAIL",
    detail: "HARD M24–M27 harness rows TESTED",
  },
  {
    id: "master-spec-sampling",
    status: sample.pass ? "PASS" : "FAIL",
    detail: `${sample.sampleSize} P0 TESTED sampled`,
  },
  {
    id: "mandatory-terminal-runs",
    status: (compliance.mandatoryRuns ?? []).every((r) => r.pass) ? "PASS" : "FAIL",
    detail: `${(compliance.mandatoryRuns ?? []).filter((r) => !r.pass).length} failed`,
  },
  {
    id: "lossless-audit-executed",
    status: "PASS",
    detail: "M28 unified audit + families + sampling artifacts generated",
  },
  {
    id: "open-requirements-catalog",
    status: (() => {
      try {
        return readJson("docs/audits/M28-open-requirements-catalog.json").pass ? "PASS" : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "all open P0/P1/P2 rows have explicit schedule notes",
  },
  {
    id: "m23-terminal-lossless-sync",
    status: (() => {
      try {
        const m23 = readJson("docs/audits/M23-exit-criteria.json");
        const row = (m23.criteria ?? []).find((c) => c.id === "terminal-lossless-audit");
        return row?.status === "EXECUTED_M28" ? "PASS" : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "M23 terminal-lossless-audit → EXECUTED_M28 after harness",
  },
  {
    id: "portability-families-p0",
    status: families.portabilityP0NonTested?.length === 0 ? "PASS" : "FAIL",
    detail: "ARCH-UNI/PORT/HOST-NET P0 TESTED through M27",
  },
  {
    id: "all-p0-p1-p2-complete",
    status: compliance.masterSpecCompletion?.productMasterSpecComplete ? "PASS" : "OPEN",
    detail: `P0 TODO ${compliance.p0OpenCount}, P1 TODO ${compliance.p1OpenCount}, P2 TODO ${compliance.p2OpenCount}`,
  },
  {
    id: "staging-paid-e2e",
    status: "ENV_OPTIONAL",
    detail: "scripts/verify-m23-staging-bundle.mjs",
  },
];

const m28HarnessComplete = criteria
  .filter((c) => !["OPEN", "ENV_OPTIONAL"].includes(c.status))
  .every((c) => c.status === "PASS");

const exitDoc = {
  generatedAt: new Date().toISOString(),
  m28HarnessComplete,
  productMasterSpecComplete: compliance.masterSpecCompletion?.productMasterSpecComplete === true,
  terminalAuditExecuted: true,
  criteria,
};

fs.writeFileSync(
  path.join(root, "docs/audits/M28-exit-criteria.json"),
  `${JSON.stringify(exitDoc, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(root, "docs/audits/M28-exit-criteria.md"),
  [
    "# M28 exit criteria — terminal lossless audit",
    "",
    `- **M28 harness complete:** ${m28HarnessComplete}`,
    `- **Full Master Spec (zero P0/P1/P2 TODO):** ${exitDoc.productMasterSpecComplete}`,
    "",
    "| ID | Status | Detail |",
    "|----|--------|--------|",
    ...criteria.map((c) => `| ${c.id} | ${c.status} | ${c.detail} |`),
    "",
  ].join("\n"),
);

if (!m28HarnessComplete) {
  console.error("M28 exit criteria FAIL");
  process.exit(1);
}

console.log(
  "M28 exit criteria OK — terminal audit harness complete (product catalog may still have scheduled open rows)",
);
