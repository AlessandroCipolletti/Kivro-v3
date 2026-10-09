#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const orchEvidence =
  "packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation";

const platformEvidence =
  "packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port";

const convEvidence =
  "packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 conversation persistence";

const synthesisEvidence =
  "packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete";

const toolsEvidence =
  "apps/api/src/routes/marketplace-agent-tools.ts, packages/marketplace-agent/src/agent-tools.ts   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 agent tool HTTP surface";

const orchSections = new Set(["§136", "§137", "§138", "§139", "§140", "§141", "§142"]);
const platformSections = new Set(["§146", "§147", "§148", "§149"]);
const uiSections = new Set(["§150", "§151"]);
const synthesisSections = new Set(["§143", "§144", "§145"]);

const out = text.split("\n").map((line) => {
  const m = line.match(/(§\d+)\s+/);
  if (!m) {
    return line;
  }
  if (orchSections.has(m[1]) && line.includes("`DEFERRED`")) {
    return line.replace(/`DEFERRED`\s+[^\n]*/, `\`TESTED\`   ${orchEvidence}`);
  }
  if (m[1] === "§149" && (line.includes("`TODO`") || line.includes("`PARTIAL`"))) {
    return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${toolsEvidence}`);
  }
  if (platformSections.has(m[1]) && (line.includes("`TODO`") || line.includes("`PARTIAL`"))) {
    return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${platformEvidence}`);
  }
  if (synthesisSections.has(m[1]) && (line.includes("`TODO`") || line.includes("`PARTIAL`"))) {
    return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`PARTIAL\`   ${synthesisEvidence}`);
  }
  if (uiSections.has(m[1]) && (line.includes("`TODO`") || line.includes("`PARTIAL`"))) {
    return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${convEvidence}`);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md for M11 (§136–§142, §146–§151)");
