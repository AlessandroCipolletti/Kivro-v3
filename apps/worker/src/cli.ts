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
  clearWorkerGlobalPause,
  getDeviceIdentity,
  getLocalJobExecutionState,
  getWorkerGlobalPause,
  listLocalJobExecutionStates,
  openWorkerStore,
  saveDeviceIdentity,
  setLocalJobExecutionState,
  setWorkerDeviceId,
  setWorkerGlobalPause,
} from "@kivro/worker-store";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

const WORKER_VERSION = "0.0.0-m07";

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
    const snapshot = await collectLocalHealthSnapshot();
    console.log(
      JSON.stringify(
        {
          checks: [
            {
              name: "marketplace_pause",
              status: snapshot.globalPauseActive ? "WARN" : "PASS",
              globalPauseActive: snapshot.globalPauseActive,
            },
            {
              name: "docker_sandbox",
              status: snapshot.dockerOk && snapshot.sandboxOk ? "PASS" : "FAIL",
              dockerOk: snapshot.dockerOk,
              sandboxOk: snapshot.sandboxOk,
            },
            {
              name: "openclaw",
              status: snapshot.openClawInstalled ? "PASS" : "WARN",
              version: snapshot.openClawVersion,
              compatible: snapshot.openClawCompatible,
            },
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
          workerVersion: snapshot.workerVersion,
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

const jobCmd = program.command("job").description("Per-job execution control (§429, §445)");

jobCmd
  .command("cancel")
  .description("Cancel local execution attempt (§450); cloud cancel via seller API")
  .argument("<job-id>", "Job UUID")
  .option("--attempt <id>", "Attempt id", "1")
  .action(async (jobId: string, opts: { attempt: string }) => {
    const adapter = await createOpenClawAdapter();
    await adapter.cancel(opts.attempt);
    const store = openWorkerStore(runtimeRoot());
    setLocalJobExecutionState(store, {
      jobId,
      attemptId: opts.attempt,
      status: "CANCELLED",
      updatedAt: new Date().toISOString(),
      cloudSyncPending: true,
    });
    console.log(JSON.stringify({ jobId, cancelled: true }));
  });

jobCmd
  .command("pause")
  .description("Pause a running job locally and stop resource consumption")
  .argument("<job-id>", "Job UUID")
  .option("--attempt <id>", "Attempt id", "1")
  .action(async (jobId: string, opts: { attempt: string }) => {
    const store = openWorkerStore(runtimeRoot());
    const adapter = await createOpenClawAdapter();
    const pauseResult = await adapter.pause(jobId, opts.attempt);
    setLocalJobExecutionState(store, {
      jobId,
      attemptId: opts.attempt,
      status: pauseResult.ok ? "PAUSED" : "PAUSE_REQUESTED",
      updatedAt: new Date().toISOString(),
      cloudSyncPending: true,
    });
    const identity = getDeviceIdentity(store);
    if (identity?.workerDeviceId && identity.cloudUrl) {
      try {
        await fetch(`${identity.cloudUrl}/worker/jobs/${jobId}/pause-ack`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-worker-device-id": identity.workerDeviceId,
          },
          body: JSON.stringify({
            type: "JOB_PAUSE_ACK",
            protocolVersion: 1,
            jobId,
            commandId: randomUUID(),
            acknowledgedAt: new Date().toISOString(),
            localState: pauseResult.ok ? "PAUSED" : "PAUSE_NOT_SUPPORTED",
          }),
        });
      } catch {
        /* offline local pause still valid §430 */
      }
    }
    console.log(JSON.stringify({ jobId, local: getLocalJobExecutionState(store, jobId) }));
  });

jobCmd
  .command("list")
  .description("List locally tracked job execution states")
  .action(() => {
    const store = openWorkerStore(runtimeRoot());
    console.log(JSON.stringify(listLocalJobExecutionStates(store), null, 2));
  });

jobCmd
  .command("sync")
  .description("Sync pending local pause state to cloud when reachable")
  .argument("<job-id>", "Job UUID")
  .action(async (jobId: string) => {
    const store = openWorkerStore(runtimeRoot());
    const local = getLocalJobExecutionState(store, jobId);
    const identity = getDeviceIdentity(store);
    if (!local || !identity?.workerDeviceId) {
      console.error(JSON.stringify({ error: "NO_LOCAL_STATE_OR_DEVICE" }));
      process.exit(1);
    }
    if (local.status !== "PAUSED") {
      console.log(JSON.stringify({ synced: false, reason: "not_paused_locally" }));
      return;
    }
    const res = await fetch(`${identity.cloudUrl}/worker/jobs/${jobId}/pause-ack`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-worker-device-id": identity.workerDeviceId,
      },
      body: JSON.stringify({
        type: "JOB_PAUSE_ACK",
        protocolVersion: 1,
        jobId,
        commandId: randomUUID(),
        acknowledgedAt: new Date().toISOString(),
        localState: "PAUSED",
      }),
    });
    console.log(JSON.stringify({ status: res.status, cloudSyncPending: !res.ok }));
  });

