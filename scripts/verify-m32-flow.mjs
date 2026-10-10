#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

for (const required of [
  "docs/milestones/M32-closure.md",
  "packages/seller-experience/src/onboarding-status.ts",
  "scripts/audit-m32-exit-criteria.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["db:migrate"]);
run("pnpm", ["db:generate"]);
run("pnpm", ["--filter", "@kivro/seller-experience", "run", "build"]);
run("pnpm", ["--filter", "@kivro/worker-store", "run", "build"]);
run("pnpm", ["verify:m31"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);
run("pnpm", ["--filter", "@kivro/worker", "run", "build"]);

run("node", ["scripts/sync-m32-coverage.mjs"]);
run("node", ["scripts/audit-m32-spotcheck.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/seller-experience/src/publish-readiness.test.ts",
  "packages/seller-experience/src/doctor-sanitize.test.ts",
  "packages/seller-experience/src/marketplace-identity.test.ts",
  "packages/seller-experience/src/ai-draft-boundary.test.ts",
  "packages/seller-experience/src/discovery-consent-policy.test.ts",
  "packages/seller-experience/src/semantic-version-diff.test.ts",
  "packages/seller-experience/src/effective-permissions.test.ts",
  "packages/worker-store/src/local-credentials.test.ts",
  "security/tests/seller-public-identity-m32.test.ts",
  "security/tests/seller-onboarding-auth-m32.test.ts",
  "packages/seller-experience/src/credential-ref-metadata.test.ts",
  "packages/seller-experience/src/seller-security-disclosure.test.ts",
  "packages/seller-experience/src/first-publication-guide.test.ts",
  "security/tests/conformance-sellerux-gold-m32.test.ts",
  "security/tests/acceptance-m32.test.ts",
]);

run("node", ["scripts/run-backend-conformance.mjs"]);
run("node", ["scripts/verify-golden-registry.mjs"]);
run("node", ["scripts/verify-m32-evidence.mjs"]);
run("node", ["scripts/audit-m32-exit-criteria.mjs"]);
run("node", ["scripts/audit-m32-fitness-report.mjs"]);
run("node", ["scripts/audit-plan-through-m32.mjs"]);

run("pnpm", ["exec", "vitest", "run", "security/tests/acceptance-m32-exit.test.ts"]);

console.log("M32 verify flow passed (seller onboarding & safe publication)");
