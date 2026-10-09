import type { WorkerManifest } from "@kivro/contracts";
import { validateExecutionPreflight } from "@kivro/policy-engine";
import { validateSandboxForManifest } from "@kivro/sandbox";
import { writeMarketplaceWorkerEnvironment } from "./worker-environment.js";
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

/** Stub adapter — real OpenClaw CLI integration lands in M02. */
export class OpenClawAdapterStub implements AgentRuntimeAdapter {
  detect(): Promise<RuntimeDetection> {
    return Promise.resolve({ installed: false });
  }

  discover(): Promise<RuntimeDiscovery> {
    return Promise.resolve({
      skills: [],
      tools: [],
      warnings: ["OpenClaw adapter not configured"],
    });
  }

  validateCompatibility(): Promise<CompatibilityReport> {
    return Promise.resolve({ compatible: false, reasons: ["OpenClaw not detected"] });
  }

  buildWorkerEnvironment(manifest: WorkerManifest): Promise<WorkerEnvironment> {
    const root = process.env.KIVRO_RUNTIME_ROOT ?? "/tmp/kivro-stub-runtime";
    return Promise.resolve(writeMarketplaceWorkerEnvironment(root, manifest));
  }

  validateWorkerEnvironment(env: WorkerEnvironment): Promise<WorkerValidationReport> {
    return Promise.resolve({
      ok: Boolean(env.configPath),
      sandboxMode: env.configPath ? "all" : "unknown",
      issues: env.configPath ? [] : ["missing config path"],
    });
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
    return Promise.resolve({
      exitCode: 0,
      timedOut: false,
      metadata: { mode: "stub-preflight" },
    });
  }

  pause(_jobId: string, _attemptId: string): Promise<{ ok: boolean; state: string }> {
    return Promise.resolve({ ok: true, state: "paused" });
  }

  resume(_jobId: string, _attemptId: string): Promise<{ ok: boolean; state: string }> {
    return Promise.resolve({ ok: true, state: "running" });
  }

  cancel(_jobAttemptId: string): Promise<void> {
    return Promise.resolve();
  }

  cleanup(_jobAttemptId: string): Promise<void> {
    return Promise.resolve();
  }
}
