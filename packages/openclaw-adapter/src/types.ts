import type { WorkerManifest } from "@kivro/contracts";

export interface RuntimeDetection {
  installed: boolean;
  version?: string;
  configPath?: string;
}

export interface RuntimeDiscovery {
  skills: string[];
  tools: string[];
  warnings: string[];
}

export interface CompatibilityReport {
  compatible: boolean;
  reasons: string[];
}

export interface WorkerEnvironment {
  configPath: string;
  workspaceRoot: string;
}

export interface WorkerValidationReport {
  ok: boolean;
  sandboxMode: "all" | "unknown";
  issues: string[];
}

export interface JobExecutionContext {
  jobId: string;
  attemptId: string;
  manifest: WorkerManifest;
  environment: WorkerEnvironment;
  inputDir: string;
  workDir: string;
  outputDir: string;
}

export interface JobExecutionResult {
  exitCode: number;
  timedOut: boolean;
  openClawVersion?: string;
  metadata: Record<string, string>;
}

export interface AgentRuntimeAdapter {
  detect(): Promise<RuntimeDetection>;
  discover(): Promise<RuntimeDiscovery>;
  validateCompatibility(): Promise<CompatibilityReport>;
  buildWorkerEnvironment(manifest: WorkerManifest): Promise<WorkerEnvironment>;
  validateWorkerEnvironment(env: WorkerEnvironment): Promise<WorkerValidationReport>;
  execute(context: JobExecutionContext): Promise<JobExecutionResult>;
  cancel(jobAttemptId: string): Promise<void>;
  cleanup(jobAttemptId: string): Promise<void>;
}
