#!/usr/bin/env node
import net from "node:net";

const url = process.env.REDIS_URL ?? "redis://localhost:6381";
const { hostname, port } = new URL(url);
const host = hostname === "localhost" ? "127.0.0.1" : hostname;
const p = Number(port || 6379);

const deadline = Date.now() + 60_000;
while (Date.now() < deadline) {
  const ok = await new Promise((resolve) => {
    const s = net.createConnection({ host, port: p }, () => {
      s.end();
      resolve(true);
    });
    s.on("error", () => resolve(false));
  });
  if (ok) {
    console.log("Redis reachable");
    process.exit(0);
  }
  await new Promise((r) => setTimeout(r, 500));
}
console.error("Redis not reachable");
process.exit(1);
