# M32 closure — Seller onboarding, discovery & safe publication

## Preconditions

- M31 buyer history harness complete (`pnpm verify:m31`).
- Shared publish/consent primitives from M03/M05 remain regression-covered.

## Deliverables

- `@kivro/seller-experience` shared semantics (onboarding, readiness, preview, permissions, identity, doctor sanitization).
- Seller API routes (`apps/api/src/routes/seller-onboarding.ts`).
- Seller web flows: onboarding, capability wizard, schedule editor, identity settings.
- Local credential storage on Worker (`packages/worker-store/src/local-credentials.ts`).
- Schema migration `20260410190000_m32_seller_onboarding`.
- SELLERUX-GOLD-001..006, 012, 016..018 in golden registry + conformance tests.
- `pnpm verify:m32` CI gate.

## Exit

Run:

```bash
pnpm verify:m32
```

Manual UX: `docs/milestones/M32-manual-validation.md`.
