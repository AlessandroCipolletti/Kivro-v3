#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const resilience = await import(path.join(root, "packages/resilience/dist/index.js"));
const matrix = resilience.loadFaultInjectionMatrix();
const fixture = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/fault-injection-matrix.json"), "utf8"),
);

if (matrix.scenarios.length !== fixture.scenarios.length) {
  console.error("Fault matrix fixture drift");
  process.exit(1);
}

const corpus = [
  "security/tests/fault-injection-convergence-m26.test.ts",
  "security/tests/fault-injection-control-plane-m26.test.ts",
  "packages/billing/src/job-completion-idempotency.test.ts",
  "packages/resilience/src/convergence.test.ts",
]
  .map((rel) => fs.readFileSync(path.join(root, rel), "utf8"))
  .join("\n");

let missing = 0;
for (const scenario of matrix.scenarios) {
  if (!corpus.includes(scenario.id)) {
    console.error(`Fault scenario ${scenario.id} not referenced in M26 test corpus`);
    missing += 1;
  }
}

if (missing > 0) {
  process.exit(1);
}

console.log(`Fault injection matrix OK (${matrix.scenarios.length} scenarios wired)`);
