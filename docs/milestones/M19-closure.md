# M19 — milestone closure (unified backend & conformance)

Master Spec unified backend / `ARCH-UNI-001`–`024`, `PORT-019`–`030`, `spec/CONFORMANCE.md`.

## Shipped

- **`@kivro/cloud-core`** — composition types, infrastructure ports, **`buildWorkerServiceDiscoveryDocument`** (PORT-021)
- **`@kivro/contracts`** — **`WORKER_PROTOCOL_COMPATIBILITY_WINDOW`** (ARCH-UNI-024)
- **`@kivro/worker-transport`** — polling + WSS adapters; **retry/backoff** (PORT-025); **multi-transport session** (PORT-022/023/027/028); WSS reconnect policy helpers (PORT-026)
- **`@kivro/cloud-netsons`** / **`@kivro/cloud-aws`** — composition roots + default control-plane IDs
- **`apps/cloud-netsons`** / **`apps/cloud-aws`** — thin profile entrypoints (`start.mjs` → shared `@kivro/api`)
- **`apps/api`** — `KIVRO_CLOUD_PROFILE`; **`GET /worker/discovery`**; shared poll/heartbeat; **WSS upgrade** on `/worker/wss` + **`POST /worker/wss/dispatch`** shim
- **`apps/worker`** — transport client; optional **`KIVRO_DUAL_CONTROL_PLANE=1`** (ACTIVE WSS + DRAINING polling discovery)
- **Golden registry** — `M19-GOLD-004/005` dual-transport scenarios
- **Conformance** — `conformance-dual-transport-m19.test.ts`, `verify-both-composition-roots.mjs`
- **M19 acceptance** — shared durable-work behavior + transport parity on both roots (`conformance-both-roots-m19.test.ts`); drift canary (`architecture-uni-023-m19.test.ts`); CI profile matrix (`verify-m19-profiles`)
- **Release matrix** — `tests/fixtures/backend-conformance-manifest.json` via `write-conformance-manifest.mjs`
- Gate: **`pnpm verify:m19`**

## Bounded (M20/M21)

- **ARCH-UNI-018** — ACTIVE provider requires real-infra smoke + full staging E2E (not local-only)
- Production TLS termination / managed WSS at AWS edge (local upgrade proves frame handler)
- Real Netsons cron / AWS queue **`DurableWorkPort`** implementations
- Full staging ASYNC-GOLD matrix on both profiles
- Live dual-host cutover E2E (harness simulates ARCH-UNI-022 in CI)

## Gate

```bash
pnpm verify:m19
```
