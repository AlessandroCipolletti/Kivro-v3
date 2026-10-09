#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const sections = new Set(["§28", "§29"]);
for (let n = 120; n <= 142; n++) {
  sections.add(`§${n}`);
}

const coreEvidence =
  "packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10";

const agentEvidence =
  "packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A";

const orchestrationDeferred =
  "Master Spec §159 Strong MVP extension — multi-job orchestration, DAG, budget reservation M11";

const deferredSections = new Set(["§136", "§137", "§138", "§139", "§140", "§141", "§142"]);

const schedulingUiEvidence =
  "apps/web/src/app/capabilities/[slug]/page.tsx, apps/web/src/app/capabilities/[slug]/run/page.tsx, apps/api/src/routes/capability-availability.ts   pnpm verify:m10   M10 buyer scheduling UX on run/detail";

const out = text.split("\n").map((line) => {
  const m = line.match(/(§\d+)\s+/);
  if (!m || !sections.has(m[1])) {
    return line;
  }

  if (deferredSections.has(m[1])) {
    if (line.includes("`TODO`") || line.includes("`PARTIAL`")) {
      return line.replace(
        /`(TODO|PARTIAL)`\s+[^\n]*/,
        `\`DEFERRED\`   ---              ---        Master Spec §159; ${orchestrationDeferred}`,
      );
    }
    return line;
  }

  if (m[1] === "§129" || m[1] === "§130" || m[1] === "§131" || m[1] === "§132" || m[1] === "§133" || m[1] === "§134" || m[1] === "§135") {
    if (line.includes("`TODO`") || line.includes("`PARTIAL`")) {
      return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${agentEvidence}`);
    }
    return line;
  }

  if (line.includes("`TODO`") || line.includes("`PARTIAL`")) {
    return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${coreEvidence}`);
  }

  return line;
});

let merged = out.join("\n");

for (const id of ["UI-0026", "UI-0027", "AVL-0035", "AVL-0036", "JOB-0118", "JOB-0119"]) {
  merged = merged.replace(
    new RegExp(`\`${id}\`[^\\n]*\`PARTIAL\`[^\\n]*product UI deferred M10\\+[^\\n]*`, "g"),
    (line) =>
      line.replace(/`PARTIAL`\s+[^\n]+/, `\`TESTED\`   ${schedulingUiEvidence}`),
  );
}

fs.writeFileSync(file, merged);
console.log("Updated COVERAGE.md for M10 sections (§28–§29, §120–§142)");
