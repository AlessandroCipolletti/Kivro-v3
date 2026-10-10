#!/usr/bin/env node
/**
 * M23 milestone exit vs IMPLEMENTATION-PLAN literal scope.
 * Harness complete ≠ all P0/P1/P2 implemented (terminal: M28).
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const reportPath = path.join(root, "docs/audits/M23-compliance-report.json");
if (!fs.existsSync(reportPath)) {
  console.error("Run audit-m23-unified.mjs first");
  process.exit(1);
}
const compliance = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const criteria = [
  {
    id: "coverage-traceability",
    planItem: "Every requirement accounted with schedule or TESTED evidence",
    status: compliance.unexplainedCount === 0 ? "PASS" : "FAIL",
    detail: `unexplained=${compliance.unexplainedCount}`,
  },
  {
    id: "m00-m22-closure",
    planItem: "No stray TODO in M00–M22 section scope",
    status: compliance.closedScopeTodoCount === 0 ? "PASS" : "FAIL",
    detail: `closedScopeTodo=${compliance.closedScopeTodoCount}`,
  },
  {
    id: "tested-evidence-paths",
    planItem: "TESTED rows resolve on disk; P0 cites tests",
    status:
      compliance.invalidTestedCount === 0 &&
      compliance.testedP0MissingTestEvidenceCount === 0
        ? "PASS"
        : "FAIL",
    detail: `invalid=${compliance.invalidTestedCount} p0NoTests=${compliance.testedP0MissingTestEvidenceCount}`,
  },
  {
    id: "mandatory-automated-runs",
    planItem: "Architecture, API contract, schema, dual roots",
    status: (compliance.mandatoryRuns ?? []).every((r) => r.pass) ? "PASS" : "FAIL",
    detail: `${(compliance.mandatoryRuns ?? []).filter((r) => !r.pass).length} failed`,
  },
  {
    id: "all-p0-p1-p2-complete",
    planItem: "All P0/P1/P2 requirements complete",
    status: "DEFERRED_M28",
    detail: `P0 TODO ${compliance.p0OpenCount}, P1 TODO ${compliance.p1OpenCount}, P2 TODO ${compliance.p2OpenCount}`,
  },
  {
    id: "product-security-sandbox-satisfied",
    planItem: "Original product/security/payment/sandbox requirements satisfied",
    status: "PARTIAL",
    detail: "Automated security release + verify:m22 chain; full catalog open rows scheduled M24–M34",
  },
  {
    id: "netsons-aws-staging-e2e",
    planItem: "Full Netsons/AWS staging E2E",
    status: "ENV_OPTIONAL",
    detail: "scripts/verify-m23-staging-bundle.mjs",
  },
  {
    id: "dual-cp-transition-e2e",
    planItem: "Dual control-plane transition E2E",
    status: "ENV_OPTIONAL",
    detail: "verify-m22-dual-staging + docs/deploy/dual-control-plane-transition.md",
  },
  {
    id: "terminal-lossless-audit",
    planItem: "Lossless Master Spec proof",
    status: "DEFERRED_M28",
    detail: "IMPLEMENTATION-PLAN M28 supersedes terminal gate",
  },
];

const harnessComplete = criteria
  .filter((c) => !["DEFERRED_M28", "ENV_OPTIONAL", "PARTIAL"].includes(c.status))
  .every((c) => c.status === "PASS");

const exitDoc = {
  generatedAt: new Date().toISOString(),
  m23HarnessComplete: harnessComplete,
  productMasterSpecComplete: false,
  terminalGate: "M28",
  criteria,
};

fs.mkdirSync(path.join(root, "docs/audits"), { recursive: true });
fs.writeFileSync(
  path.join(root, "docs/audits/M23-exit-criteria.json"),
  `${JSON.stringify(exitDoc, null, 2)}\n`,
);

const md = [
  "# M23 exit criteria",
  "",
  `Generated: ${exitDoc.generatedAt}`,
  "",
  `- **M23 harness complete (repo milestone):** ${harnessComplete ? "**YES**" : "**NO**"}`,
  "- **Full Master Spec / all P0–P2 (plan literal):** **NO** — deferred to **M28**",
  "",
  "| ID | Status | Plan item |",
  "|----|--------|-----------|",
  ...criteria.map((c) => `| ${c.id} | ${c.status} | ${c.planItem} |`),
  "",
].join("\n");

fs.writeFileSync(path.join(root, "docs/audits/M23-exit-criteria.md"), md);

if (!harnessComplete) {
  console.error("M23 exit criteria FAIL — harness incomplete");
  for (const c of criteria.filter((c) => c.status === "FAIL")) {
    console.error(`  ${c.id}: ${c.detail}`);
  }
  process.exit(1);
}

console.log("M23 exit criteria OK — harness complete; product terminal audit remains M28");
