import { describe, expect, it, vi } from "vitest";
import { createPollingWorkerTransport } from "./polling-adapter.js";
import { createWorkerCloudClient } from "./http-client.js";

describe("WorkerCloudClient control-plane header (M22)", () => {
  it("sends x-kivro-control-plane-id on poll", async () => {
    let capturedInit: RequestInit | undefined;
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      capturedInit = init;
      return new Response("{}");
    });
    vi.stubGlobal("fetch", fetchMock);
    const transport = createPollingWorkerTransport({
      controlPlaneId: "netsons-default",
      workerDeviceId: "wd-test",
      cloudBaseUrl: "http://localhost:3001",
    });
    const client = createWorkerCloudClient({
      transport,
      cloudBaseUrl: "http://localhost:3001",
      workerDeviceId: "wd-test",
    });
    await client.sendPoll();
    expect(fetchMock).toHaveBeenCalled();
    expect(capturedInit).toBeDefined();
    expect((capturedInit!.headers as Record<string, string>)["x-kivro-control-plane-id"]).toBe(
      "netsons-default",
    );
    vi.unstubAllGlobals();
  });

  it("M25-GOLD-006 sends x-kivro-protocol-version when configured", async () => {
    let capturedInit: RequestInit | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        capturedInit = init;
        return new Response("{}");
      }),
    );
    const transport = createPollingWorkerTransport({
      controlPlaneId: "netsons-default",
      workerDeviceId: "wd-test",
      cloudBaseUrl: "http://localhost:3001",
    });
    const client = createWorkerCloudClient({
      transport,
      cloudBaseUrl: "http://localhost:3001",
      workerDeviceId: "wd-test",
      protocolVersion: 1,
    });
    await client.sendPoll();
    expect((capturedInit!.headers as Record<string, string>)["x-kivro-protocol-version"]).toBe("1");
    vi.unstubAllGlobals();
  });
});
