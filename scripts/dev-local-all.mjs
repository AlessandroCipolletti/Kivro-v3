#!/usr/bin/env node
/**
 * One-shot local stack: Docker infra (via dev-setup), API, Web, Worker poll daemon.
 * Used by `.vscode/launch.json` and `pnpm dev:all`.
 */
import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import net from "node:net";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const withSeed = process.argv.includes("--seed");

if (!process.env.SESSION_SECRET?.trim()) {
  process.env.SESSION_SECRET = crypto.randomBytes(32).toString("hex");
  console.log("SESSION_SECRET was empty — using ephemeral secret for this dev session.");
}

function runSync(label, cmd, args) {
  console.log(`\n→ ${label}`);
  const res = spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: process.env });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

function webDevPort() {
  if (process.env.WEB_DEV_PORT?.trim()) {
    return Number(process.env.WEB_DEV_PORT.trim());
  }
  if (process.env.WEB_APP_URL) {
    try {
      const p = new URL(process.env.WEB_APP_URL).port;
      return Number(p || 3000);
    } catch {
      return 3000;
    }
  }
  return 3000;
}

function isPortFree(port, host = "::") {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once("error", () => resolve(false));
    s.once("listening", () => {
      s.close(() => resolve(true));
    });
    s.listen(port, host);
  });
}

async function resolveWebListenPort(preferred) {
  if (await isPortFree(preferred)) {
    return preferred;
  }
  if (process.env.WEB_DEV_PORT?.trim()) {
    return null;
  }
  if (process.env.KIVRO_DEV_WEB_AUTO_PORT === "false") {
    return null;
  }
  for (let p = preferred + 1; p <= preferred + 20; p++) {
    if (await isPortFree(p)) {
      console.warn(
        `\n[web] port ${preferred} busy — using ${p} (set WEB_DEV_PORT=${p} and WEB_APP_URL=http://localhost:${p} to persist)\n`,
      );
      return p;
    }
  }
  return null;
}

runSync("dev:setup", "node", ["scripts/dev-setup.mjs"]);

runSync("build API workspace", "pnpm", ["--filter", "@kivro/api...", "run", "build"]);
runSync("build Worker", "pnpm", ["--filter", "@kivro/worker", "run", "build"]);

if (withSeed) {
  runSync("dev-seed", "node", ["scripts/run-dev-seed.mjs"]);
  console.log("Demo identities: buyer@kivro.local / seller@kivro.local (password in seed output).\n");
}

const workerEnv = {
  ...process.env,
  KIVRO_EXECUTION_MODE: process.env.KIVRO_EXECUTION_MODE ?? "sandbox-fixture",
};

const children = [];
let shuttingDown = false;
const webOptional = process.env.KIVRO_DEV_WEB_OPTIONAL !== "false";

function start(label, cmd, args, env = process.env, opts = {}) {
  const { fatal = true } = opts;
  const child = spawn(cmd, args, { cwd: root, stdio: "inherit", env });
  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }
    if (signal) {
      console.log(`[${label}] stopped (${signal})`);
    } else if (code !== 0 && code != null) {
      console.error(`[${label}] exited with code ${code}`);
    }
    if (fatal && code !== 0) {
      shutdown(code ?? 1);
    }
  });
  children.push({ label, child });
  return child;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  for (const { child } of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(exitCode), 300);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const apiPort = process.env.PORT?.trim() || "3001";
const webPortPreferred = webDevPort();
const webPortResolved = await resolveWebListenPort(webPortPreferred);
const apiScript = process.env.KIVRO_DEV_API_WATCH === "true" ? "dev" : "start";
console.log("");
console.log("Kivro local env (all)");
console.log(
  `  Web    → ${webPortResolved ? `http://localhost:${webPortResolved}` : `(skipped — port ${webPortPreferred} busy)`}`,
);
console.log(`  API    → http://localhost:${apiPort}${apiScript === "start" ? " (no --watch)" : " (--watch)"}`);
console.log(`  Worker → poll daemon (KIVRO_EXECUTION_MODE=${workerEnv.KIVRO_EXECUTION_MODE})`);
console.log("  MinIO  → http://localhost:9001 (kivro / kivrodevsecret)");
console.log("Press Ctrl+C to stop all processes.");
console.log("");

start("api", "pnpm", ["--filter", "@kivro/api", "run", apiScript]);

console.log("\n→ worker auto-pair (after API is up)\n");
const autoPair = spawnSync("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-worker-auto-pair.mjs"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
if (autoPair.status !== 0) {
  console.error(
    "\nWorker auto-pair failed. API keeps running; fix pairing or set KIVRO_DEV_AUTO_PAIR=false.\n",
  );
} else {
  start("worker", "node", ["apps/worker/dist/cli.js", "start"], workerEnv);
}

if (!webPortResolved) {
  const msg = `Port ${webPortPreferred} is in use (stop the other Next/dev server or set WEB_DEV_PORT / WEB_APP_URL).`;
  if (webOptional) {
    console.warn(`\n[web] skipped — ${msg}\n`);
  } else {
    console.error(`\n[web] ${msg}\n`);
    shutdown(1);
  }
} else {
  const webEnv = {
    ...process.env,
    WEB_DEV_PORT: String(webPortResolved),
  };
  start("web", "pnpm", ["--filter", "@kivro/web", "run", "dev"], webEnv, {
    fatal: !webOptional,
  });
}

// Keep parent alive while children run
await new Promise(() => {});
