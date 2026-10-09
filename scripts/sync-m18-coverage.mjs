#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const m18Core =
  "docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18";

const m18FakePay =
  "packages/billing/src/fake-payment-adapter.ts, .env.example   packages/billing/src/fake-payment-adapter.test.ts; apps/api/src/startup-guards.ts   docs/DEV-LOCAL.md M18 §564";

const m18Health =
  "apps/api/src/server.ts, scripts/local-dev-doctor.mjs   scripts/verify-m18-flow.mjs   docs/testing/LOCAL-DEV-E2E-CHECKLIST.md M18 §567";

const m18Failures =
  "tests/fixtures/local-e2e-failure-matrix.json, security/tests   security/tests/acceptance-m18-local-failures.test.ts   docs/DEV-LOCAL.md M18 §570";

const m18Checklist =
  "docs/testing/LOCAL-DEV-E2E-CHECKLIST.md, docs/DEV-LOCAL.md   scripts/run-local-e2e.mjs; pnpm test:e2e:local   docs/milestones/M18-manual-validation.md M18 §573";

const overrides = new Map([
  ["DEV-LOCAL-015", m18FakePay],
  ["DEV-LOCAL-016", m18FakePay],
  ["DEV-LOCAL-019", m18FakePay],
  ["DEV-LOCAL-020", m18Health],
  ["DEV-LOCAL-024", m18Failures],
  ["DEV-LOCAL-029", m18Checklist],
]);

function formatLine(id, priority, evidence) {
  const [impl, tests, ...noteParts] = evidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const out = text.split("\n").map((line) => {
  const m = line.match(/^\s+(DEV-LOCAL-\d+)\s+(P\d+)\s+/);
  if (!m) return line;
  const id = m[1];
  const priority = m[2];
  const evidence = overrides.get(id) ?? m18Core;
  return formatLine(id, priority, evidence);
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md DEV-LOCAL-001..029 for M18");
