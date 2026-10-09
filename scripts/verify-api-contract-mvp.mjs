#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const routesDir = path.join(root, "apps/api/src/routes");
const requiredSnippets = [
  'app.get("/marketplace/capabilities"',
  'app.get("/capabilities/:slug"',
  'app.post("/jobs"',
  'app.get("/jobs/:jobId"',
  'app.post("/capabilities/:id/publish"',
  'app.post("/pair"',
];

const files = fs.readdirSync(routesDir).filter((f) => f.endsWith(".ts"));
const blob = files.map((f) => fs.readFileSync(path.join(routesDir, f), "utf8")).join("\n");

const missing = requiredSnippets.filter((s) => !blob.includes(s));
if (missing.length) {
  console.error("API contract MVP check failed; missing route handlers for:");
  for (const m of missing) {
    console.error(`  ${m}`);
  }
  process.exit(1);
}
console.log("API contract MVP route smoke OK");
