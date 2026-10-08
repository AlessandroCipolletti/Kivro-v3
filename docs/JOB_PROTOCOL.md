# Job protocol

Worker ↔ cloud messages are versioned in `packages/contracts` and `packages/job-protocol`.
Reject unknown `protocolVersion` values at trust boundaries (Master Spec §53).
