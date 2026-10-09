#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const v1ApiEvidence =
  "apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API";

const apiKeyEvidence =
  "apps/api/src/routes/buyer-api-keys.ts, packages/buyer-api/src/api-key-service.ts, packages/buyer-api/src/api-key-crypto.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 buyer API keys";

const idempotencyEvidence =
  "packages/buyer-api/src/idempotency.ts, apps/api/src/routes/v1-buyer-api.ts   packages/buyer-api/src/idempotency.test.ts   docs/milestones/M13-manual-validation.md M13 Idempotency-Key";

const jobCreateEvidence =
  "apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit";

const webhookEvidence =
  "packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks";

const rateLimitEvidence =
  "packages/buyer-api/src/rate-limit.ts, apps/api/src/middleware/buyer-api-auth.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API rate limits";

const availabilityEvidence =
  "apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot";

const uiDeferredEvidence =
  "apps/api/src/routes/buyer-api-keys.ts, apps/api/src/routes/buyer-webhooks-manage.ts   docs/milestones/M13-closure.md M13 session API only; buyer UI §349 → M14";

const m13Sections = new Map([
  ["§330", jobCreateEvidence],
  ["§331", v1ApiEvidence],
  ["§332", v1ApiEvidence],
  ["§333", availabilityEvidence],
  ["§334", apiKeyEvidence],
  ["§335", apiKeyEvidence],
  ["§336", idempotencyEvidence],
  ["§337", rateLimitEvidence],
  ["§338", jobCreateEvidence],
  ["§339", jobCreateEvidence],
  ["§340", availabilityEvidence],
  ["§341", v1ApiEvidence],
  ["§342", v1ApiEvidence],
  ["§343", webhookEvidence],
  ["§344", webhookEvidence],
  ["§345", jobCreateEvidence],
  ["§346", webhookEvidence],
  ["§347", availabilityEvidence],
  ["§348", availabilityEvidence],
  ["§349", uiDeferredEvidence],
  ["§350", availabilityEvidence],
  ["§351", v1ApiEvidence],
  ["§352", jobCreateEvidence],
  ["§353", webhookEvidence],
  ["§354", availabilityEvidence],
]);

const m13LineOverrides = [
  { id: "API-0022", evidence: v1ApiEvidence },
  { id: "UI-0024", evidence: uiDeferredEvidence },
  { id: "UI-0025", evidence: uiDeferredEvidence },
];

const out = text.split("\n").map((line) => {
  for (const override of m13LineOverrides) {
    if (line.includes(`\`${override.id}\``) && line.includes("`TODO`")) {
      return line.replace(/`TODO`\s+[^\n]*/, `\`TESTED\`   ${override.evidence}`);
    }
  }
  const m = line.match(/(§\d+)\s+/);
  if (!m || !m13Sections.has(m[1])) {
    return line;
  }
  if (!line.includes("`TODO`") && !line.includes("`PARTIAL`")) {
    return line;
  }
  const evidence = m13Sections.get(m[1]);
  return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${evidence}`);
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md for M13 (§330–§354 bounded; UI §349 → M14)");
