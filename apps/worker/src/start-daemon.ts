import { getDeviceIdentity, openWorkerStore } from "@kivro/worker-store";
import os from "node:os";
import path from "node:path";

function runtimeRoot(): string {
  const configured = process.env.KIVRO_RUNTIME_ROOT ?? "~/.kivro/runtime";
  return configured.startsWith("~")
    ? path.join(os.homedir(), configured.slice(1))
    : configured;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

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

/** Long-running poll loop for local dev (§556 / DEV-LOCAL-010). */
export async function runWorkerPollDaemon(): Promise<void> {
  const store = openWorkerStore(runtimeRoot());
  const identity = getDeviceIdentity(store);
  if (!identity?.workerDeviceId) {
    throw new Error("WORKER_NOT_PAIRED — run kivro-worker pair first");
  }
  const workerIdentity = {
    cloudUrl: identity.cloudUrl,
    workerDeviceId: identity.workerDeviceId,
  };
  const pollMs = Number(process.env.KIVRO_WORKER_POLL_MS ?? 3000);
  const executionMode = process.env.KIVRO_EXECUTION_MODE ?? "synthetic";

  console.log(
    JSON.stringify({
      event: "worker_daemon_start",
      workerDeviceId: identity.workerDeviceId,
      cloudUrl: identity.cloudUrl,
      executionMode,
      pollMs,
    }),
  );

  while (true) {
    try {
      const hb = await workerFetch(workerIdentity, "/worker/heartbeat", {
        method: "POST",
        body: JSON.stringify({
          workerVersion: "0.0.0-m18",
          dockerOk: true,
          sandboxOk:
            executionMode === "sandbox-fixture" ||
            executionMode !== "openclaw" ||
            process.env.KIVRO_SANDBOX_DRY_RUN === "false",
          openClawInstalled: executionMode === "openclaw",
          openClawCompatible: true,
          globalPauseActive: false,
        }),
      });
      await hb.json().catch(() => undefined);

      const pollRes = await workerFetch(workerIdentity, "/worker/poll", { method: "POST", body: "{}" });
      const poll = (await pollRes.json()) as {
        offers?: Array<{ jobId: string; workerId: string; capabilityVersionId: string }>;
      };

      for (const offer of poll.offers ?? []) {
        await workerFetch(workerIdentity, "/worker/jobs/accept", {
          method: "POST",
          body: JSON.stringify({
            type: "JOB_ACCEPTED",
            protocolVersion: 1,
            jobId: offer.jobId,
            workerDeviceId: workerIdentity.workerDeviceId,
            acceptedAt: new Date().toISOString(),
          }),
        });
        await workerFetch(workerIdentity, `/worker/jobs/${offer.jobId}/running`, { method: "POST" });
        if (executionMode === "synthetic") {
          await workerFetch(workerIdentity, `/worker/jobs/${offer.jobId}/complete`, { method: "POST" });
          console.log(JSON.stringify({ event: "job_completed_synthetic", jobId: offer.jobId }));
        } else if (executionMode === "sandbox-fixture") {
          const { runSandboxFixtureForJob } = await import("./execute-sandbox-offer.js");
          await runSandboxFixtureForJob({
            runtimeRoot: runtimeRoot(),
            identity: workerIdentity,
            jobId: offer.jobId,
          });
        } else if (executionMode === "openclaw") {
          const { runOpenClawSandboxForJob } = await import("./execute-openclaw-offer.js");
          await runOpenClawSandboxForJob({
            runtimeRoot: runtimeRoot(),
            identity: workerIdentity,
            jobId: offer.jobId,
          });
        }
      }
    } catch (err) {
      console.error(JSON.stringify({ event: "worker_daemon_error", message: String(err) }));
    }
    await sleep(pollMs);
  }
}
