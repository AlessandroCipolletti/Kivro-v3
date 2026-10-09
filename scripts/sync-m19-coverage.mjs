#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const coreEvidence =
  "packages/cloud-core, apps/api/src/cloud-composition.ts   security/tests/acceptance-m19.test.ts; packages/worker-transport/src/conformance.test.ts   docs/milestones/M19-closure.md M19";

const portEvidence =
  "packages/worker-transport, packages/cloud-netsons, packages/cloud-aws   packages/worker-transport/src/conformance.test.ts   docs/milestones/M19-closure.md M19 PORT";

function formatLine(id, priority, evidence) {
  const [impl, tests, ...noteParts] = evidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const out = text.split("\n").map((line) => {
  const arch = line.match(/^\s+(ARCH-UNI-\d+)\s+(P\d+)\s+/);
  if (arch) {
    return formatLine(arch[1], arch[2], coreEvidence);
  }
  const port = line.match(/^\s+(PORT-0(?:19|2\d|30))\s+(P\d+)\s+/);
  if (port) {
    return formatLine(port[1], port[2], portEvidence);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md ARCH-UNI-* and PORT-019..030 for M19");
