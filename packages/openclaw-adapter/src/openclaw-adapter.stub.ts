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

  buildWorkerEnvironment(_manifest: WorkerManifest): Promise<WorkerEnvironment> {
    return Promise.reject(new Error("OpenClawAdapterStub: buildWorkerEnvironment not implemented"));
  }

  validateWorkerEnvironment(_env: WorkerEnvironment): Promise<WorkerValidationReport> {
    return Promise.resolve({ ok: false, sandboxMode: "unknown", issues: ["stub adapter"] });
  }

  execute(_context: JobExecutionContext): Promise<JobExecutionResult> {
    return Promise.reject(new Error("OpenClawAdapterStub: execute not implemented"));
  }

  cancel(_jobAttemptId: string): Promise<void> {
    return Promise.resolve();
  }

  cleanup(_jobAttemptId: string): Promise<void> {
    return Promise.resolve();
  }
}
