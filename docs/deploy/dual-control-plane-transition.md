# Dual control-plane transition (M22)

Operational guide for Netsons → AWS cutover without Worker re-pair (PORT-012..016, ARCH-UNI-017..022).

## Preconditions

- Both profiles pass `pnpm verify:m21` on the **same release**.
- Worker already paired once (`workerDeviceId` unchanged).
- PostgreSQL is the shared source of truth (one logical schema).

## States

| Env | Meaning |
|-----|---------|
| `KIVRO_NETSONS_CP_STATE` | `ACTIVE` / `DRAINING` / `RETIRED` |
| `KIVRO_AWS_CP_STATE` | `ACTIVE` / `DRAINING` / `RETIRED` |
| `KIVRO_DUAL_CONTROL_PLANE=1` | Worker maintains both transports during overlap |

Exactly **one** control plane must be `ACTIVE` for new job dispatch while in dual mode.

## Happy-path cutover

1. Netsons `ACTIVE`, AWS offline — executions bind `netsons-default`.
2. Deploy AWS profile; set Netsons `DRAINING`, AWS `ACTIVE`.
3. In-flight jobs keep `executionControlPlaneId=netsons-default` until complete.
4. New jobs bind `aws-default` and dispatch via WSS + durable worker signal.
5. When Netsons queue drains, set Netsons `RETIRED` — discovery drops polling transport.
6. Worker continues on AWS/WSS only; no reinstall.

## Rollback (before Netsons RETIRED)

Swap env: Netsons `ACTIVE`, AWS `DRAINING`. New dispatch binds Netsons again; AWS-owned in-flight jobs finish on AWS until terminal.

## Verification

- CI: `pnpm verify:m22`
- Admin: `GET /platform/admin/control-planes` (registry + `activeForNewExecutions`)
- Staging: run paid E2E on each profile, then dual-mode soak with `KIVRO_DUAL_CONTROL_PLANE=1`

## Failure scenarios (policy enforced in code)

- Cross control-plane accept/running → `CROSS_CONTROL_PLANE`
- Dispatch to DRAINING/RETIRED CP for **new** work → `CONTROL_PLANE_NOT_ACTIVE`
- Duplicate offers across polls → deduped by `jobId` on Worker
- **Stale discovery** — after Netsons `RETIRED`, refresh `/worker/discovery`; Worker fallback uses the same env rules and omits RETIRED planes
- **Endpoint rotation** — discovery `baseUrl` / `wssUrl` follow `KIVRO_CLOUD_URL` or request host; paired credentials unchanged (no re-pair)

## Optional staging smoke

```bash
KIVRO_M22_STAGING_URL=https://staging.example KIVRO_ADMIN_TOKEN=… node scripts/verify-m22-dual-staging.mjs
```

Also runs at the end of `pnpm verify:m22` (skipped when URL unset).
