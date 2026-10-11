import net from "node:net";

function resolvePort() {
  if (process.env.PGPORT?.trim()) return Number(process.env.PGPORT.trim());
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    try {
      const parsed = new URL(databaseUrl);
      if (parsed.port) return Number(parsed.port);
    } catch {
      // DATABASE_URL is not a URL; use the Kivro host default below.
    }
  }
  return 5434;
}

const host = process.env.PGHOST ?? "127.0.0.1";
const port = resolvePort();
const deadline = Date.now() + 60_000;

function tryConnect() {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", reject);
    socket.setTimeout(2000, () => {
      socket.destroy();
      reject(new Error("timeout"));
    });
  });
}

while (Date.now() < deadline) {
  try {
    await tryConnect();
    console.log(`PostgreSQL accepting connections on ${host}:${port}`);
    process.exit(0);
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
  }
}

console.error(`Timed out waiting for PostgreSQL on ${host}:${port}`);
process.exit(1);
