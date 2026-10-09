#!/usr/bin/env node
/**
 * HOST-NET-004 — optional single managed Node process for API + web on Netsons.
 * Production operators may instead run two panel apps; this script documents the unified path.
 */
import { spawn } from "node:child_process";

process.env.KIVRO_CLOUD_PROFILE ??= "netsons";

const api = spawn("node", ["apps/cloud-netsons/start.mjs"], {
  stdio: "inherit",
  env: process.env,
});

const webEnabled = process.env.KIVRO_NETSONS_UNIFIED_WEB !== "0";
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
