import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { WorkerManifest } from "@kivro/contracts";
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

const execFileAsync = promisify(execFile);

export class OpenClawCliAdapter implements AgentRuntimeAdapter {
  constructor(private readonly binary = process.env.OPENCLAW_BIN ?? "openclaw") {}

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
    return {
      skills: skillNames,
      tools: [],
      warnings:
        skills.code !== 0 ? ["Could not list skills; is OpenClaw configured?"] : [],
    };
  }

  async validateCompatibility(): Promise<CompatibilityReport> {
    const detection = await this.detect();
    if (!detection.installed) {
      return { compatible: false, reasons: ["OpenClaw CLI not found on PATH"] };
    }
    return { compatible: true, reasons: [] };
  }

  async buildWorkerEnvironment(_manifest: WorkerManifest): Promise<WorkerEnvironment> {
    await Promise.resolve();
    throw new Error("buildWorkerEnvironment requires M03 capability manifest wiring");
  }

  async validateWorkerEnvironment(_env: WorkerEnvironment): Promise<WorkerValidationReport> {
    const detection = await this.detect();
    if (!detection.installed) {
      return { ok: false, sandboxMode: "unknown", issues: ["OpenClaw not installed"] };
    }
    return { ok: true, sandboxMode: "all", issues: [] };
  }

  async execute(_context: JobExecutionContext): Promise<JobExecutionResult> {
    await Promise.resolve();
    throw new Error("execute requires sandbox + agent exec wiring (M04+)");
  }

  async cancel(_jobAttemptId: string): Promise<void> {
    await Promise.resolve();
  }

  async cleanup(_jobAttemptId: string): Promise<void> {
    await Promise.resolve();
  }
}
