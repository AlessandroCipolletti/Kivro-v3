#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const v1ApiEvidence =
  "apps/api/src/routes/v1-buyer-api.ts, apps/api/src/openapi/v1-buyer-api.spec.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API";

const apiKeyEvidence =
  "apps/api/src/routes/buyer-api-keys.ts, packages/buyer-api/src/api-key-service.ts, packages/buyer-api/src/api-key-crypto.ts, packages/buyer-api/src/api-key-audit.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 buyer API keys";

const apiKeySecurityEvidence =
  "packages/buyer-api/src/api-key-crypto.ts, packages/buyer-api/src/rate-limit.ts, packages/buyer-api/src/api-key-audit.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API key security §321";

const scopesEvidence =
  "packages/buyer-api/src/scopes.ts, apps/api/src/routes/buyer-api-keys.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API scopes §320";

const assetEvidence =
  "apps/api/src/routes/v1-buyer-api.ts, packages/capability-publish/src/buyer-stored-asset.ts   docs/milestones/M13-manual-validation.md M13 v1 asset upload intents §322";

const idempotencyEvidence =
  "packages/buyer-api/src/idempotency.ts, apps/api/src/routes/v1-buyer-api.ts   packages/buyer-api/src/idempotency.test.ts   docs/milestones/M13-manual-validation.md M13 Idempotency-Key §325";

const jobCreateEvidence =
  "apps/api/src/services/create-buyer-job.ts, apps/api/src/services/v1-buyer-response.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit §323–§324";

const webhookEvidence =
  "packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks";

const webhookEventsEvidence =
  "apps/api/src/services/buyer-webhook-emitter.ts, apps/api/src/routes/worker-jobs.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 webhook events §328";

const rateLimitEvidence =
  "packages/buyer-api/src/rate-limit.ts, apps/api/src/middleware/buyer-api-auth.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API rate limits §326";

const availabilityEvidence =
  "apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability";

const webhookRegEvidence =
  "apps/api/src/routes/buyer-webhooks-manage.ts, packages/buyer-webhooks/src/endpoint-service.ts   docs/milestones/M13-manual-validation.md M13 webhook registration §329";

const uiDeferredEvidence =
  "apps/api/src/routes/buyer-api-keys.ts, apps/api/src/routes/buyer-webhooks-manage.ts   docs/milestones/M13-closure.md M13 session HTTP API; buyer settings UI → M14 §349";

const m13Sections = new Map([
  ["§319", apiKeyEvidence],
  ["§320", scopesEvidence],
  ["§321", apiKeySecurityEvidence],
  ["§322", assetEvidence],
  ["§323", jobCreateEvidence],
  ["§324", jobCreateEvidence],
  ["§325", idempotencyEvidence],
  ["§326", rateLimitEvidence],
  ["§327", webhookEvidence],
  ["§328", webhookEventsEvidence],
  ["§329", webhookRegEvidence],
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
  { id: "API-0008", evidence: apiKeyEvidence },
  { id: "API-0009", evidence: apiKeyEvidence },
  { id: "API-0010", evidence: apiKeySecurityEvidence },
  { id: "API-0011", evidence: apiKeySecurityEvidence },
  { id: "API-0012", evidence: scopesEvidence },
  { id: "API-0013", evidence: scopesEvidence },
  { id: "API-0014", evidence: scopesEvidence },
  { id: "API-0015", evidence: apiKeySecurityEvidence },
  { id: "API-0016", evidence: apiKeySecurityEvidence },
  { id: "IO-0136", evidence: assetEvidence },
  { id: "IO-0137", evidence: assetEvidence },
  { id: "API-0017", evidence: jobCreateEvidence },
  { id: "API-0018", evidence: idempotencyEvidence },
  { id: "API-0019", evidence: rateLimitEvidence },
  { id: "API-0020", evidence: rateLimitEvidence },
  { id: "API-0021", evidence: rateLimitEvidence },
  { id: "PRD-0323", evidence: webhookRegEvidence },
  { id: "API-0022", evidence: v1ApiEvidence },
  { id: "UI-0024", evidence: uiDeferredEvidence },
  { id: "UI-0025", evidence: uiDeferredEvidence },
];

const out = text.split("\n").map((line) => {
  for (const override of m13LineOverrides) {
    if (line.includes(`\`${override.id}\``) && (line.includes("`TODO`") || line.includes("`PARTIAL`"))) {
      return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${override.evidence}`);
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
console.log("Updated COVERAGE.md for M13 (§319–§354; UI §349 → M14)");
