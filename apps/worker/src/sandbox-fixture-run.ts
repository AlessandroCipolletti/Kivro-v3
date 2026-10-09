import { parseWorkerManifest } from "@kivro/contracts";
import { shouldFailClosedOnSandboxInit } from "@kivro/job-failure";
import { jobAttemptPaths } from "@kivro/openclaw-adapter";
import { isDockerAvailable, runDockerFixtureOutput } from "@kivro/sandbox";
import { randomUUID } from "node:crypto";

export type JobExecutionBundle = {
  jobId: string;
  structuredInput: Record<string, unknown>;
  workerManifest: unknown;
  sellerProfileId: string;
};

export type SandboxFixtureResult = {
  structuredOutput: { text: string };
  outputAssetManifest: {
    assets: Array<{
      id: string;
      filename: string;
      bucket: string;
      objectKey: string;
      mimeType: string;
      sizeBytes: number;
    }>;
  };
  correlationId: string;
  sandbox: { docker: true; image: string; openClawValidated?: boolean };
};

/** Run buyer job work inside a restricted Docker container (§558 / §573). */
export async function runSandboxFixtureExecution(input: {
  runtimeRoot: string;
  bundle: JobExecutionBundle;
  uploadDeliverable: (localPath: string, filename: string) => Promise<{
    assetId: string;
    bucket: string;
    objectKey: string;
    filename: string;
    sizeBytes: number;
  }>;
  openClawValidated?: boolean;
}): Promise<SandboxFixtureResult> {
  const attemptId = "1";
  const paths = jobAttemptPaths(input.runtimeRoot, input.bundle.jobId, attemptId);
  const dockerOk = isDockerAvailable();
  if (shouldFailClosedOnSandboxInit(dockerOk)) {
    throw new Error("SANDBOX_UNAVAILABLE");
  }

  const manifest = parseWorkerManifest(input.bundle.workerManifest);
  const question =
    typeof input.bundle.structuredInput.question === "string"
      ? input.bundle.structuredInput.question
      : JSON.stringify(input.bundle.structuredInput);
  const summary = `Sandbox fixture answer: ${question.slice(0, 500)}`;
  const correlationId = randomUUID();

  const { summaryPath, image } = runDockerFixtureOutput({
    manifest,
    outputDir: paths.output,
    summaryText: summary,
  });

  const uploaded = await input.uploadDeliverable(summaryPath, "summary.txt");

  return {
    structuredOutput: { text: summary },
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
    correlationId,
    sandbox: { docker: true, image, openClawValidated: input.openClawValidated },
  };
}
