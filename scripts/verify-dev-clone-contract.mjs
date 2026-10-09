#!/usr/bin/env node
/** §573 clean-clone — verify documented bootstrap commands exist (no git clone). */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const requiredScripts = [
  "dev:setup",
  "dev",
  "dev:demo",
  "worker:dev",
  "test:e2e:local",
  "verify:m18",
];
const missing = requiredScripts.filter((s) => !pkg.scripts[s]);
if (missing.length) {
  console.error("Missing package scripts:", missing.join(", "));
  process.exit(1);
}
for (const doc of ["README.md", "docs/DEV-LOCAL.md", ".env.example"]) {
  if (!fs.existsSync(path.join(root, doc))) {
    console.error(`Missing ${doc}`);
    process.exit(1);
  }
}
const devLocal = fs.readFileSync(path.join(root, "docs/DEV-LOCAL.md"), "utf8");
if (!devLocal.includes("pnpm dev:setup") || !devLocal.includes("copy `.env.example`")) {
  console.error("DEV-LOCAL.md missing clone/setup steps");
  process.exit(1);
}
console.log(JSON.stringify({ cloneContract: "ok", scripts: requiredScripts.length }));
