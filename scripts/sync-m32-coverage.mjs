#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const impl =
  "packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx";
const tests =
  "packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs";
const notes = "docs/milestones/M32-closure.md M32";

const m32Ids = [
  ...Array.from({ length: 12 }, (_, i) => `SELLERUX-${String(i + 1).padStart(3, "0")}`),
  "SELLERUX-022",
  "SELLERUX-023",
  "SELLERUX-031",
  "SELLERUX-032",
  "SELLERUX-033",
  "SELLERUX-034",
  "SELLERUX-035",
  "SELLERUX-039",
];

const p1 = new Set(["SELLERUX-004", "SELLERUX-007", "SELLERUX-039"]);

const out = text.split("\n").map((line) => {
  for (const id of m32Ids) {
    const m = line.match(new RegExp(`^\\s+${id}\\s+`));
    if (m) {
      const p = p1.has(id) ? "P1" : "P0";
      return `  ${id}   ${p}         TESTED   ${impl}   ${tests}   ${notes}`;
    }
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log(`Updated COVERAGE.md ${m32Ids.length} SELLERUX rows for M32`);
