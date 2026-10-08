import net from "node:net";

const host = process.env.PGHOST ?? "127.0.0.1";
const port = Number(process.env.PGPORT ?? "5433");
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
