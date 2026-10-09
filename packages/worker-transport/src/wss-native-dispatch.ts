import WebSocket from "ws";
import { runWithWssReconnect } from "./wss-reconnect.js";

/** PORT-026 — one-shot WSS request/response over authenticated upgrade path. */
export async function dispatchWssNativeFrame(input: {
  wssUrl: string;
  workerDeviceId: string;
  encoded: string;
}): Promise<Response> {
  return runWithWssReconnect(async () => {
    return new Promise<Response>((resolve, reject) => {
      const ws = new WebSocket(input.wssUrl, {
        headers: { "x-worker-device-id": input.workerDeviceId },
      });
      const fail = (err: unknown) => {
        try {
          ws.close();
        } catch {
          /* ignore */
        }
        reject(err instanceof Error ? err : new Error(String(err)));
      };
      ws.on("open", () => ws.send(input.encoded));
      ws.on("message", (data) => {
        const text = typeof data === "string" ? data : data.toString("utf8");
        ws.close();
        resolve(
          new Response(text, {
            status: 200,
            headers: { "content-type": "application/json; charset=utf-8" },
          }),
        );
      });
      ws.on("error", fail);
      ws.on("close", () => {
        /* message handler resolves */
      });
    });
  });
}
