# M08 — Payments manual validation

## Preconditions

- `pnpm db:setup` and `pnpm storage:setup` as needed for prior milestones.
- `.env` includes `KIVRO_DEV_PAYMENT_SHORTCUTS=true` for local publish/payout bypass.
- API built: `pnpm --filter @kivro/api build`.

## Buyer credits and job submit

1. Register/login buyer with verified email.
2. `POST /buyer/billing/credits/dev-grant` `{ "amountCents": 5000 }` → balance increases.
3. `GET /buyer/billing/balance` → `availableCents` reflects grant minus reservations.
4. `GET /buyer/price-tiers` → canonical USD tiers (buyer-facing prices only).
5. `POST /buyer/jobs` with `paymentMode: "credits"` → `201`, status `QUEUED`, credits reserved.
6. `POST /buyer/jobs` with `paymentMode: "card"` (Stripe test key) → `clientSecret`, then after auth `POST /buyer/jobs/:id/confirm-payment` → `QUEUED`.
7. `GET /buyer/billing/summary` → balance + recent ledger transactions.
8. `GET /buyer/billing/pricing-principle/USD_999` → §298 buyer/seller copy.

## Seller Connect (Stripe test mode)

1. Set `STRIPE_SECRET_KEY` (test) and restart API.
2. `GET /seller/billing/connect-status` → status when not onboarded.
3. `POST /seller/billing/connect/onboard` → Stripe Express onboarding URL.
4. After onboarding webhook/account update in staging, `canReceivePaidJobs` true without dev shortcuts.

## Dispatch and settlement

1. Job in `QUEUED` with `reservedAmountCents` set: worker dispatch succeeds.
2. Job without reservation: dispatch returns `PAYMENT_NOT_SECURED`.
3. Worker `POST /worker/jobs/:id/complete` after `RUNNING` → `COMPLETED`, ledger capture + seller earning rows.
4. Seller cancel on queued job → credits released via `JOB_RELEASE`.

## Stripe webhook

1. `POST /webhooks/stripe` with valid signature → idempotent `checkout.session.completed` grants credits.
2. `account.updated` refreshes seller Connect fields on `SellerProfile`.

## Saved payment method (§24.6)

1. With Stripe configured: `POST /buyer/billing/payment-method/setup-intent` → `clientSecret` for Payment Element.

## Admin reconciliation

1. `POST /platform/admin/payments/sweep-stale-reservations` with admin token → releases orphaned reservations.
2. `POST /platform/admin/payments/sweep-pending-transfers` → retries Connect transfers.

## Worker reject + refund

1. `POST /worker/jobs/reject` on a `DISPATCHED` offer → `REJECTED` and buyer credits released (`REFUNDED` when applicable).
