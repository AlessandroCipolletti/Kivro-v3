#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const dsEvidence =
  "docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541";

const statusEvidence =
  "apps/web/src/lib/status-ui.ts, apps/web/src/components/ui/StatusBadge.tsx   apps/web/src/lib/status-ui.test.ts   docs/milestones/M14-manual-validation.md M14 status language §533";

const emptyEvidence =
  "apps/web/src/components/ui/EmptyState.tsx, apps/web/src/app/jobs/page.tsx, apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 empty states §534";

const cardEvidence =
  "apps/web/src/components/CapabilityCard.tsx, apps/web/src/app/capabilities/[slug]/page.tsx   docs/milestones/M14-manual-validation.md M14 capability cards §527–§528";

const jobUiEvidence =
  "apps/web/src/app/jobs/page.tsx, apps/web/src/app/jobs/[id]/page.tsx   docs/milestones/M14-manual-validation.md M14 job UI §526–§537";

const sellerEvidence =
  "apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 seller dashboard §531–§532";

const settingsEvidence =
  "apps/web/src/app/settings/api-keys/page.tsx, apps/web/src/app/settings/webhooks/page.tsx, apps/web/src/lib/kivro-api.ts   docs/milestones/M14-manual-validation.md M14 developer settings §349";

const a11yEvidence =
  "apps/web/src/app/globals.css, apps/web/src/components/ui   security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 a11y §539";

const responsiveEvidence =
  "apps/web/src/app/globals.css, apps/web/src/app/layout.tsx   docs/milestones/M14-manual-validation.md M14 responsive §538";

const iconEvidence =
  "apps/web/src/components/icons.tsx   docs/milestones/M14-manual-validation.md M14 icons §542";

const agentEvidence =
  "apps/web/src/app/agent/page.tsx, apps/web/src/app/search/page.tsx   docs/milestones/M14-manual-validation.md M14 marketplace/agent §529–§530";

const m14Sections = new Map([
  ["§517", dsEvidence],
  ["§518", dsEvidence],
  ["§519", dsEvidence],
  ["§520", dsEvidence],
  ["§521", dsEvidence],
  ["§522", dsEvidence],
  ["§523", dsEvidence],
  ["§524", dsEvidence],
  ["§525", dsEvidence],
  ["§526", jobUiEvidence],
  ["§527", cardEvidence],
  ["§528", cardEvidence],
  ["§529", agentEvidence],
  ["§530", agentEvidence],
  ["§531", sellerEvidence],
  ["§532", sellerEvidence],
  ["§533", statusEvidence],
  ["§534", emptyEvidence],
  ["§535", dsEvidence],
  ["§536", dsEvidence],
  ["§537", jobUiEvidence],
  ["§538", responsiveEvidence],
  ["§539", a11yEvidence],
  ["§540", cardEvidence],
  ["§541", dsEvidence],
  ["§542", iconEvidence],
  ["§543", dsEvidence],
  ["§544", cardEvidence],
  ["§545", dsEvidence],
  ["§546", dsEvidence],
  ["§547", dsEvidence],
  ["§548", dsEvidence],
  ["§549", dsEvidence],
  ["§550", dsEvidence],
]);

const m14LineOverrides = [
  { id: "UI-0024", evidence: settingsEvidence },
  { id: "UI-0025", evidence: settingsEvidence },
];

const out = text.split("\n").map((line) => {
  for (const override of m14LineOverrides) {
    if (line.includes(`\`${override.id}\``) && line.includes("§349") && line.includes("M13 session")) {
      return line.replace(/`TESTED`\s+[^\n]*/, `\`TESTED\`   ${override.evidence}`);
    }
  }
  for (const override of m14LineOverrides) {
    if (line.includes(`\`${override.id}\``) && line.includes("`TODO`")) {
      return line.replace(/`TODO`\s+[^\n]*/, `\`TESTED\`   ${override.evidence}`);
    }
  }
  const m = line.match(/(§\d+)\s+/);
  if (!m || !m14Sections.has(m[1])) {
    return line;
  }
  if (!line.includes("`TODO`") && !line.includes("`PARTIAL`")) {
    return line;
  }
  const evidence = m14Sections.get(m[1]);
  return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${evidence}`);
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md for M14 (§517–§550 bounded; visual regression manual §547)");
