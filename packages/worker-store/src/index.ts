import fs from "node:fs";
import path from "node:path";

export interface WorkerStoreHandle {
  rootDir: string;
  statePath: string;
}

interface DeviceState {
  publicKeyPem: string;
  privateKeyPem: string;
  cloudUrl: string;
  workerDeviceId: string | null;
  createdAt: string;
}

interface StoreFile {
  device: DeviceState | null;
  syncState: Record<string, string>;
}

function readStore(statePath: string): StoreFile {
  if (!fs.existsSync(statePath)) {
    return { device: null, syncState: {} };
  }
  const raw = fs.readFileSync(statePath, "utf8");
  return JSON.parse(raw) as StoreFile;
}

function writeStore(statePath: string, store: StoreFile): void {
  fs.writeFileSync(statePath, `${JSON.stringify(store, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
}

/** Local worker identity store (JSON file under runtime root; no native deps). */
export function openWorkerStore(rootDir: string): WorkerStoreHandle {
  fs.mkdirSync(rootDir, { recursive: true, mode: 0o700 });
  const statePath = path.join(rootDir, "worker-state.json");
  if (!fs.existsSync(statePath)) {
    writeStore(statePath, { device: null, syncState: {} });
  }
  return { rootDir, statePath };
}

export function saveDeviceIdentity(
  store: WorkerStoreHandle,
  keys: { publicKeyPem: string; privateKeyPem: string; cloudUrl: string },
): void {
  const file = readStore(store.statePath);
  file.device = {
    publicKeyPem: keys.publicKeyPem,
    privateKeyPem: keys.privateKeyPem,
    cloudUrl: keys.cloudUrl,
    workerDeviceId: file.device?.workerDeviceId ?? null,
    createdAt: new Date().toISOString(),
  };
  writeStore(store.statePath, file);
}

export function getDeviceIdentity(store: WorkerStoreHandle): {
  publicKeyPem: string;
  privateKeyPem: string;
  cloudUrl: string;
  workerDeviceId: string | null;
} | null {
  const file = readStore(store.statePath);
  if (!file.device) {
    return null;
  }
  return {
    publicKeyPem: file.device.publicKeyPem,
    privateKeyPem: file.device.privateKeyPem,
    cloudUrl: file.device.cloudUrl,
    workerDeviceId: file.device.workerDeviceId,
  };
}

export function setWorkerDeviceId(store: WorkerStoreHandle, workerDeviceId: string): void {
  const file = readStore(store.statePath);
  if (!file.device) {
    throw new Error("No device identity; call saveDeviceIdentity first");
  }
  file.device.workerDeviceId = workerDeviceId;
  writeStore(store.statePath, file);
}
