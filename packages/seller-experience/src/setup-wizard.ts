/** §27 — publish only after the seller setup checks pass. */

export type ResourceClass = "SAFE" | "REQUIRES_REVIEW" | "BLOCKED";

export type DiscoveredResource = {
  id: string;
  kind: string;
  selected: boolean;
};

export type SetupWizardInput = {
  nodeOk: boolean;
  openClawPresent: boolean;
  dockerPresent: boolean;
  osCompatible: boolean;
  openClawVersionSupported: boolean;
  scan: { version: string; skills: number; agents: number; plugins: number } | null;
  sourceSelected: boolean;
  resources: DiscoveredResource[];
  dedicatedCredentials: boolean;
  contract: {
    name: string;
    description: string;
    inputCount: number;
    hasOutput: boolean;
    priceCents: number;
    timeoutSeconds: number;
    hasExample: boolean;
  };
  securityPreviewShown: boolean;
  selfTestPassed: boolean;
  adversarialProbesBlocked: boolean;
};

export function classifyDiscoveredResource(kind: string): ResourceClass {
  if (kind === "credential" || kind === "shell" || kind === "browser" || kind === "secret") {
    return "BLOCKED";
  }
  if (kind === "database" || kind === "plugin" || kind === "file") {
    return "REQUIRES_REVIEW";
  }
  return "SAFE";
}

export function resourceStartsUnselected(kind: string): { category: ResourceClass; selected: false } {
  return { category: classifyDiscoveredResource(kind), selected: false };
}

export function evaluateSellerSetup(input: SetupWizardInput): {
  readyToPublish: boolean;
  blockedReasons: string[];
} {
  const blockedReasons: string[] = [];
  if (!input.nodeOk || !input.openClawPresent || !input.dockerPresent || !input.osCompatible || !input.openClawVersionSupported) {
    blockedReasons.push("install_checks");
  }
  if (!input.scan) {
    blockedReasons.push("scan");
  }
  if (!input.sourceSelected) {
    blockedReasons.push("source");
  }
  for (const resource of input.resources) {
    if (resource.selected && classifyDiscoveredResource(resource.kind) === "BLOCKED") {
      blockedReasons.push(`blocked_resource:${resource.id}`);
    }
  }
  if (!input.dedicatedCredentials) {
    blockedReasons.push("credentials");
  }
  const contract = input.contract;
  if (
    !contract.name ||
    !contract.description ||
    contract.inputCount < 1 ||
    !contract.hasOutput ||
    contract.priceCents <= 0 ||
    contract.timeoutSeconds <= 0 ||
    !contract.hasExample
  ) {
    blockedReasons.push("contract");
  }
  if (!input.securityPreviewShown) {
    blockedReasons.push("security_preview");
  }
  if (!input.selfTestPassed) {
    blockedReasons.push("self_test");
  }
  if (!input.adversarialProbesBlocked) {
    blockedReasons.push("adversarial");
  }
  return { readyToPublish: blockedReasons.length === 0, blockedReasons };
}
