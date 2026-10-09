import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { WorkerManifest } from "@kivro/contracts";
import { validateExecutionPreflight } from "@kivro/policy-engine";
import {
  JobProcessSupervisor,
  jobTimeoutPolicyFromManifest,
  validateSandboxForManifest,
} from "@kivro/sandbox";
import type {
  AgentRuntimeAdapter,
  CompatibilityReport,
  JobExecutionContext,
  JobExecutionResult,
  RuntimeDetection,
  RuntimeDiscovery,
  WorkerEnvironment,
  WorkerValidationReport,
} from "./types.js";
import { jobAttemptPaths } from "./job-paths.js";
import { writeMarketplaceWorkerEnvironment } from "./worker-environment.js";

const execFileAsync = promisify(execFile);

function resolveRuntimeRoot(): string {
  const configured = process.env.KIVRO_RUNTIME_ROOT ?? path.join(os.homedir(), ".kivro/runtime");
  return configured.startsWith("~")
    ? path.join(os.homedir(), configured.slice(1))
    : configured;
}

export class OpenClawCliAdapter implements AgentRuntimeAdapter {
  private readonly supervisors = new Map<string, JobProcessSupervisor>();

  constructor(
    private readonly binary = process.env.OPENCLAW_BIN ?? "openclaw",
    private readonly runtimeRoot = resolveRuntimeRoot(),
  ) {}

  private async run(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
    try {
      const { stdout, stderr } = await execFileAsync(this.binary, args, {
        timeout: 30_000,
        maxBuffer: 2 * 1024 * 1024,
      });
      return { stdout: stdout.toString(), stderr: stderr.toString(), code: 0 };
    } catch (err: unknown) {
      const e = err as { stdout?: Buffer; stderr?: Buffer; code?: number };
      return {
        stdout: e.stdout?.toString() ?? "",
        stderr: e.stderr?.toString() ?? "",
        code: typeof e.code === "number" ? e.code : 1,
      };
    }
  }

  async detect(): Promise<RuntimeDetection> {
    const version = await this.run(["--version"]);
    if (version.code !== 0) {
      return { installed: false };
    }
    const config = await this.run(["config", "file"]);
    return {
      installed: true,
      version: version.stdout.trim().split("\n")[0],
      configPath: config.code === 0 ? config.stdout.trim() : undefined,
    };
  }

  async discover(): Promise<RuntimeDiscovery> {
    const skills = await this.run(["skills", "list"]);
    const skillNames =
      skills.code === 0
        ? skills.stdout
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : [];
    const plugins = await this.run(["plugins", "list"]);
    const nativePlugins =
      plugins.code === 0
        ? plugins.stdout
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : [];
    const warnings: string[] =
      skills.code !== 0 ? ["Could not list skills; is OpenClaw configured?"] : [];
    if (nativePlugins.length > 0) {
      warnings.push(
        `Native plugins detected (${nativePlugins.length}); marketplace workers cannot import native plugins (§33).`,
      );
    }
    return {
      skills: skillNames,
      tools: [],
      nativePlugins,
      warnings,
    };
  }

  async validateCompatibility(): Promise<CompatibilityReport> {
    const detection = await this.detect();
    if (!detection.installed) {
      return { compatible: false, reasons: ["OpenClaw CLI not found on PATH"] };
    }
    return { compatible: true, reasons: [] };
  }

  buildWorkerEnvironment(manifest: WorkerManifest): Promise<WorkerEnvironment> {
    return Promise.resolve(writeMarketplaceWorkerEnvironment(this.runtimeRoot, manifest));
  }

  async validateWorkerEnvironment(env: WorkerEnvironment): Promise<WorkerValidationReport> {
    const detection = await this.detect();
    if (!detection.installed) {
      return { ok: false, sandboxMode: "unknown", issues: ["OpenClaw not installed"] };
    }
    const issues: string[] = [];
    try {
      const raw = fs.readFileSync(env.configPath, "utf8");
      const payload = JSON.parse(raw) as { sandbox?: { docker?: { network?: string } } };
      if (payload.sandbox?.docker?.network !== "none") {
        issues.push("marketplace config must keep docker network isolated");
      }
    } catch {
      issues.push("marketplace config missing or unreadable");
    }
    return {
      ok: issues.length === 0,
      sandboxMode: issues.length === 0 ? "all" : "unknown",
      issues,
    };
  }

