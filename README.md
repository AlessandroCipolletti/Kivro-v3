# Kivro

Marketplace where an OpenClaw user publishes a capability they already use as a paid, constrained job. Buyers discover that capability, pay with marketplace credits, submit a structured job, and retrieve the result. The seller's personal OpenClaw environment stays private. Each job runs in a separate Worker, with an explicit input/output contract, permissions, and sandbox.

Authoritative product and technical spec: [`spec/MASTER-SPEC.md`](spec/MASTER-SPEC.md).

## What you can do

**Buyers** use the web app to search the marketplace, open a capability, submit a job, watch status, and download the durable result later. Credits are the MVP payment model. Email/password and Google sign-in are both supported. Unverified email accounts cannot take paid actions. Buyer API keys and outbound webhooks live under Settings.

**Sellers** pair a Worker, import a minimum OpenClaw capability, publish an immutable version, and assign one or more Workers. The seller dashboard covers onboarding, capability publish, worker assignment, operations, economics (pending / available / paid), notifications, and health. Earnings shown by the Worker are not the financial source of truth; the ledger is.

**The Worker** (`apps/worker`) runs on the seller's machine. It discovers OpenClaw in read-only mode, pairs outbound to Kivro Cloud, polls or holds a WebSocket to the control plane that owns each job, and executes inside the sandbox. Default local execution is `sandbox-fixture` (a restricted Docker container). A real OpenClaw spawn is opt-in.

## Layout

| Path | Role |
| --- | --- |
| `apps/web` | Next.js marketplace and seller/buyer UI (`:3000`) |
| `apps/api` | Hono HTTP API (`PORT`, default `:3001`) |
| `apps/worker` | Seller Worker CLI and poll/WSS daemon |
| `packages/*` | Shared domain, jobs, billing, auth, sandbox, protocol |
| `packages/cloud-netsons`, `packages/cloud-aws` | Deployment profiles. Same application behavior; different hosting adapters |
| `apps/cloud-netsons`, `apps/cloud-aws` | Composition roots for those profiles |
| `spec/` | Master Spec, requirements, implementation plan, coverage |

There is one backend. Netsons and AWS are infrastructure profiles, not two copies of the product. PostgreSQL is durable state. Redis is coordination only. Object storage (MinIO locally, S3 in cloud profiles) holds uploads and job deliverables.

## Prerequisites

- Node.js 20+
- pnpm 9 (`packageManager` is `pnpm@9.15.0`)
- Docker, for PostgreSQL, Redis, and MinIO

## Run it locally

```bash
pnpm install
cp .env.example .env
pnpm dev:all:demo
```

`dev:all:demo` starts Docker, applies migrations, creates the MinIO bucket, seeds two users, builds the API and Worker, and runs the web app, API, and Worker together. The Worker auto-pairs as `seller@kivro.local` unless `KIVRO_DEV_AUTO_PAIR=false`.

| Surface | URL |
| --- | --- |
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| API ready check | http://localhost:3001/health/ready |
| MinIO console | http://localhost:9001 (`kivro` / `kivrodevsecret`) |

Seeded accounts (password printed by the seed script; default `KivroDevPass123!`):

- Buyer: `buyer@kivro.local`
- Seller: `seller@kivro.local`

With `KIVRO_DEV_PAYMENT_SHORTCUTS=true` (the `.env.example` default), local credit grants and the fake payment adapter are available. Those flags are rejected outside development. Leave `STRIPE_SECRET_KEY` empty unless you are exercising Stripe test mode. Google sign-in needs `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`; the redirect URI must match `/api/users/auth/google/callback` on the API origin.

If port 3000 is taken, `dev:all` picks the next free port in 3001–3020 and prints it. Pin it with `WEB_DEV_PORT` and a matching `WEB_APP_URL`. Postgres is on host port **5433** and Redis on **6380** so they do not collide with other local instances.

Stop the app processes with Ctrl+C. Docker keeps running until `pnpm db:down`.

