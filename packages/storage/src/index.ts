export { getObjectStorageConfig, type ObjectStorageConfig } from "./config.js";
export {
  createObjectStorageClient,
  createPresignedUpload,
  requireObjectStorage,
  verifyUploadedObject,
  readObjectPrefix,
} from "./object-storage.js";
