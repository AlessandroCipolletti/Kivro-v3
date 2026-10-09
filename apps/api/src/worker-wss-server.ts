import type { Server as HttpServer } from "node:http";
import { getPrismaClient } from "@kivro/database";
import { createWssWorkerTransport } from "@kivro/worker-transport";
import { WebSocketServer } from "ws";
import { handleWorkerTransportFrame } from "./services/worker-transport-frame-handler.js";

const WSS_PATH = "/worker/wss";

/** PORT-026 — authenticated WSS upgrade on the shared API host (dev/local; TLS terminates at edge in prod). */
export function attachWorkerWssServer(server: HttpServer): void {
  const wss = new WebSocketServer({ noServer: true });
  const decodeTransport = createWssWorkerTransport({
    controlPlaneId: "wss-decode",
    workerDeviceId: "decode",
    wssUrl: "wss://local",
  });

  server.on("upgrade", (req, socket, head) => {
    const url = req.url?.split("?")[0] ?? "";
    if (url !== WSS_PATH) {
      return;
    }
    const workerDeviceId = req.headers["x-worker-device-id"];
    if (typeof workerDeviceId !== "string" || !workerDeviceId.trim()) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.on("message", async (data) => {
        const encoded = typeof data === "string" ? data : data.toString("utf8");
        const prisma = getPrismaClient();
        const result = await handleWorkerTransportFrame(
          prisma,
          workerDeviceId,
          encoded,
          decodeTransport,
        );
        if ("json" in result) {
          ws.send(JSON.stringify(result.json));
        } else {
          ws.send(result.text);
        }
      });
    });
  });
}
