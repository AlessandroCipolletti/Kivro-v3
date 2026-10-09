#!/usr/bin/env node
import { Command } from "commander";
import {
  defaultPublicWebResearchPolicy,
  parseCapabilityContract,
  parseWorkerManifest,
} from "@kivro/contracts";
import {
  buildInternalJobInstructions,
  validateBuyerInput,
  validateWorkerResultManifest,
  type WorkerResultManifest,
} from "@kivro/job-io";
import { buildWorkerManifestTemplate } from "@kivro/capability-publish";
import { ResearchBroker, StaticWebSearchProvider } from "@kivro/research-broker";
import { validateExecutionPreflight } from "@kivro/policy-engine";
import { buildDockerSandboxSpec } from "@kivro/sandbox";
import { isGlobalDispatchEnabled } from "@kivro/platform-policy";
import { generateDeviceKeyPair } from "@kivro/crypto";
import { verifyWorkerManifestSkillHashes } from "@kivro/capability-publish";
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

const WORKER_VERSION = "0.0.0-m06";

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
            {
              name: "global_dispatch",
              status: isGlobalDispatchEnabled() ? "PASS" : "WARN",
              enabled: isGlobalDispatchEnabled(),
            },
            {
              name: "cloud_environment",
              status: "PASS",
              cloudUrl: process.env.KIVRO_CLOUD_URL ?? "http://localhost:3001",
              nodeEnv: process.env.NODE_ENV ?? "development",
            },
          ],
        },
        null,
        2,
      ),
    );
  });

program
  .command("sandbox-spec")
  .description("Print Docker sandbox spec for a manifest (§16/§21)")
  .requiredOption("--file <path>", "Path to worker manifest JSON file")
  .action((opts: { file: string }) => {
    const raw = fs.readFileSync(opts.file, "utf8");
    const manifest = parseWorkerManifest(JSON.parse(raw));
    console.log(JSON.stringify(buildDockerSandboxSpec(manifest), null, 2));
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
  .command("policy-check")
  .description("Validate manifest sandbox/network/tool policy (§16–§21)")
  .requiredOption("--file <path>", "Path to worker manifest JSON file")
  .action(async (opts: { file: string }) => {
    const raw = fs.readFileSync(opts.file, "utf8");
    const manifest = parseWorkerManifest(JSON.parse(raw));
    const preflight = validateExecutionPreflight(manifest);
    const adapter = await createOpenClawAdapter();
    const env = await adapter.buildWorkerEnvironment(manifest);
    const envReport = await adapter.validateWorkerEnvironment(env);
    const ok = preflight.ok && envReport.ok;
    console.log(
      JSON.stringify(
        {
          ok,
          preflight,
          environment: envReport,
          configPath: env.configPath,
        },
        null,
        2,
      ),
    );
    if (!ok) {
      process.exit(1);
    }
  });

program
  .command("research-probe")
  .description("Evaluate Research Broker policy against a manifest (§240)")
  .requiredOption("--file <path>", "Worker manifest JSON")
  .option("--url <url>", "Optional URL to probe via web.fetch")
  .action(async (opts: { file: string; url?: string }) => {
    const manifest = parseWorkerManifest(JSON.parse(fs.readFileSync(opts.file, "utf8")));
    const policy = manifest.internet ?? defaultPublicWebResearchPolicy();
    const broker = new ResearchBroker(
      new StaticWebSearchProvider([]),
      () => Promise.resolve(new Response("")),
    );
    const audit: import("@kivro/research-broker").ResearchAuditEntry[] = [];
    const ctx = { manifest: { ...manifest, internet: policy }, auditLog: audit };
    const search = await broker.webSearch(ctx, { query: "probe", maxResults: 1 });
    let fetch = null;
    if (opts.url) {
      fetch = await broker.webFetch(ctx, { url: opts.url });
    }
    console.log(JSON.stringify({ search, fetch, audit }, null, 2));
    if (!search.allowed && !opts.url) {
      process.exit(1);
    }
    if (opts.url && fetch && !fetch.allowed) {
      process.exit(1);
    }
  });

program
  .command("validate-input")
  .description("Validate buyer payload JSON against a capability contract file")
  .requiredOption("--contract <path>", "Capability contract JSON")
  .requiredOption("--payload <path>", "Payload JSON with inputs and assets")
  .action((opts: { contract: string; payload: string }) => {
    const contract = parseCapabilityContract(JSON.parse(fs.readFileSync(opts.contract, "utf8")));
    const payload = JSON.parse(fs.readFileSync(opts.payload, "utf8")) as {
      inputs?: Record<string, unknown>;
      assets?: Record<string, import("@kivro/job-io").JobAssetRef[]>;
    };
    const result = validateBuyerInput({
      contract,
      inputs: payload.inputs ?? {},
      assets: payload.assets ?? {},
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) {
      process.exit(1);
    }
  });

program
  .command("validate-output")
  .description("Validate Worker result.json against output contract")
  .requiredOption("--contract <path>", "Capability contract JSON")
  .requiredOption("--result <path>", "result.json path")
  .option("--output-root <path>", "Job output root directory", "/job/output")
  .action((opts: { contract: string; result: string; outputRoot: string }) => {
    const contract = parseCapabilityContract(JSON.parse(fs.readFileSync(opts.contract, "utf8")));
    const manifest = JSON.parse(fs.readFileSync(opts.result, "utf8")) as WorkerResultManifest;
    const result = validateWorkerResultManifest(contract.output, manifest, opts.outputRoot);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) {
      process.exit(1);
    }
  });

program
  .command("job-instructions")
  .description("Print platform-controlled internal job instructions (§213)")
  .requiredOption("--contract <path>", "Capability contract JSON")
  .action((opts: { contract: string }) => {
    const contract = parseCapabilityContract(JSON.parse(fs.readFileSync(opts.contract, "utf8")));
    console.log(buildInternalJobInstructions(contract));
  });

program
  .command("verify-manifest")
  .description("Verify local skill folders match manifest content hashes")
  .requiredOption("--file <path>", "Path to worker manifest JSON file")
  .action((opts: { file: string }) => {
    const raw = fs.readFileSync(opts.file, "utf8");
    const manifest = JSON.parse(raw) as Parameters<typeof verifyWorkerManifestSkillHashes>[0];
    const result = verifyWorkerManifestSkillHashes(manifest);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) {
      process.exit(1);
    }
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
