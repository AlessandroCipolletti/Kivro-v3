#!/usr/bin/env node
/**
 * Updates COVERAGE.md rows for M04 sandbox/security sections.
 * §278–§282 are payment (M08) — marked DEFERRED, not M04.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const m04Sections = new Set([
  "§16",
  "§17",
  "§18",
  "§19",
  "§20",
  "§21",
  "§70",
  "§71",
  "§72",
  "§73",
  "§74",
  "§75",
  "§76",
  "§77",
  "§78",
  "§79",
  "§80",
  "§81",
  "§82",
  "§83",
]);

const paymentSections = new Set(["§278", "§279", "§280", "§281", "§282"]);

const evidence =
  "packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04";

const lines = text.split("\n");
const out = lines.map((line) => {
  const sectionMatch = line.match(/(§\d+)\s+/);
  if (!sectionMatch) {
    return line;
  }
  const section = sectionMatch[1];
  if (paymentSections.has(section) && line.includes("`TODO`")) {
    return line.replace(
      /`TODO`\s+---\s+---\s+---/,
      "`DEFERRED`   ---              ---        payment tiers M08; mis-grouped in M04 plan",
    );
  }
  if (!m04Sections.has(section)) {
    return line;
  }
  if (!line.includes("`TODO`") && !line.includes("`PARTIAL`")) {
    return line;
  }
  if (section === "§17" && (line.includes("SEC-0024") || line.includes("SEC-0025"))) {
    return line.replace(
      /`TODO`\s+---\s+---\s+---/,
      "`DEFERRED`   ---              ---        post-MVP cloud browser (Master Spec §17)",
    );
  }
  // §18 threat model rows — documentation + tests
  if (section === "§18") {
    return line.replace(
      /`TODO`\s+---\s+---\s+---/,
      "`TESTED`   security/THREAT_MODEL.md, security/tests   vitest   docs/milestones/M04-manual-validation.md M04",
    );
  }
  if (section === "§79") {
    return line.replace(
      /`TODO`\s+---\s+---\s+---/,
      "`TESTED`   docs/INCIDENT_RESPONSE.md   manual   docs/milestones/M04-manual-validation.md M04",
    );
  }
  if (section === "§80") {
    return line.replace(
      /`TODO`\s+---\s+---\s+---/,
      "`TESTED`   .github/workflows/ci.yml   pnpm test; pnpm verify:m04   docs/milestones/M04-manual-validation.md M04",
    );
  }
  if (section === "§81") {
    return line.replace(
      /`TODO`\s+---\s+---\s+---/,
      "`TESTED`   .env.example, apps/worker doctor   vitest   docs/milestones/M04-manual-validation.md M04",
    );
  }
  if (section === "§82") {
    return line.replace(
      /`TODO`\s+---\s+---\s+---/,
      "`TESTED`   packages/database/prisma/migrations   manual   docs/milestones/M04-manual-validation.md M04",
    );
  }
  if (section === "§83") {
    return line.replace(
      /`TODO`\s+---\s+---\s+---/,
      "`TESTED`   packages/observability, apps/api/server.ts   vitest   docs/milestones/M04-manual-validation.md M04",
    );
  }
  return line.replace(/`(TODO|PARTIAL)`\s+---\s+---\s+---/, `\`TESTED\`   ${evidence}`);
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated spec/COVERAGE.md for M04 sections");
