export type SchemaRolloutPhase = "expand" | "deploy" | "contract";

export type KivroCompatibilityMatrix = {
  version: number;
  description: string;
  cloudReleaseChannel: string;
  apiContractVersion: string;
  capabilityManifestSchemaVersion: number;
  workerProtocolMin: number;
  workerProtocolMax: number;
  database: {
    schemaPackage: string;
    schemaRevision: string;
    migrationsRelativePath: string;
    rolloutRegistryPath: string;
  };
  workerRelease: {
    channel: string;
    minSupportedWorkerVersion: string;
    latestSupportedWorkerVersion: string;
    revokedWorkerVersions: string[];
  };
  openClawAdapter: {
    minInclusive: string;
    maxExclusive: string;
  };
  controlPlaneOverlap: {
    allowedDuringBackendTransition: boolean;
    requiresProtocolWithinWindow: boolean;
  };
  contractsPackage: string;
};

export type SchemaRolloutRegistry = {
  description: string;
  activeRolloutPhase: SchemaRolloutPhase;
  migrations: Array<{
    folder: string;
    phase: SchemaRolloutPhase;
    notes?: string;
    backfillIdempotent?: boolean;
  }>;
};

export type UnifiedReleaseManifest = {
  generatedAt: string;
  gitCommit: string | null;
  cloudReleaseChannel: string;
  apiContractVersion: string;
  workerProtocolMin: number;
  workerProtocolMax: number;
  capabilityManifestSchemaVersion: number;
  databaseSchemaRevision: string;
  schemaRolloutPhase: SchemaRolloutPhase;
  workerReleaseChannel: string;
  workerMinSupportedVersion: string;
  workerLatestSupportedVersion: string;
  adapterProfiles: {
    netsons: { revision: string };
    aws: { revision: string };
  };
  parityReportPath: string;
  conformanceManifestPath: string;
};

export type WorkerReleaseManifest = {
  workerVersion: string;
  artifactSha256: string;
  protocolMin: number;
  protocolMax: number;
  releasedAt: string;
  channel: string;
};
