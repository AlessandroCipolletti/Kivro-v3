#!/usr/bin/env node
import { Command } from "commander";
import { buildWorkerManifestTemplate } from "@kivro/capability-publish";
import { generateDeviceKeyPair } from "@kivro/crypto";
import { hashOpenClawSkill } from "@kivro/openclaw-adapter";
import { WORKER_COMMANDS } from "@kivro/job-protocol";
import { createOpenClawAdapter } from "@kivro/openclaw-adapter";
import {
  getDeviceIdentity,
  openWorkerStore,
  saveDeviceIdentity,
  setWorkerDeviceId,
} from "@kivro/worker-store";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const WORKER_VERSION = "0.0.0-m03";

function runtimeRoot(): string {
  const configured = process.env.KIVRO_RUNTIME_ROOT ?? "~/.kivro/runtime";
  return configured.startsWith("~")
    ? path.join(os.homedir(), configured.slice(1))
    : configured;
}

const program = new Command();
program.name("kivro-worker").description("Kivro seller Worker");

program
  .command("doctor")
  .description("Environment and security prerequisite checks (§57)")
  .action(async () => {
    const adapter = await createOpenClawAdapter();
    const detection = await adapter.detect();
    const compatibility = await adapter.validateCompatibility();
    const dockerOk = fs.existsSync("/var/run/docker.sock");
    console.log(
      JSON.stringify(
        {
          checks: [
            {
              name: "openclaw",
              status: detection.installed ? "PASS" : "WARN",
              detection,
            },
            {
              name: "openclaw_compatibility",
              status: compatibility.compatible ? "PASS" : "FAIL",
              compatibility,
            },
            { name: "docker_socket", status: dockerOk ? "PASS" : "WARN" },
          ],
        },
        null,
        2,
      ),
    );
  });

program
  .command("scan")
  .description("Read-only OpenClaw discovery (§96)")
  .action(async () => {
    const adapter = await createOpenClawAdapter();
    const discovery = await adapter.discover();
    console.log(JSON.stringify(discovery, null, 2));
  });

program
  .command("manifest")
  .description("Build worker manifest template with verified skill hashes (§54)")
  .requiredOption("--skills <names>", "Comma-separated skill names from explicit consent")
  .action((opts: { skills: string }) => {
    const names = opts.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const manifest = buildWorkerManifestTemplate({
      skills: names.map((name) => ({
        name,
        contentHash: hashOpenClawSkill(name),
      })),
    });
    console.log(JSON.stringify(manifest, null, 2));
  });

program
  .command("pair")
  .description("Pair this machine with the marketplace using a one-time code")
  .requiredOption("--code <code>", "Pairing code from seller dashboard")
  .action(async (opts: { code: string }) => {
    const db = openWorkerStore(runtimeRoot());
    let identity = getDeviceIdentity(db);
    if (!identity) {
      const keys = generateDeviceKeyPair();
      const cloudUrl = process.env.KIVRO_CLOUD_URL ?? "http://localhost:3001";
      saveDeviceIdentity(db, {
        publicKeyPem: keys.publicKeyPem,
        privateKeyPem: keys.privateKeyPem,
        cloudUrl,
      });
      identity = getDeviceIdentity(db);
    }
    if (!identity) {
      throw new Error("Failed to initialize device identity");
    }
    const res = await fetch(`${identity.cloudUrl}/worker-devices/pair`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: opts.code,
        publicKey: identity.publicKeyPem,
        name: os.hostname(),
        platform: `${process.platform}/${process.arch}`,
        workerVersion: WORKER_VERSION,
      }),
    });
    const payload = (await res.json()) as { workerDeviceId?: string; error?: string };
    if (!res.ok || !payload.workerDeviceId) {
      console.error(JSON.stringify(payload));
      process.exit(1);
    }
    setWorkerDeviceId(db, payload.workerDeviceId);
    console.log(JSON.stringify({ paired: true, workerDeviceId: payload.workerDeviceId }));
  });

program.command("version").action(() => console.log(WORKER_VERSION));

program.command("commands").action(() => console.log(WORKER_COMMANDS.join("\n")));

program.parse();
