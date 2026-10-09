export { getObjectStorageConfig, type ObjectStorageConfig } from "./config.js";
export { probeObjectStorageHealth } from "./storage-health.js";
export {
  createObjectStorageClient,
  createPresignedUpload,
  requireObjectStorage,
  verifyUploadedObject,
  readObjectPrefix,
  createPresignedDownload,
  putObjectBytes,
} from "./object-storage.js";
