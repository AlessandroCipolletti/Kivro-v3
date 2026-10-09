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
      const hb = await workerFetch(identity, "/worker/heartbeat", {
        method: "POST",
        body: JSON.stringify({
          workerVersion: "0.0.0-m18",
          dockerOk: true,
          sandboxOk: executionMode !== "openclaw" || process.env.KIVRO_SANDBOX_DRY_RUN === "false",
          openClawInstalled: false,
          openClawCompatible: true,
          globalPauseActive: false,
        }),
      });
      await hb.json().catch(() => undefined);

      const pollRes = await workerFetch(identity, "/worker/poll", { method: "POST", body: "{}" });
      const poll = (await pollRes.json()) as {
        offers?: Array<{ jobId: string; workerId: string; capabilityVersionId: string }>;
      };

      for (const offer of poll.offers ?? []) {
        await workerFetch(identity, "/worker/jobs/accept", {
          method: "POST",
          body: JSON.stringify({
            type: "JOB_ACCEPTED",
            protocolVersion: 1,
            jobId: offer.jobId,
            workerDeviceId: identity.workerDeviceId,
            acceptedAt: new Date().toISOString(),
          }),
        });
        await workerFetch(identity, `/worker/jobs/${offer.jobId}/running`, { method: "POST" });
        if (executionMode === "synthetic") {
          await workerFetch(identity, `/worker/jobs/${offer.jobId}/complete`, { method: "POST" });
          console.log(JSON.stringify({ event: "job_completed_synthetic", jobId: offer.jobId }));
        }
      }
    } catch (err) {
      console.error(JSON.stringify({ event: "worker_daemon_error", message: String(err) }));
    }
    await sleep(pollMs);
  }
}
