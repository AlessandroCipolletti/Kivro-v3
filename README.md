# Kivro

OpenClaw capability marketplace — greenfield implementation.

- **Spec:** `spec/MASTER-SPEC.md` (authoritative)
- **Sequencing:** `spec/IMPLEMENTATION-PLAN.md`
- **Agent contract:** `AGENTS.md`

## M00 bootstrap

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Local dev (browser + API)

```bash
cp .env.example .env   # first time only
pnpm install
pnpm dev               # Docker Postgres + MinIO, migrate, build API, :3001 + :3000
```

Open http://localhost:3000 (marketplace). API health: http://localhost:3001/health/ready

Infra only (no app processes):

```bash
pnpm dev:setup         # same as db:setup + MinIO bucket
```

Legacy step-by-step:

```bash
pnpm db:setup
pnpm --filter @kivro/api run build && pnpm --filter @kivro/api run dev
pnpm --filter @kivro/web dev
```

Worker CLI:

```bash
node apps/worker/dist/cli.js doctor
```

Manual milestone validation: `docs/milestones/M00-manual-validation.md`.

## Release gates (M16)

```bash
pnpm verify:m16      # fixtures, traces, integration matrix, §91 evidence
pnpm test:e2e:local  # composed M16 gate (full §573 path → M18)
```

Authoritative objective: `spec/MASTER-SPEC.md` §95 — secure paid vertical slice, not UI-only marketplace.
