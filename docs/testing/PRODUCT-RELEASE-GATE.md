# Product release gate (Master Spec §92)

MVP is **not** complete until a real paid path runs between **two distinct users** with:

- Real seller OpenClaw + host Worker
- Published capability
- Stripe test-mode payment (not dev fake adapter alone)
- Sandbox execution (never host fallback)
- Text + generated file delivery
- Exactly-once settlement

## Automated composition (M16)

`pnpm verify:m16` — fixture catalog, API contract smoke, integration matrix script presence, security gate evidence, happy/failure trace files.

## Staging acceptance (required for MVP sign-off)

Follow `docs/MVP-SUCCESS-CHECKLIST.md` and record results in `docs/PRODUCT-VALIDATION.md`.

## Local E2E command

`pnpm test:e2e:local` — release-gate smoke (M16). Full §573 two-user Docker + OpenClaw path ships in **M18** (`spec/IMPLEMENTATION-PLAN.md`).

Mocks are acceptable during development; **final** acceptance must use provider test/sandbox + real OpenClaw where available (§92).
