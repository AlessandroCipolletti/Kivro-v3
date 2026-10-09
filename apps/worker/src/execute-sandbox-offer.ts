import { getPrismaClient } from "@kivro/database";
import { uploadJobDeliverableFile } from "@kivro/job-delivery";
import { runSandboxFixtureExecution, type JobExecutionBundle } from "./sandbox-fixture-run.js";

async function workerFetch(
  identity: { cloudUrl: string; workerDeviceId: string },
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${identity.cloudUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-worker-device-id": identity.workerDeviceId,
      ...(init?.headers ?? {}),
    },
  });
}

export async function fetchJobExecutionBundle(
  identity: { cloudUrl: string; workerDeviceId: string },
  jobId: string,
): Promise<JobExecutionBundle> {
  const res = await workerFetch(identity, `/worker/jobs/${jobId}/execution-bundle`);
  const json = (await res.json()) as JobExecutionBundle & { error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? `BUNDLE_${res.status}`);
  }
  return json;
}

export async function completeJobWithDeliverables(
  identity: { cloudUrl: string; workerDeviceId: string },
  jobId: string,
  deliverables: { structuredOutput: unknown; outputAssetManifest: unknown },
  correlationId?: string,
): Promise<void> {
  const res = await workerFetch(identity, `/worker/jobs/${jobId}/complete`, {
    method: "POST",
    headers: correlationId ? { "x-correlation-id": correlationId } : {},
    body: JSON.stringify({
      ...deliverables,
      correlationId,
    }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(`COMPLETE_${res.status}:${JSON.stringify(json)}`);
  }
}

export async function runSandboxFixtureForJob(input: {
  runtimeRoot: string;
  identity: { cloudUrl: string; workerDeviceId: string };
  jobId: string;
}): Promise<{ correlationId: string }> {
  const bundle = await fetchJobExecutionBundle(input.identity, input.jobId);
  const prisma = getPrismaClient();
  const result = await runSandboxFixtureExecution({
    runtimeRoot: input.runtimeRoot,
    bundle,
    uploadDeliverable: (localPath, filename) =>
      uploadJobDeliverableFile(prisma, {
        jobId: input.jobId,
        sellerProfileId: bundle.sellerProfileId,
        localPath,
        filename,
        mimeType: "text/plain",
      }),
  });
  await completeJobWithDeliverables(
    input.identity,
    input.jobId,
    {
      structuredOutput: result.structuredOutput,
      outputAssetManifest: result.outputAssetManifest,
    },
    result.correlationId,
  );
  console.log(
    JSON.stringify({
      event: "job_completed_sandbox_fixture",
      jobId: input.jobId,
      correlationId: result.correlationId,
      sandbox: result.sandbox,
    }),
  );
  return { correlationId: result.correlationId };
}
