#!/usr/bin/env node
const endpoint = process.env.S3_ENDPOINT ?? "http://localhost:9002";
const deadline = Date.now() + 60_000;

while (Date.now() < deadline) {
  try {
    const res = await fetch(`${endpoint}/minio/health/live`);
    if (res.ok) {
      console.log("MinIO reachable");
      process.exit(0);
    }
  } catch {
    /* retry */
  }
  await new Promise((r) => setTimeout(r, 500));
}
console.error("MinIO not reachable");
process.exit(1);
