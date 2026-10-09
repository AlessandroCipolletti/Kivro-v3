#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const sections = new Set(["§24", "§25"]);
for (let n = 278; n <= 298; n++) {
  sections.add(`§${n}`);
}

const evidence =
  "packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08";

const m04TierDeferred =
  /`DEFERRED`\s+---\s+---\s+payment tiers M08; mis-grouped in M04 plan/;

const out = text.split("\n").map((line) => {
  const m = line.match(/(§\d+)\s+/);
  if (!m || !sections.has(m[1])) {
    return line;
  }

  if (m04TierDeferred.test(line)) {
    return line.replace(m04TierDeferred, `\`TESTED\`   ${evidence}`);
  }

  if (line.includes("`DEFERRED`") && line.includes("PAY-0021")) {
    return line.replace(
      /`DEFERRED`\s+[^\n]+/,
      `\`TESTED\`   packages/billing/src/job-card-payment.ts, apps/api/routes/buyer-jobs-submit.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08 per-job PaymentIntent §24.5`,
    );
  }

  if (line.includes("`PARTIAL`") && m[1] === "§298") {
    return line.replace(
      /`PARTIAL`\s+[^\n]+/,
      `\`TESTED\`   packages/billing/src/pricing-principle.test.ts, packages/billing/src/buyer-billing-read.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08 §298 pricing principle`,
    );
  }

  if (line.includes("`TODO`")) {
    return line.replace(/`TODO`\s+---\s+---\s+---/, `\`TESTED\`   ${evidence}`);
  }

  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md for M08 sections");
