#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const m16Evidence =
  "docs/architecture/IMPLEMENTATION-ROADMAP-STATUS.md, tests/fixtures/catalog.json   security/tests/acceptance-m16.test.ts; scripts/verify-m16-flow.mjs   docs/milestones/M16-manual-validation.md M16";

const apiEvidence =
  "docs/API-CONTRACT-MVP.md, apps/api/src/routes   scripts/verify-api-contract-mvp.mjs; security/tests/acceptance-m16.test.ts   docs/milestones/M16-manual-validation.md M16 §41";

const mcpEvidence =
  "docs/MCP-API-FUTURE.md, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §42 deferred";

const studyEvidence =
  "docs/OPENCLAW-STUDY-NOTES.md, packages/openclaw-adapter   security/tests/acceptance-m16.test.ts   docs/milestones/M16-manual-validation.md M16 §43";

const experimentEvidence =
  "docs/TECH-EXPERIMENTS.md, security/tests   security/tests/adversarial-m04.test.ts; scripts/verify-m04-flow.mjs   docs/milestones/M16-manual-validation.md M16 §44";

const mvpEvidence =
  "docs/MVP-SUCCESS-CHECKLIST.md, docs/milestones/M16-manual-validation.md   scripts/verify-m16-flow.mjs   docs/milestones/M16-closure.md M16 §45";

const productEvidence =
  "docs/PRODUCT-VALIDATION.md   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §46";

const lineOverrides = new Map([
  ["PRD-0048", m16Evidence],
  ["PRD-0049", apiEvidence],
  ["PRD-0050", apiEvidence],
  ["CAP-0005", mcpEvidence],
  ["CAP-0006", mcpEvidence],
  ["CAP-0007", mcpEvidence],
  ["SEC-0036", studyEvidence],
  ["SEC-0037", studyEvidence],
  ["SEC-0038", experimentEvidence],
  ["SEC-0039", experimentEvidence],
  ["SEC-0040", experimentEvidence],
  ["SEC-0041", experimentEvidence],
  ["PRD-0051", mvpEvidence],
  ["PRD-0052", mvpEvidence],
  ["PRD-0053", mvpEvidence],
  ["PRD-0054", productEvidence],
  ["PRD-0055", productEvidence],
  ["PRD-0056", productEvidence],
]);

const out = text.split("\n").map((line) => {
  for (const [id, evidence] of lineOverrides) {
    if (line.includes(`\`${id}\``) && line.includes("`TODO`")) {
      return line.replace(/`TODO`\s+[^\n]*/, `\`TESTED\`   ${evidence}`);
    }
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md for M16 (§39–§46 TODO rows)");
