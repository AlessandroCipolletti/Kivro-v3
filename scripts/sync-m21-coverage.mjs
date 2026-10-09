#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const archEvidence =
  "packages/cloud-aws, apps/api, packages/cloud-core, packages/storage   security/tests/acceptance-m21.test.ts; security/tests/host-aws-production-m21.test.ts; packages/cloud-aws/src/durable-work-port.test.ts; scripts/aws-staging-smoke.mjs   docs/milestones/M21-closure.md M21";

function formatArchLine(id, priority) {
  const [impl, tests, ...noteParts] = archEvidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const archIds = new Set([
  "ARCH-UNI-008",
  "ARCH-UNI-009",
  "ARCH-UNI-019",
  "ARCH-UNI-020",
  "ARCH-UNI-021",
  "ARCH-UNI-022",
  "ARCH-UNI-023",
  "ARCH-UNI-024",
]);

const portEvidence =
  "packages/cloud-aws, apps/api, packages/worker-transport   security/tests/conformance-aws-profile-m21.test.ts; security/tests/conformance-dual-transport-m19.test.ts   M21 AWS WSS baseline";

function formatPortLine(id, priority) {
  const [impl, tests, ...noteParts] = portEvidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const portIds = new Set(["PORT-024", "PORT-026", "PORT-028"]);

const out = text.split("\n").map((line) => {
  const arch = line.match(/^\s+(ARCH-UNI-0\d\d)\s+(P\d+)\s+/);
  if (arch && archIds.has(arch[1])) {
    return formatArchLine(arch[1], arch[2]);
  }
  const port = line.match(/^\s+(PORT-0\d\d)\s+(P\d+)\s+/);
  if (port && portIds.has(port[1])) {
    return formatPortLine(port[1], port[2]);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md ARCH-UNI AWS parity rows for M21");
