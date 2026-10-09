# M19 — milestone closure (unified backend & conformance)

Master Spec unified backend / `ARCH-UNI-001`–`024`, `PORT-019`–`030`, `spec/CONFORMANCE.md`.

## Shipped

- **`@kivro/cloud-core`** — shared composition types, infrastructure ports, API contract version, parity assertion
- **`@kivro/worker-transport`** — polling (Netsons) and WSS (AWS) adapters on one Worker Protocol envelope
- **`@kivro/cloud-netsons`** / **`@kivro/cloud-aws`** — thin composition roots (`createNetsonsComposition`, `createAwsComposition`)
- **`apps/api`** — runtime profile via `KIVRO_CLOUD_PROFILE` (`netsons` default, `aws` for WSS transport metadata)
- **Conformance** — `scripts/run-backend-conformance.mjs`, drift canary in `worker-transport` tests
- Gate: **`pnpm verify:m19`** (includes `verify:m18` regression)

## Bounded (M20/M21)

- Real Netsons/AWS deploy packaging, managed queue/cron wiring, live WSS endpoint on API
- Full ASYNC-GOLD / BUYERUX-GOLD matrix against both profiles in staging
- Dual control-plane production cutover E2E

## Gate

```bash
pnpm verify:m19
```
