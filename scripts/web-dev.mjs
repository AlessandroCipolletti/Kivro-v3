#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

const webDir = path.resolve(import.meta.dirname, "../apps/web");
let port = process.env.WEB_DEV_PORT?.trim();
if (!port && process.env.WEB_APP_URL) {
  try {
    port = new URL(process.env.WEB_APP_URL).port || "3000";
  } catch {
    port = "3000";
  }
}
port = port || "3000";

const res = spawnSync("pnpm", ["exec", "next", "dev", "-p", port], {
  cwd: webDir,
  stdio: "inherit",
  env: process.env,
});
process.exit(res.status ?? 1);
