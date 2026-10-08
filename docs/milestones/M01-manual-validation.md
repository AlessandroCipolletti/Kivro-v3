# M01 — manual validation checklist

## 1. Schema and domain

- [ ] `packages/database/prisma/schema.prisma` defines User, SellerProfile, WorkerDevice, Capability, CapabilityVersion, Job, ledger, audit entities (§23)
- [ ] `packages/domain` exports job lifecycle transitions (§9)
- [ ] `packages/contracts` exports capability I/O, permission manifest, job snapshots (§8, §192, §299–308)

## 2. Commands

```bash
cd /path/to/Kivro-v3
pnpm install
pnpm --filter @kivro/database exec prisma generate
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

- [ ] All exit 0

## 3. Local PostgreSQL (Docker)

```bash
cp .env.example .env   # if .env missing
pnpm db:setup          # docker compose + migrate (port 5433)
```

Or step by step: `pnpm db:up` → `pnpm db:wait` → `pnpm db:migrate`

Prisma is only via pnpm: `pnpm db:migrate` or `pnpm --filter @kivro/database exec prisma …` (not global `prisma`).

If migrate still hits port **5432**, unset a stale shell variable: `unset DATABASE_URL`, then `pnpm db:migrate` (`.env` uses **5433**).

- [ ] `pnpm db:migrate` exits 0

## 4. Traceability

- [ ] `spec/COVERAGE.md` updated for M01 requirements

When satisfied: **M01 validated — create commit** (optional).
