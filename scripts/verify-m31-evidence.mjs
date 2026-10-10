#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const api = fs.readFileSync(path.join(root, "apps/api/src/server.ts"), "utf8");
if (!api.includes("buyerJobHistoryRoutes")) {
  console.error("buyer job history routes not mounted");
  process.exit(1);
}
const jobPage = fs.readFileSync(path.join(root, "apps/web/src/app/jobs/[id]/page.tsx"), "utf8");
if (!jobPage.includes("SemanticResultPanel") || !jobPage.includes("Duplicate")) {
  console.error("job detail missing M31 UI");
  process.exit(1);
}
const v1 = fs.readFileSync(path.join(root, "apps/api/src/routes/v1-buyer-api.ts"), "utf8");
if (!v1.includes("/jobs/:jobId/assets/download-all") || !v1.includes("buildJobReuseSeed")) {
  console.error("v1 buyer API missing M31 parity routes");
  process.exit(1);
}
if (!fs.existsSync(path.join(root, "packages/buyer-experience/src/buyer-asset-validation.ts"))) {
  console.error("missing buyer asset validation");
  process.exit(1);
}
const openapi = fs.readFileSync(
  path.join(root, "apps/api/src/openapi/v1-buyer-api.spec.ts"),
  "utf8",
);
for (const pathKey of [
  "/jobs/{jobId}/reuse",
  "/jobs/{jobId}/assets/download-all",
  "/jobs/{jobId}/problem-report",
]) {
  if (!openapi.includes(pathKey)) {
    console.error(`OpenAPI missing ${pathKey}`);
    process.exit(1);
  }
}
console.log("M31 evidence checks OK");
