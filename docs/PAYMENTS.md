# Payments (M08)

MVP model: **prepaid marketplace credits** (USD, integer cents) with **delayed seller settlement** on successful delivery. Canonical tiers live in `@kivro/billing` (`MARKETPLACE_PRICE_TIERS`, Master Spec §282).

- Buyer balance: `GET /buyer/billing/balance`
- Dev credit grant: `POST /buyer/billing/credits/dev-grant` (requires `KIVRO_DEV_PAYMENT_SHORTCUTS`, non-production)
- Stripe Checkout: `POST /buyer/billing/credits/checkout` when `STRIPE_SECRET_KEY` is set
- Job submit + reserve + queue: `POST /buyer/jobs`
- Seller Connect: `POST /seller/billing/connect/onboard`
- Webhooks: `POST /webhooks/stripe`

- Job submit: `paymentMode: "credits"` (default) or `"card"` (Stripe PaymentIntent, manual capture §24.5)
- After card auth: `POST /buyer/jobs/:id/confirm-payment` (or webhook) before dispatch
- Buyer billing summary: `GET /buyer/billing/summary`
