# M33 closure — Seller operations, economics & reliability

## Preconditions

- M32 seller onboarding harness complete (`pnpm verify:m32`).
- Shared job scheduling and billing primitives remain regression-covered.

## Deliverables

- `@kivro/seller-experience` operations modules (execution privacy, economics, analytics, rollback, maintenance, notifications).
- Concurrency and maintenance gates in `@kivro/job-scheduling`.
- Seller API routes (`apps/api/src/routes/seller-operations.ts`) and job execution view on seller jobs API.
- Seller web: operations hub, economics, capacity, notifications, job detail.
- Schema migration `20260410200000_m33_seller_operations`.
- SELLERUX-GOLD-007..011, 013..015 in golden registry + conformance tests.
- `pnpm verify:m33` CI gate.

## Exit

Run:

```bash
pnpm verify:m33
```

Manual UX: `docs/milestones/M33-manual-validation.md`.
