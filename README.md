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

## Local database

```bash
cp .env.example .env
pnpm db:setup
```

API health (after build):

```bash
node apps/api/dist/server.js
curl -s localhost:3001/health/live
```

Worker CLI:

```bash
node apps/worker/dist/cli.js doctor
```

Manual milestone validation: `docs/milestones/M00-manual-validation.md`.
