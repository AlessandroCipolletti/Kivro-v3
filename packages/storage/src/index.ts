export { getObjectStorageConfig, type ObjectStorageConfig } from "./config.js";
export {
  createObjectStorageClient,
  createPresignedUpload,
  requireObjectStorage,
  verifyUploadedObject,
  readObjectPrefix,
  createPresignedDownload,
} from "./object-storage.js";