### Other local commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Infra, migrate, build API, then web + API. No Worker. |
| `pnpm dev:all` | Web + API + Worker, without the demo seed |
| `pnpm dev:setup` | Docker, migrations, MinIO bucket only |
| `pnpm dev:demo` | Setup plus buyer/seller seed |
| `pnpm worker:dev` | Build the Worker, auto-pair, and start the daemon |
| `pnpm dev:doctor` | Check Docker, Redis, sandbox, and OpenClaw bootstrap |
| `pnpm db:setup` | Postgres only: up, wait, migrate |

Full local contract: [`docs/DEV-LOCAL.md`](docs/DEV-LOCAL.md). Reset workflows: `node scripts/dev-reset.mjs stop|restart|storage|full`.

### Worker without the web stack

```bash
pnpm --filter @kivro/worker run build
node apps/worker/dist/cli.js doctor
node apps/worker/dist/cli.js commands
node apps/worker/dist/cli.js start
```

`start` polls `KIVRO_CLOUD_URL` (default `http://localhost:3001`). Useful commands include `pair`, `scan`, `manifest`, `health`, `pause`, `resume`, `stop`, and `job pause|resume|cancel`. Runtime files go under `KIVRO_RUNTIME_ROOT` (default `~/.kivro/runtime`).

For a real OpenClaw agent inside the sandbox, set `KIVRO_EXECUTION_MODE=openclaw`, `KIVRO_SANDBOX_DRY_RUN=false`, and install the pinned OpenClaw binary. The default `sandbox-fixture` mode is enough to exercise publish, dispatch, delivery, and settlement.

## Web map

| Route | Who |
| --- | --- |
| `/`, `/search`, `/capabilities/[slug]` | Marketplace |
| `/capabilities/[slug]/run`, `/jobs`, `/jobs/[id]` | Buyer jobs and results |
| `/agent` | Marketplace agent |
| `/login`, `/register`, `/verify-email` | Account |
| `/settings`, `/settings/api-keys`, `/settings/webhooks` | Buyer settings |
| `/seller/onboarding`, `/seller/capabilities/new` | Publish |
| `/seller/dashboard`, `/seller/workers`, `/seller/operations`, `/seller/economics` | Seller operations |

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Milestone gates chain. The current top of that chain is:

```bash
pnpm verify:m34
```

Local end-to-end (needs Docker; live HTTP checks need the API up):

```bash
pnpm test:m18:preflight
pnpm test:e2e:local
```

See [`docs/testing/M18-LOCAL-TEST-RUNBOOK.md`](docs/testing/M18-LOCAL-TEST-RUNBOOK.md) and [`docs/RELEASE-GATES.md`](docs/RELEASE-GATES.md).

## Deploy profiles

- **Netsons** — polling transport, bounded cron, no long-lived queue daemon on the host. [`docs/deploy/netsons/DEPLOYMENT-GUIDE.md`](docs/deploy/netsons/DEPLOYMENT-GUIDE.md)
- **AWS** — WebSocket transport metadata and the AWS composition root. [`docs/deploy/aws/DEPLOYMENT-GUIDE.md`](docs/deploy/aws/DEPLOYMENT-GUIDE.md)

A Worker paired to one control plane keeps executing jobs owned by that plane while another plane is active. Sellers do not reinstall or re-pair only because the cloud host changes.

## Further reading

- [`AGENTS.md`](AGENTS.md) — engineering contract for changes in this repo
- [`spec/IMPLEMENTATION-PLAN.md`](spec/IMPLEMENTATION-PLAN.md) — milestone sequence
- [`spec/COVERAGE.md`](spec/COVERAGE.md) — requirement evidence
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — shared backend and composition roots
- [`docs/PAYMENTS.md`](docs/PAYMENTS.md) — credits, Stripe, settlement
- [`docs/JOB_PROTOCOL.md`](docs/JOB_PROTOCOL.md) — Worker protocol