jobCmd
  .command("resume")
  .description("Resume a paused job after readiness checks")
  .argument("<job-id>", "Job UUID")
  .option("--attempt <id>", "Attempt id", "1")
  .action(async (jobId: string, opts: { attempt: string }) => {
    const store = openWorkerStore(runtimeRoot());
    const adapter = await createOpenClawAdapter();
    const resumeResult = await adapter.resume(jobId, opts.attempt);
    setLocalJobExecutionState(store, {
      jobId,
      attemptId: opts.attempt,
      status: resumeResult.ok ? "RUNNING" : "PAUSED",
      updatedAt: new Date().toISOString(),
      cloudSyncPending: true,
    });
    console.log(JSON.stringify({ jobId, resume: resumeResult }));
  });

function applyCloudMarketplaceSync(store: ReturnType<typeof openWorkerStore>, cloud: unknown): void {
  if (!cloud || typeof cloud !== "object") {
    return;
  }
  const control = (cloud as { marketplaceControl?: { requiresLocalPauseSync?: boolean } })
    .marketplaceControl;
  if (control?.requiresLocalPauseSync) {
    setWorkerGlobalPause(store, {
      active: true,
      pausedAt: new Date().toISOString(),
      source: "WEB_SYNC",
      reason: "cloud_emergency_pause",
    });
  }
}

async function collectLocalHealthSnapshot(): Promise<{
  workerVersion: string;
  openClawVersion: string | null;
  dockerOk: boolean;
  sandboxOk: boolean;
  openClawInstalled: boolean;
  openClawCompatible: boolean;
  globalPauseActive: boolean;
}> {
  const adapter = await createOpenClawAdapter();
  const detection = await adapter.detect();
  const compatibility = await adapter.validateCompatibility();
  const dockerOk = fs.existsSync("/var/run/docker.sock");
  const store = openWorkerStore(runtimeRoot());
  const globalPause = getWorkerGlobalPause(store);
  return {
    workerVersion: WORKER_VERSION,
    openClawVersion: detection.version ?? null,
    dockerOk,
    sandboxOk: dockerOk && compatibility.compatible,
    openClawInstalled: detection.installed,
    openClawCompatible: compatibility.compatible,
    globalPauseActive: globalPause?.active === true,
  };
}

program
  .command("sandbox-self-test")
  .description("§573 — Docker fixture + OpenClaw detection/sandbox list smoke")
  .action(async () => {
    const { runSandboxSelfTest } = await import("./sandbox-self-test.js");
    const result = await runSandboxSelfTest();
    console.log(JSON.stringify({ sandboxSelfTest: result }, null, 2));
    if (!result.docker || !result.dockerFixture) {
      process.exit(1);
    }
  });

program
  .command("health")
  .description("Worker health summary and cloud heartbeat (§379)")
  .option("--no-cloud", "Skip cloud heartbeat")
  .action(async (opts: { cloud: boolean }) => {
    const snapshot = await collectLocalHealthSnapshot();
    const store = openWorkerStore(runtimeRoot());
    const identity = getDeviceIdentity(store);
    let cloud: unknown = { skipped: true };
    if (opts.cloud !== false && identity?.workerDeviceId && identity.cloudUrl) {
      const res = await fetch(`${identity.cloudUrl}/worker/heartbeat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-worker-device-id": identity.workerDeviceId,
        },
        body: JSON.stringify(snapshot),
      });
      cloud = await res.json().catch(() => ({ error: "INVALID_JSON" }));
      applyCloudMarketplaceSync(store, cloud);
    }
    console.log(
      JSON.stringify(
        {
          marketplaceWorker: snapshot.workerVersion,
          local: snapshot,
          cloud,
        },
        null,
        2,
      ),
    );
  });

program
  .command("pause")
  .description("Pause marketplace job acceptance (§382–§384)")
  .option("--all", "Pause all new marketplace jobs on this Worker")
  .action(async (opts: { all?: boolean }) => {
    if (!opts.all) {
      console.error("Use pause --all for emergency marketplace pause, or job pause <id> for a running job.");
      process.exit(1);
    }
    const store = openWorkerStore(runtimeRoot());
    setWorkerGlobalPause(store, {
      active: true,
      pausedAt: new Date().toISOString(),
      source: "CLI",
      reason: "seller_emergency",
    });
    const identity = getDeviceIdentity(store);
    if (identity?.workerDeviceId && identity.cloudUrl) {
      const snapshot = await collectLocalHealthSnapshot();
      await fetch(`${identity.cloudUrl}/worker/heartbeat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-worker-device-id": identity.workerDeviceId,
        },
        body: JSON.stringify(snapshot),
      }).catch(() => undefined);
    }
    const runningLocally = listLocalJobExecutionStates(store).filter((s) =>
      ["RUNNING", "PAUSE_REQUESTED", "PAUSED", "RESUME_REQUESTED"].includes(s.status),
    ).length;
    console.log(
      JSON.stringify({
        globalPause: true,
        runningJobsLocally: runningLocally,
        note: "Paused new jobs; running jobs continue unless explicitly stopped (§388).",
      }),
    );
  });

