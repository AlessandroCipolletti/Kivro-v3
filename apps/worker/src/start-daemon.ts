import { buildJobAcceptedMessage, buildWorkerHeartbeatBody } from "@kivro/job-protocol";
import { getDeviceIdentity, openWorkerStore } from "@kivro/worker-store";
import os from "node:os";
import path from "node:path";
import { resolveWorkerCloudRuntime } from "./worker-cloud-client.js";

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
  const cloudRuntime = await resolveWorkerCloudRuntime(workerIdentity);

  console.log(
    JSON.stringify({
      event: "worker_daemon_start",
      workerDeviceId: identity.workerDeviceId,
      cloudUrl: identity.cloudUrl,
      executionMode,
      workerTransportMode: cloudRuntime.mode,
      controlPlanes:
        cloudRuntime.mode === "dual"
          ? cloudRuntime.client.session.listBindings().map((b) => ({
              controlPlaneId: b.controlPlaneId,
              lifecycleState: b.lifecycleState,
              transport: b.transport.kind,
            }))
          : [{ transport: cloudRuntime.client.transport.kind }],
      pollMs,
    }),
  );

  const heartbeatBody = buildWorkerHeartbeatBody({
    workerVersion: "0.0.0-m19",
    dockerOk: true,
    sandboxOk:
      executionMode === "sandbox-fixture" ||
      executionMode !== "openclaw" ||
      process.env.KIVRO_SANDBOX_DRY_RUN === "false",
    openClawInstalled: executionMode === "openclaw",
    openClawCompatible: true,
    globalPauseActive: false,
  });

  while (true) {
    try {
      const pollResults: Array<{
        offers?: Array<{ jobId: string; workerId: string; capabilityVersionId: string }>;
      }> = [];

      if (cloudRuntime.mode === "dual") {
        const hbs = await cloudRuntime.client.sendHeartbeatOnAll(heartbeatBody);
        await Promise.all(hbs.map((r) => r.json().catch(() => undefined)));
        const polls = await cloudRuntime.client.sendPollOnAll();
        for (const pollRes of polls) {
          pollResults.push(
            (await pollRes.json()) as {
              offers?: Array<{ jobId: string; workerId: string; capabilityVersionId: string }>;
            },
          );
        }
      } else {
        const hb = await cloudRuntime.client.sendHeartbeat(heartbeatBody);
        await hb.json().catch(() => undefined);
        const pollRes = await cloudRuntime.client.sendPoll();
        pollResults.push(
          (await pollRes.json()) as {
            offers?: Array<{ jobId: string; workerId: string; capabilityVersionId: string }>;
          },
        );
      }

      const offers = pollResults.flatMap((p) => p.offers ?? []);
      const seenJobIds = new Set<string>();

      for (const offer of offers) {
        if (seenJobIds.has(offer.jobId)) {
          continue;
        }
        seenJobIds.add(offer.jobId);
        await workerFetch(workerIdentity, "/worker/jobs/accept", {
          method: "POST",
          body: JSON.stringify(
            buildJobAcceptedMessage({
              jobId: offer.jobId,
              workerDeviceId: workerIdentity.workerDeviceId,
            }),
          ),
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