  execute(context: JobExecutionContext): Promise<JobExecutionResult> {
    const sandbox = validateSandboxForManifest(context.manifest);
    if (!sandbox.ok) {
      return Promise.resolve({
        exitCode: 1,
        timedOut: false,
        metadata: { error: sandbox.issues.join("; ") },
      });
    }
    const preflight = validateExecutionPreflight(context.manifest);
    if (!preflight.ok) {
      return Promise.resolve({
        exitCode: 1,
        timedOut: false,
        metadata: { error: preflight.issues.join("; ") },
      });
    }
    const timeouts = jobTimeoutPolicyFromManifest(context.manifest);
    const supervisor = new JobProcessSupervisor(timeouts);
    const key = `${context.jobId}:${context.attemptId}`;
    this.supervisors.set(key, supervisor);
    supervisor.registerStart(context.jobId, context.attemptId);
    const paths = jobAttemptPaths(this.runtimeRoot, context.jobId, context.attemptId);
    const dryRun =
      process.env.KIVRO_SANDBOX_DRY_RUN === "true" ||
      process.env.KIVRO_EXECUTION_MODE === "preflight";
    const synthetic = process.env.KIVRO_EXECUTION_MODE === "synthetic";
    if (dryRun || synthetic) {
      return Promise.resolve({
        exitCode: 0,
        timedOut: false,
        metadata: {
          mode: synthetic ? "synthetic" : "preflight",
          executionTimeoutMs: String(timeouts.executionTimeoutMs),
          workDir: paths.work,
        },
      });
    }
    return Promise.resolve({
      exitCode: 1,
      timedOut: false,
      metadata: {
        error:
          "OpenClaw agent spawn requires OPENCLAW_BIN and runtime configuration; use KIVRO_EXECUTION_MODE=synthetic for dispatch/pause integration tests",
      },
    });
  }

  pause(jobId: string, attemptId: string): Promise<{ ok: boolean; state: string }> {
    const supervisor = this.supervisors.get(`${jobId}:${attemptId}`);
    if (!supervisor) {
      return Promise.resolve({ ok: false, state: "unknown" });
    }
    const updated = supervisor.requestPause(jobId, attemptId);
    if (!updated) {
      return Promise.resolve({ ok: false, state: supervisor.getAttempt(jobId, attemptId)?.state ?? "unknown" });
    }
    supervisor.confirmPaused(jobId, attemptId);
    return Promise.resolve({ ok: true, state: "paused" });
  }

  resume(jobId: string, attemptId: string): Promise<{ ok: boolean; state: string }> {
    const supervisor = this.supervisors.get(`${jobId}:${attemptId}`);
    if (!supervisor) {
      return Promise.resolve({ ok: false, state: "unknown" });
    }
    const updated = supervisor.resume(jobId, attemptId);
    return Promise.resolve({
      ok: Boolean(updated),
      state: supervisor.getAttempt(jobId, attemptId)?.state ?? "unknown",
    });
  }

  cancel(jobAttemptId: string): Promise<void> {
    for (const [key, supervisor] of this.supervisors.entries()) {
      if (!key.endsWith(`:${jobAttemptId}`)) {
        continue;
      }
      const jobId = key.slice(0, key.length - jobAttemptId.length - 1);
      supervisor.requestCancel(jobId, jobAttemptId);
      supervisor.markTerminated(jobId, jobAttemptId, false);
    }
    return Promise.resolve();
  }

  cleanup(jobAttemptId: string): Promise<void> {
    for (const key of [...this.supervisors.keys()]) {
      if (key.endsWith(`:${jobAttemptId}`)) {
        this.supervisors.delete(key);
      }
    }
    return Promise.resolve();
  }
}
