import { buildJobAcceptedMessage, buildWorkerHeartbeatBody } from "@kivro/job-protocol";
import { getDeviceIdentity, openWorkerStore } from "@kivro/worker-store";
import os from "node:os";
import path from "node:path";
import { dedupePollOffersByJobId } from "@kivro/cloud-core";
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
  init?: RequestInit & { controlPlaneId?: string },
): Promise<Response> {
  const { controlPlaneId, ...rest } = init ?? {};
  return fetch(`${identity.cloudUrl}${path}`, {
    ...rest,
    headers: {
      "content-type": "application/json",
      "x-worker-device-id": identity.workerDeviceId,
      ...(controlPlaneId ? { "x-kivro-control-plane-id": controlPlaneId } : {}),
      ...(rest.headers ?? {}),
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
      type TaggedOffer = {
        jobId: string;
        workerId: string;
        capabilityVersionId: string;
        controlPlaneId?: string;
      };
      const taggedOffers: TaggedOffer[] = [];

      if (cloudRuntime.mode === "dual") {
        const hbs = await cloudRuntime.client.sendHeartbeatOnAll(heartbeatBody);
        await Promise.all(hbs.map((r) => r.json().catch(() => undefined)));
        for (const binding of cloudRuntime.client.session.listBindings()) {
          const pollRes = await cloudRuntime.client.sendPollOn(binding.controlPlaneId);
          const poll = (await pollRes.json()) as {
            offers?: Array<{ jobId: string; workerId: string; capabilityVersionId: string }>;
          };
          for (const offer of poll.offers ?? []) {
            taggedOffers.push({ ...offer, controlPlaneId: binding.controlPlaneId });
          }
        }
      } else {
        const hb = await cloudRuntime.client.sendHeartbeat(heartbeatBody);
        await hb.json().catch(() => undefined);
        const pollRes = await cloudRuntime.client.sendPoll();
        const poll = (await pollRes.json()) as {
          offers?: Array<{ jobId: string; workerId: string; capabilityVersionId: string }>;
        };
        for (const offer of poll.offers ?? []) {
          taggedOffers.push(offer);
        }
      }

      const offers = dedupePollOffersByJobId(taggedOffers);

      for (const offer of offers) {
        await workerFetch(workerIdentity, "/worker/jobs/accept", {
          method: "POST",
          controlPlaneId: offer.controlPlaneId,
          body: JSON.stringify(
            buildJobAcceptedMessage({
              jobId: offer.jobId,
              workerDeviceId: workerIdentity.workerDeviceId,
            }),
          ),
        });
        await workerFetch(workerIdentity, `/worker/jobs/${offer.jobId}/running`, {
          method: "POST",
          controlPlaneId: offer.controlPlaneId,
        });
        if (executionMode === "synthetic") {
          await workerFetch(workerIdentity, `/worker/jobs/${offer.jobId}/complete`, {
            method: "POST",
            controlPlaneId: offer.controlPlaneId,
          });
          console.log(JSON.stringify({ event: "job_completed_synthetic", jobId: offer.jobId }));
        } else if (executionMode === "sandbox-fixture") {
          const { runSandboxFixtureForJob } = await import("./execute-sandbox-offer.js");
          await runSandboxFixtureForJob({
            runtimeRoot: runtimeRoot(),
            identity: workerIdentity,
            jobId: offer.jobId,
            controlPlaneId: offer.controlPlaneId,
          });
        } else if (executionMode === "openclaw") {
          const { runOpenClawSandboxForJob } = await import("./execute-openclaw-offer.js");
          await runOpenClawSandboxForJob({
            runtimeRoot: runtimeRoot(),
            identity: workerIdentity,
            jobId: offer.jobId,
            controlPlaneId: offer.controlPlaneId,
          });
        }
      }
    } catch (err) {
      console.error(JSON.stringify({ event: "worker_daemon_error", message: String(err) }));
    }
    await sleep(pollMs);
  }
}
