#!/usr/bin/env node
/** Run dev-seed (requires root devDependencies @kivro/database, auth, billing). */
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const res = spawnSync("node", ["scripts/dev-seed.mjs"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(res.status ?? 1);
