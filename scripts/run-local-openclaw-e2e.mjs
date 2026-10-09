#!/usr/bin/env node
/** §557 — OpenClaw detect, sandbox list, optional full job when API + prior capability exist. */
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const base = process.env.KIVRO_E2E_API_URL ?? process.env.KIVRO_CLOUD_URL ?? "http://localhost:3001";
const openclawBin = process.env.OPENCLAW_BIN ?? "openclaw";

async function main() {
  if (spawnSync(openclawBin, ["--version"], { encoding: "utf8" }).status !== 0) {
    console.log(JSON.stringify({ skipped: true, reason: "OpenClaw CLI not installed", openclawBin }));
    process.exit(0);
  }
  const version = spawnSync(openclawBin, ["--version"], { encoding: "utf8" }).stdout.trim();
  const sandboxList = spawnSync(openclawBin, ["sandbox", "list", "--json"], { encoding: "utf8" });
  const selfTest = spawnSync(
    "node",
    ["scripts/run-with-env.mjs", "node", "apps/worker/dist/cli.js", "sandbox-self-test"],
    { cwd: root, encoding: "utf8" },
  );
  if (selfTest.status !== 0) {
    throw new Error("worker sandbox-self-test failed — is Docker running?");
  }
  const live = await fetch(`${base}/health/live`).then((r) => r.ok).catch(() => false);
  console.log(
    JSON.stringify({
      openclaw: {
        version,
        sandboxListExit: sandboxList.status,
        apiLive: live,
        hint: live
          ? "Set KIVRO_E2E_OPENCLAW=true when running test:e2e:local for agent exec path"
          : "Start pnpm dev then re-run E2E",
      },
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
