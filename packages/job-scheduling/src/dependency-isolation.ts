/** §355 — a failed dependency takes down only capabilities that declare it. */
export function availabilityAfterDependencyFailure(input: {
  capabilities: Array<{ id: string; dependencyIds: string[] }>;
  failedDependencyId: string;
}): Array<{ id: string; availability: "ONLINE" | "DEPENDENCY_FAILED" }> {
  return input.capabilities.map((capability) => ({
    id: capability.id,
    availability: capability.dependencyIds.includes(input.failedDependencyId)
      ? "DEPENDENCY_FAILED"
      : "ONLINE",
  }));
}
