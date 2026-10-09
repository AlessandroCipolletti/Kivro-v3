# Security evidence matrix (M04)

| Threat | Control | Test | Evidence |
|--------|---------|------|----------|
| SSRF / metadata / private network | `@kivro/policy-engine` blocked hosts + egress ports | `packages/policy-engine/src/index.test.ts`, `security/tests/adversarial-m04.test.ts` | `pnpm verify:m04` |
| Unrestricted sandbox Internet | `@kivro/egress-proxy` ControlledEgressProxy | `packages/egress-proxy/src/controlled-egress.test.ts` | `pnpm verify:m04` |
| Seller baseline weakening | `@kivro/sandbox` merge rules | `packages/sandbox/src/merge.test.ts` | `pnpm verify:m04` |
| Undeclared tools/resources | policy preflight + publish gate | `packages/capability-publish/src/security-publish-gate.ts` | publish integration |
| §19 invariants regression | `runSecurityInvariantChecks` | `security/tests/invariants-19.test.ts` | `pnpm test` |
| Revoked worker / dispatch kill | `@kivro/platform-policy` | `security/tests/invariants-19.test.ts`, API admin routes | manual admin token test |
| Permission expansion without review | `diffWorkerManifestPermissions` | `packages/capability-publish/src/permission-diff.test.ts` | publish API |

Claims without a test or reproducible verification remain **incomplete**.
