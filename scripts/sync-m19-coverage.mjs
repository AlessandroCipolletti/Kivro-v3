#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const coreEvidence =
  "packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters";

const portEvidence =
  "packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared";

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
