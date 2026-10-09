# Incident response (M04 baseline)

Minimum procedures per Master Spec §79.

## Compromised Worker release

1. Set global dispatch off (`KIVRO_GLOBAL_DISPATCH_ENABLED=false` or admin API in non-production).
2. Revoke affected worker devices via `POST /platform/admin/worker-devices/:id/revoke`.
3. Pause impacted capabilities (seller API).
4. Publish fixed worker package and require upgrade before re-enabling dispatch.

## Seller credential leak

1. Pause worker device / revoke if compromise is confirmed.
2. Rotate provider and private resource credentials outside the sandbox.
3. Inspect audit events for the seller profile.
4. Republish capability version only after security preflight passes.

## Malicious buyer

1. Suspend buyer account (admin tooling — post-MVP automation).
2. Cancel active jobs and preserve audit evidence.
3. Notify affected sellers; reconcile refunds per payment policy (M08).

## Marketplace compromise

1. Stop dispatch immediately.
2. Rotate cloud secrets and invalidate sessions.
3. Assess worker device credential exposure; seller local secrets must remain off-cloud.
