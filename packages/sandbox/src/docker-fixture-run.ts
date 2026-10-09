import type { WorkerManifest } from "@kivro/contracts";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { buildDockerSandboxSpec } from "./docker-spec.js";

export function isDockerAvailable(): boolean {
  return spawnSync("docker", ["info"], { stdio: "ignore" }).status === 0;
}

/** Restricted Docker run producing summary.txt under outputDir (§558 — not host execution). */
export function runDockerFixtureOutput(input: {
  manifest: WorkerManifest;
  outputDir: string;
  summaryText: string;
  fixtureImage?: string;
}): { summaryPath: string; image: string } {
  fs.mkdirSync(input.outputDir, { recursive: true });
  const spec = buildDockerSandboxSpec(input.manifest);
  const image =
    input.fixtureImage?.trim() ||
    process.env.KIVRO_SANDBOX_FIXTURE_IMAGE?.trim() ||
    "docker.io/library/alpine:3.20";
  const escaped = input.summaryText.replace(/'/g, `'\\''`);
  const args = [
    ...spec.args,
    "-v",
    `${path.resolve(input.outputDir)}:/job/output:rw`,
    image,
    "sh",
    "-c",
    `echo '${escaped}' > /job/output/summary.txt && echo ok > /job/output/.sandbox-complete`,
  ];
  const run = spawnSync("docker", args, { encoding: "utf8" });
  if (run.status !== 0) {
    throw new Error(`SANDBOX_RUN_FAILED:${run.stderr || run.stdout}`);
  }
  const summaryPath = path.join(input.outputDir, "summary.txt");
  if (!fs.existsSync(summaryPath)) {
    throw new Error("SANDBOX_OUTPUT_MISSING");
  }
  return { summaryPath, image };
}
