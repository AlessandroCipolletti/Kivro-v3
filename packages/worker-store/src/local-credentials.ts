import fs from "node:fs";
import path from "node:path";
import type { WorkerStoreHandle } from "./index.js";

export type LocalCredentialRecord = {
  refId: string;
  provider: string;
  configuredAt: string;
  lastVerifiedAt: string | null;
};

type CredentialFile = {
  credentials: Record<string, { provider: string; secretFile: string; lastVerifiedAt: string | null }>;
};

function credentialsPath(store: WorkerStoreHandle): string {
  return path.join(store.rootDir, "credentials");
}

function metaPath(store: WorkerStoreHandle): string {
  return path.join(store.rootDir, "credential-index.json");
}

function readIndex(store: WorkerStoreHandle): CredentialFile {
  const p = metaPath(store);
  if (!fs.existsSync(p)) {
    return { credentials: {} };
  }
  return JSON.parse(fs.readFileSync(p, "utf8")) as CredentialFile;
}

function writeIndex(store: WorkerStoreHandle, file: CredentialFile): void {
  fs.mkdirSync(credentialsPath(store), { recursive: true, mode: 0o700 });
  fs.writeFileSync(metaPath(store), `${JSON.stringify(file, null, 2)}\n`, { mode: 0o600 });
}

/** SELLERUX-009 — local secret storage; cloud never receives values. */
export function setLocalCredentialSecret(
  store: WorkerStoreHandle,
  input: { refId: string; provider: string; secret: string },
): LocalCredentialRecord {
  fs.mkdirSync(credentialsPath(store), { recursive: true, mode: 0o700 });
  const secretFile = path.join(credentialsPath(store), `${input.refId}.secret`);
  fs.writeFileSync(secretFile, input.secret, { mode: 0o600 });
  const now = new Date().toISOString();
  const file = readIndex(store);
  file.credentials[input.refId] = {
    provider: input.provider,
    secretFile,
    lastVerifiedAt: now,
  };
  writeIndex(store, file);
  return {
    refId: input.refId,
    provider: input.provider,
    configuredAt: now,
    lastVerifiedAt: now,
  };
}

export function listLocalCredentialRefs(store: WorkerStoreHandle): LocalCredentialRecord[] {
  const file = readIndex(store);
  return Object.entries(file.credentials).map(([refId, row]) => ({
    refId,
    provider: row.provider,
    configuredAt: row.lastVerifiedAt ?? new Date(0).toISOString(),
    lastVerifiedAt: row.lastVerifiedAt,
  }));
}

export function readLocalCredentialSecret(store: WorkerStoreHandle, refId: string): string | null {
  const file = readIndex(store);
  const row = file.credentials[refId];
  if (!row || !fs.existsSync(row.secretFile)) {
    return null;
  }
  return fs.readFileSync(row.secretFile, "utf8");
}
