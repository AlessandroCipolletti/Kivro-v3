#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

spawnSync("pnpm", ["--filter", "@kivro/worker", "run", "build"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    KIVRO_EXECUTION_MODE: process.env.KIVRO_EXECUTION_MODE ?? "synthetic",
  },
});

const res = spawnSync("node", ["apps/worker/dist/cli.js", "start"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(res.status ?? 1);
