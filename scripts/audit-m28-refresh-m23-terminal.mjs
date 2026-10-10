#!/usr/bin/env node
/** After M28 pre-exit audits pass, record terminal audit execution on M23 exit artifact. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const m23Path = path.join(root, "docs/audits/M23-exit-criteria.json");
if (!fs.existsSync(m23Path)) {
  console.error("Missing M23 exit criteria");
  process.exit(1);
}

const compliance = readJson("docs/audits/M28-compliance-report.json");
const families = readJson("docs/audits/M28-requirement-families.json");
const catalog = readJson("docs/audits/M28-open-requirements-catalog.json");
const sample = readJson("docs/audits/M28-master-spec-sample-audit.json");
const m27 = readJson("docs/audits/M27-exit-criteria.json");

const preExitPass =
  m27.m27HarnessComplete === true &&
  compliance.unexplainedCount === 0 &&
  compliance.closedScopeTodoCount === 0 &&
  compliance.invalidTestedCount === 0 &&
  (compliance.mandatoryRuns ?? []).every((r) => r.pass) &&
  families.pass === true &&
  catalog.pass === true &&
  sample.pass === true;

if (!preExitPass) {
  console.error("Refusing to refresh M23 terminal row — M28 pre-exit audits incomplete");
  process.exit(1);
}

const productComplete = compliance.masterSpecCompletion?.productMasterSpecComplete === true;
const m23 = readJson("docs/audits/M23-exit-criteria.json");

for (const c of m23.criteria ?? []) {
  if (c.id === "terminal-lossless-audit") {
    c.status = "EXECUTED_M28";
    c.detail = `M28 terminal harness executed; productMasterSpecComplete=${productComplete}`;
  }
}

m23.productMasterSpecComplete = productComplete;
m23.terminalGateExecutedAt = new Date().toISOString();

fs.writeFileSync(m23Path, `${JSON.stringify(m23, null, 2)}\n`);
console.log("M23 exit criteria updated — terminal-lossless-audit EXECUTED_M28");
