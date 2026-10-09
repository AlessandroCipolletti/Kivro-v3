#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const m16Core =
  "docs/testing, tests/fixtures, scripts/verify-m16-flow.mjs   security/tests/acceptance-m16.test.ts; security/tests/e2e-fixtures-m16.test.ts   docs/milestones/M16-closure.md M16";

const m16Evidence =
  "docs/architecture/IMPLEMENTATION-ROADMAP-STATUS.md, tests/fixtures/catalog.json   security/tests/acceptance-m16.test.ts; scripts/verify-m16-flow.mjs   docs/milestones/M16-manual-validation.md M16";

const apiEvidence =
  "docs/API-CONTRACT-MVP.md, apps/api/src/routes   scripts/verify-api-contract-mvp.mjs; security/tests/acceptance-m16.test.ts   docs/milestones/M16-manual-validation.md M16 §41";

const mcpEvidence =
  "docs/MCP-API-FUTURE.md, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §42 architecture preserved";

const studyEvidence =
  "docs/OPENCLAW-STUDY-NOTES.md, packages/openclaw-adapter   security/tests/acceptance-m16.test.ts   docs/milestones/M16-manual-validation.md M16 §43";

const experimentEvidence =
  "docs/TECH-EXPERIMENTS.md, security/tests   security/tests/adversarial-m04.test.ts; scripts/verify-m04-flow.mjs   docs/milestones/M16-manual-validation.md M16 §44";

const mvpEvidence =
  "docs/MVP-SUCCESS-CHECKLIST.md, docs/testing/PRODUCT-RELEASE-GATE.md   scripts/verify-m16-flow.mjs   docs/milestones/M16-closure.md M16 §45";

const productEvidence =
  "docs/PRODUCT-VALIDATION.md, docs/testing/PRODUCT-RELEASE-GATE.md   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §46";

const repoEvidence =
  "README.md, apps/*, packages/*   scripts/verify-repo-structure.mjs; security/tests/acceptance-m16.test.ts   docs/milestones/M16-manual-validation.md M16 §40";

const testingStrategyEvidence =
  "docs/TESTING-STRATEGY.md, docs/testing/INTEGRATION-TEST-MATRIX.md   scripts/verify-integration-matrix.mjs; security/tests/adversarial-m04.test.ts   docs/milestones/M16-closure.md M16 §34";

const happyPathEvidence =
  "docs/testing/HAPPY-PATH-TRACE.md, tests/fixtures/happy-path-trace.json   scripts/verify-happy-path-trace.mjs; security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §88";

const failurePathEvidence =
  "docs/testing/FAILURE-PATH-TRACE.md, tests/fixtures/failure-path-trace.json   scripts/verify-failure-path-trace.mjs; packages/job-failure   docs/milestones/M16-closure.md M16 §89";

const fixtureEvidence =
  "security/adversarial-fixtures, tests/fixtures/catalog.json   security/tests/e2e-fixtures-m16.test.ts; security/tests/fixture-ad-m06.test.ts   docs/milestones/M16-closure.md M16 §90";

const secGateEvidence =
  "docs/testing/SECURITY-RELEASE-GATE.md, tests/fixtures/security-release-gate.json   scripts/verify-release-gate-evidence.mjs; security/tests/adversarial-m04.test.ts   docs/milestones/M16-closure.md M16 §91";

const productGateEvidence =
  "docs/testing/PRODUCT-RELEASE-GATE.md, docs/MVP-SUCCESS-CHECKLIST.md   scripts/verify-m16-flow.mjs; pnpm test:e2e:local   docs/milestones/M16-closure.md M16 §92 staging E2E M18";

const milestonePromptEvidence =
  "spec/IMPLEMENTATION-PLAN.md, docs/architecture/IMPLEMENTATION-ROADMAP-STATUS.md   scripts/verify-m16-flow.mjs   docs/milestones/M16-closure.md M16 §93";

const codeQualityEvidence =
  ".github/workflows/ci.yml, scripts/verify-code-quality-gate.mjs   pnpm typecheck; pnpm lint; pnpm test   docs/milestones/M16-closure.md M16 §94";

const agentObjectiveEvidence =
  "README.md, AGENTS.md, docs/MVP-SUCCESS-CHECKLIST.md   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §95";

const lineOverrides = new Map([
  ["PRD-0048", m16Evidence],
  ["WRK-0053", repoEvidence],
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
  ["WRK-0052", testingStrategyEvidence],
]);

const sectionRefresh = new Map([
  ["§88", happyPathEvidence],
  ["§89", failurePathEvidence],
  ["§90", fixtureEvidence],
  ["§91", secGateEvidence],
  ["§92", productGateEvidence],
  ["§93", milestonePromptEvidence],
  ["§94", codeQualityEvidence],
  ["§95", agentObjectiveEvidence],
]);

const out = text.split("\n").map((line) => {
  for (const [id, evidence] of lineOverrides) {
    if (line.includes(`\`${id}\``)) {
      if (line.includes("`TODO`") || line.includes("`PARTIAL`")) {
        return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${evidence}`);
      }
      if (line.includes("`TESTED`") && line.includes("M15-closure") && id === "WRK-0052") {
        return line.replace(/`TESTED`\s+[^\n]*/, `\`TESTED\`   ${evidence}`);
      }
    }
  }
  for (const [section, evidence] of sectionRefresh) {
    if (
      line.includes(section) &&
      line.includes("`TESTED`") &&
      (line.includes("M15") || line.includes("M00-manual-validation"))
    ) {
      const idMatch = line.match(/`(IO-\d+|WRK-\d+|TST-\d+|PRD-\d+)`/);
      if (idMatch && ["IO-0035", "IO-0036", "WRK-0097", "WRK-0098", "IO-0037", "TST-0006", "TST-0007", "TST-0008", "TST-0009", "TST-0010", "TST-0011", "TST-0012", "IO-0038", "IO-0039", "IO-0040", "IO-0041", "TST-0013", "TST-0014", "TST-0015", "PRD-0073"].includes(idMatch[1])) {
        return line.replace(/`TESTED`\s+[^\n]*/, `\`TESTED\`   ${evidence}`);
      }
    }
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md for M16 (§34–§46, §88–§95)");
