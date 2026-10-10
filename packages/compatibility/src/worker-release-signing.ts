import { generateKeyPairSync, randomBytes, sign, verify } from "node:crypto";
import type { WorkerReleaseManifest } from "./types.js";

export function canonicalWorkerReleasePayload(manifest: WorkerReleaseManifest): string {
  return JSON.stringify({
    workerVersion: manifest.workerVersion,
    artifactSha256: manifest.artifactSha256,
    protocolMin: manifest.protocolMin,
    protocolMax: manifest.protocolMax,
    releasedAt: manifest.releasedAt,
    channel: manifest.channel,
  });
}

/** HARD-011 — sign Worker update metadata before installation. */
export function signWorkerReleaseManifest(
  manifest: WorkerReleaseManifest,
  privateKeyPem: string,
): string {
  const payload = Buffer.from(canonicalWorkerReleasePayload(manifest), "utf8");
  return sign(null, payload, privateKeyPem).toString("base64");
}

export function verifyWorkerReleaseManifest(
  manifest: WorkerReleaseManifest,
  signatureBase64: string,
  publicKeyPem: string,
): boolean {
  try {
    const payload = Buffer.from(canonicalWorkerReleasePayload(manifest), "utf8");
    return verify(null, payload, publicKeyPem, Buffer.from(signatureBase64, "base64"));
  } catch {
    return false;
  }
}

export function generateWorkerReleaseSigningKeyPair(): {
  publicKeyPem: string;
  privateKeyPem: string;
} {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return {
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
    privateKeyPem: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  };
}

export function demoWorkerReleaseManifest(): WorkerReleaseManifest {
  return {
    workerVersion: "0.0.0-m07",
    artifactSha256: randomBytes(32).toString("hex"),
    protocolMin: 1,
    protocolMax: 1,
    releasedAt: new Date(0).toISOString(),
    channel: "stable",
  };
}
