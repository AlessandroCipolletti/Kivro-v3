export {
  KIVRO_COMPATIBILITY_MATRIX,
  parseCompatibilityMatrix,
} from "./matrix.js";
export type {
  KivroCompatibilityMatrix,
  SchemaRolloutPhase,
  SchemaRolloutRegistry,
  UnifiedReleaseManifest,
  WorkerReleaseManifest,
} from "./types.js";
export {
  compareWorkerVersions,
  evaluateWorkerVersion,
  resolveWorkerVersionPolicy,
} from "./worker-policy.js";
export type { WorkerVersionEvaluation } from "./worker-policy.js";
export { evaluateCloudWorkerHandshake } from "./cloud-handshake.js";
export type { CloudWorkerHandshakeResult } from "./cloud-handshake.js";
export {
  assertRolloutSafeDuringControlPlaneOverlap,
  nextRolloutPhase,
  parseSchemaRolloutRegistry,
  phaseIndex,
  protocolVersionsCompatibleDuringOverlap,
  validateBackfillIdempotencyDeclarations,
  validateRolloutRegistryCoversDisk,
} from "./schema-rollout.js";
export { isOpenClawVersionSupported } from "./openclaw-range.js";
export {
  buildUnifiedReleaseManifest,
  validateUnifiedReleaseManifest,
} from "./release-manifest.js";
export {
  beginStagedWorkerUpdate,
  completeRollback,
  promoteStagedWorkerToStaging,
  recordStagingHealthCheck,
  rollbackStagedWorkerUpdate,
} from "./staged-worker-update.js";
export type { StagedWorkerUpdateState } from "./staged-worker-update.js";
export { parseStagedWorkerUpdateState } from "./staged-worker-update-parse.js";
export {
  canonicalWorkerReleasePayload,
  demoWorkerReleaseManifest,
  generateWorkerReleaseSigningKeyPair,
  signWorkerReleaseManifest,
  verifyWorkerReleaseManifest,
} from "./worker-release-signing.js";
export { backendTransitionRequiresWorkerBinaryUpdate } from "./backend-transition.js";
