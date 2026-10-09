#!/usr/bin/env node
/** M21 — optional single process for API + web on AWS compute (same pattern as Netsons unified start). */
import { spawn } from "node:child_process";

process.env.KIVRO_CLOUD_PROFILE ??= "aws";

const api = spawn("node", ["apps/cloud-aws/start.mjs"], {
  stdio: "inherit",
  env: process.env,
});

const webEnabled = process.env.KIVRO_AWS_UNIFIED_WEB !== "0";
let web;
if (webEnabled) {
  web = spawn("pnpm", ["--filter", "@kivro/web", "run", "start"], {
    stdio: "inherit",
    env: process.env,
  });
}

function shutdown(code) {
  api.kill("SIGTERM");
  web?.kill("SIGTERM");
  process.exit(code ?? 0);
}

api.on("exit", (code) => shutdown(code ?? 1));
web?.on("exit", (code) => shutdown(code ?? 1));
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
