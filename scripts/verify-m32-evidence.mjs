#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const required = [
  "docs/milestones/M32-closure.md",
  "packages/seller-experience/src/onboarding-status.ts",
  "packages/seller-experience/src/discovery-consent-policy.ts",
  "packages/seller-experience/src/credential-ref-metadata.ts",
  "apps/api/src/routes/seller-onboarding.ts",
  "apps/web/src/app/seller/onboarding/page.tsx",
  "apps/web/src/app/seller/capabilities/[id]/guide/page.tsx",
  "apps/web/src/components/PublishReadinessPanel.tsx",
  "security/tests/conformance-sellerux-gold-m32.test.ts",
  "security/tests/seller-onboarding-auth-m32.test.ts",
];

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`Missing M32 evidence: ${rel}`);
    process.exit(1);
  }
}

console.log("M32 evidence paths OK");
