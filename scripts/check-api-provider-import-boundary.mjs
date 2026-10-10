#!/usr/bin/env node
/** M24 — apps/api may import providers only through approved composition/dispatch/cron ports. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const apiSrc = path.join(root, "apps/api/src");

const allowedRelative = new Set([
  "cloud-composition.ts",
  path.join("services", "cloud-dispatch-hook.ts"),
  path.join("routes", "platform-cron.ts"),
]);

const providerImport = /from\s+["']@kivro\/cloud-(netsons|aws)["']/;

const violations = [];

function walk(dir, relBase = "") {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = relBase ? `${relBase}/${name}` : name;
    if (fs.statSync(full).isDirectory()) {
      walk(full, rel);
      continue;
    }
    if (!name.endsWith(".ts")) continue;
    const text = fs.readFileSync(full, "utf8");
    if (!providerImport.test(text)) continue;
    if (!allowedRelative.has(rel)) {
      violations.push(rel);
    }
  }
}

walk(apiSrc);

if (violations.length > 0) {
  console.error("API provider import boundary violated:");
  for (const v of violations) {
    console.error(`  apps/api/src/${v}`);
  }
  process.exit(1);
}

console.log("API provider import boundary OK");
