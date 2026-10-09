import type { WorkerManifest } from "@kivro/contracts";
import { MARKETPLACE_SANDBOX_BASELINE } from "./baseline.js";
import { mergeSandboxConfig } from "./merge.js";

export interface DockerSandboxSpec {
  image: string;
  args: string[];
  env: Record<string, string>;
  openClawSandbox: typeof MARKETPLACE_SANDBOX_BASELINE;
}

/** Build restrictive Docker invocation flags from marketplace baseline + manifest limits (§16, §21). */
export function buildDockerSandboxSpec(manifest: WorkerManifest): DockerSandboxSpec {
  const sandbox = mergeSandboxConfig();
  const image =
    process.env.KIVRO_SANDBOX_IMAGE?.trim() || "kivro/openclaw-sandbox:pin-me-before-prod";
  const memoryMb = Math.min(manifest.limits.memoryMb, 1024);
  const args = [
    "run",
    "--rm",
    "--network",
    sandbox.docker.network,
    "--read-only",
    "--pids-limit",
    String(Math.min(manifest.limits.maxPids, sandbox.docker.pidsLimit)),
    "--memory",
    `${memoryMb}m`,
    "--cpus",
    String(Math.min(manifest.limits.cpu, sandbox.docker.cpus)),
    "--cap-drop",
    "ALL",
  ];
  for (const mount of sandbox.docker.tmpfs) {
    args.push("--tmpfs", mount);
  }
  return {
    image,
    args,
    env: {
      KIVRO_SANDBOX_MODE: sandbox.mode,
      KIVRO_CAPABILITY_VERSION_ID: manifest.capabilityVersionId,
    },
    openClawSandbox: sandbox,
  };
}
