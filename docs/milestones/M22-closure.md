# M22 closure — dual control-plane continuity

## Preconditions

- M19 transport + discovery (`pnpm verify:m19`)
- M21 AWS profile (`pnpm verify:m21`)

## Deliverables

- **`Job.executionControlPlaneId`** — immutable ownership (PORT-005)
- **`@kivro/cloud-core/control-plane-policy`** — ACTIVE selection, poll visibility, dual-mode registry
- **`@kivro/job-dispatch`** — dispatch stamps CP; accept guards cross-CP routing
- **`apps/api`** — poll/WSS frames scoped by control plane; admin `GET /platform/admin/control-planes`
- **Tests** — `conformance-dual-control-plane-m22.test.ts` (M22-GOLD-001/002)
- **Gate** — `pnpm verify:m22`

## Exit criteria

```bash
pnpm verify:m22
```

Full live dual-host transition E2E remains ops/staging (same class as M19 ARCH-UNI-018); CI proves routing policy and harness.

## Forbidden shortcuts absent

- No re-pair/reinstall requirement for CP flip (env-driven lifecycle + discovery)
- No cross-CP job offers (filtered poll + transport session guards)