program
  .command("resume")
  .description("Resume marketplace job acceptance after pause --all")
  .option("--all", "Clear global marketplace pause")
  .action(async (opts: { all?: boolean }) => {
    if (!opts.all) {
      console.error("Use resume --all to clear global pause, or job resume <id> for a running job.");
      process.exit(1);
    }
    const store = openWorkerStore(runtimeRoot());
    clearWorkerGlobalPause(store);
    const identity = getDeviceIdentity(store);
    if (identity?.workerDeviceId && identity.cloudUrl) {
      const snapshot = await collectLocalHealthSnapshot();
      await fetch(`${identity.cloudUrl}/worker/heartbeat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-worker-device-id": identity.workerDeviceId,
        },
        body: JSON.stringify(snapshot),
      }).catch(() => undefined);
    }
    console.log(JSON.stringify({ globalPause: false }));
  });

program
  .command("stop")
  .description("Destructive: stop all local job execution attempts (§388)")
  .option("--all", "Stop every locally tracked running job")
  .option("--confirm", "Required acknowledgement for destructive stop")
  .action(async (opts: { all?: boolean; confirm?: boolean }) => {
    if (!opts.all || !opts.confirm) {
      console.error("Use: kivro-worker stop --all --confirm");
      console.error("This does not replace cloud billing/settlement; cancel jobs in seller UI when needed.");
      process.exit(1);
    }
    const store = openWorkerStore(runtimeRoot());
    const adapter = await createOpenClawAdapter();
    const active = listLocalJobExecutionStates(store).filter((s) =>
      ["RUNNING", "PAUSE_REQUESTED", "PAUSED", "RESUME_REQUESTED"].includes(s.status),
    );
    for (const state of active) {
      await adapter.cancel(state.attemptId);
      setLocalJobExecutionState(store, {
        ...state,
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
        cloudSyncPending: true,
      });
    }
    console.log(
      JSON.stringify({
        stoppedLocally: active.length,
        note: "Running jobs default policy is pause-only; stop --all is destructive.",
      }),
    );
  });

jobCmd
  .command("run-openclaw")
  .description("Execute one job with OpenClaw detected + Docker sandbox (§557 / §573)")
  .argument("<job-id>", "Job UUID")
  .action(async (jobId: string) => {
    const store = openWorkerStore(runtimeRoot());
    const identity = getDeviceIdentity(store);
    if (!identity?.workerDeviceId) {
      console.error(JSON.stringify({ error: "WORKER_NOT_PAIRED" }));
      process.exit(1);
    }
    const { runOpenClawSandboxForJob } = await import("./execute-openclaw-offer.js");
    await runOpenClawSandboxForJob({
      runtimeRoot: runtimeRoot(),
      identity: { cloudUrl: identity.cloudUrl, workerDeviceId: identity.workerDeviceId },
      jobId,
    });
  });

jobCmd
  .command("run-fixture")
  .description("Execute one job in Docker sandbox fixture mode (§573 local E2E)")
  .argument("<job-id>", "Job UUID")
  .action(async (jobId: string) => {
    const store = openWorkerStore(runtimeRoot());
    const identity = getDeviceIdentity(store);
    if (!identity?.workerDeviceId) {
      console.error(JSON.stringify({ error: "WORKER_NOT_PAIRED" }));
      process.exit(1);
    }
    const { runSandboxFixtureForJob } = await import("./execute-sandbox-offer.js");
    await runSandboxFixtureForJob({
      runtimeRoot: runtimeRoot(),
      identity: { cloudUrl: identity.cloudUrl, workerDeviceId: identity.workerDeviceId },
      jobId,
    });
  });

program
  .command("start")
  .description("Run outbound poll loop (local dev daemon — §556)")
  .action(async () => {
    const { runWorkerPollDaemon } = await import("./start-daemon.js");
    await runWorkerPollDaemon();
  });

program.command("version").action(() => console.log(WORKER_VERSION));

program.command("commands").action(() => console.log(WORKER_COMMANDS.join("\n")));

program.parse();
