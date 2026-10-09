import { parseWorkerManifest } from "@kivro/contracts";
import { createOpenClawAdapter, jobAttemptPaths } from "@kivro/openclaw-adapter";
import fs from "node:fs";
import path from "node:path";
import {
  completeJobWithDeliverables,
  fetchJobExecutionBundle,
} from "./execute-sandbox-offer.js";
import { getPrismaClient } from "@kivro/database";
import { uploadJobDeliverableFile } from "@kivro/job-delivery";
import { randomUUID } from "node:crypto";

export async function runOpenClawSandboxForJob(input: {
  runtimeRoot: string;
  identity: { cloudUrl: string; workerDeviceId: string };
  jobId: string;
  controlPlaneId?: string;
}): Promise<{ correlationId: string }> {
  const bundle = await fetchJobExecutionBundle(
    input.identity,
    input.jobId,
    input.controlPlaneId,
  );
  const manifest = parseWorkerManifest(bundle.workerManifest);
  const adapter = await createOpenClawAdapter();
  const detection = await adapter.detect();
  if (!detection.installed) {
    throw new Error("OPENCLAW_NOT_INSTALLED");
  }
  const environment = await adapter.buildWorkerEnvironment(manifest);
  const paths = jobAttemptPaths(input.runtimeRoot, input.jobId, "1");
  fs.mkdirSync(paths.input, { recursive: true });
  fs.mkdirSync(paths.work, { recursive: true });
  fs.mkdirSync(paths.output, { recursive: true });
  const question =
    typeof bundle.structuredInput.question === "string"
      ? bundle.structuredInput.question
      : JSON.stringify(bundle.structuredInput);
  fs.writeFileSync(
    path.join(paths.input, "job-message.md"),
    `# Kivro job\n\nBuyer input:\n${question}\n\nDeliver summary.txt and result.json under output.\n`,
  );

  const result = await adapter.execute({
    jobId: input.jobId,
    attemptId: "1",
    manifest,
    environment,
    inputDir: paths.input,
    workDir: paths.work,
    outputDir: paths.output,
  });
  if (result.exitCode !== 0) {
    throw new Error(result.metadata.error ?? "OPENCLAW_EXECUTE_FAILED");
  }

  const summaryPath = path.join(paths.output, "summary.txt");
  if (!fs.existsSync(summaryPath)) {
    throw new Error("OPENCLAW_OUTPUT_MISSING");
  }
  const text = fs.readFileSync(summaryPath, "utf8");
  const prisma = getPrismaClient();
  const uploaded = await uploadJobDeliverableFile(prisma, {
    jobId: input.jobId,
    sellerProfileId: bundle.sellerProfileId,
    localPath: summaryPath,
    filename: "summary.txt",
    mimeType: "text/plain",
  });
  const correlationId = randomUUID();
  await completeJobWithDeliverables(
    input.identity,
    input.jobId,
    {
      structuredOutput: { text },
      outputAssetManifest: {
        assets: [
          {
            id: uploaded.assetId,
            filename: uploaded.filename,
            bucket: uploaded.bucket,
            objectKey: uploaded.objectKey,
            mimeType: "text/plain",
            sizeBytes: uploaded.sizeBytes,
          },
        ],
      },
    },
    correlationId,
    input.controlPlaneId,
  );
  console.log(
    JSON.stringify({
      event: "job_completed_openclaw_sandbox",
      jobId: input.jobId,
      correlationId,
      openClawVersion: result.openClawVersion,
    }),
  );
  return { correlationId };
}
