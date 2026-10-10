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

export interface LocalJobExecutionState {
  jobId: string;
  attemptId: string;
  status: "RUNNING" | "PAUSE_REQUESTED" | "PAUSED" | "RESUME_REQUESTED" | "CANCELLED";
  updatedAt: string;
  cloudSyncPending?: boolean;
}

export interface WorkerGlobalPauseState {
  active: boolean;
  pausedAt: string;
  source: "CLI" | "WEB_SYNC";
  reason?: string;
}

interface StoreFile {
  device: DeviceState | null;
  syncState: Record<string, string>;
  localJobs: Record<string, LocalJobExecutionState>;
  globalPause: WorkerGlobalPauseState | null;
  /** M25 staged Worker update state (validated by @kivro/compatibility on read). */
  stagedWorkerUpdate: Record<string, unknown> | null;
}

function readStore(statePath: string): StoreFile {
  if (!fs.existsSync(statePath)) {
    return { device: null, syncState: {}, localJobs: {}, globalPause: null, stagedWorkerUpdate: null };
  }
  const raw = fs.readFileSync(statePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<StoreFile>;
  return {
    device: parsed.device ?? null,
    syncState: parsed.syncState ?? {},
    localJobs: parsed.localJobs ?? {},
    globalPause: parsed.globalPause ?? null,
    stagedWorkerUpdate: parsed.stagedWorkerUpdate ?? null,
  };
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
    writeStore(statePath, {
      device: null,
      syncState: {},
      localJobs: {},
      globalPause: null,
      stagedWorkerUpdate: null,
    });
  }
  return { rootDir, statePath };
}

export function getWorkerGlobalPause(store: WorkerStoreHandle): WorkerGlobalPauseState | null {
  const file = readStore(store.statePath);
  return file.globalPause;
}

export function setWorkerGlobalPause(
  store: WorkerStoreHandle,
  pause: WorkerGlobalPauseState,
): void {
  const file = readStore(store.statePath);
  file.globalPause = pause;
  writeStore(store.statePath, file);
}

export function clearWorkerGlobalPause(store: WorkerStoreHandle): void {
  const file = readStore(store.statePath);
  file.globalPause = null;
  writeStore(store.statePath, file);
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

export function setLocalJobExecutionState(
  store: WorkerStoreHandle,
  state: LocalJobExecutionState,
): void {
  const file = readStore(store.statePath);
  file.localJobs[state.jobId] = state;
  writeStore(store.statePath, file);
}

export function getLocalJobExecutionState(
  store: WorkerStoreHandle,
  jobId: string,
): LocalJobExecutionState | null {
  const file = readStore(store.statePath);
  return file.localJobs[jobId] ?? null;
}

export function listLocalJobExecutionStates(store: WorkerStoreHandle): LocalJobExecutionState[] {
  const file = readStore(store.statePath);
  return Object.values(file.localJobs);
}

export function getStagedWorkerUpdate(store: WorkerStoreHandle): Record<string, unknown> | null {
  return readStore(store.statePath).stagedWorkerUpdate;
}

export function setStagedWorkerUpdate(
  store: WorkerStoreHandle,
  state: Record<string, unknown> | null,
): void {
  const file = readStore(store.statePath);
  file.stagedWorkerUpdate = state;
  writeStore(store.statePath, file);
}

export function setWorkerDeviceId(store: WorkerStoreHandle, workerDeviceId: string): void {
  const file = readStore(store.statePath);
  if (!file.device) {
    throw new Error("No device identity; call saveDeviceIdentity first");
  }
  file.device.workerDeviceId = workerDeviceId;
  writeStore(store.statePath, file);
}

export {
  listLocalCredentialRefs,
  readLocalCredentialSecret,
  setLocalCredentialSecret,
  type LocalCredentialRecord,
} from "./local-credentials.js";
