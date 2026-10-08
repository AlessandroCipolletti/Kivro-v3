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

## 3. Optional DB migrate (requires PostgreSQL)

```bash
export DATABASE_URL=postgresql://kivro:kivro@localhost:5432/kivro
pnpm --filter @kivro/database exec prisma migrate deploy
```

- [ ] Migration applies without error (skip if no local Postgres yet)

## 4. Traceability

- [ ] `spec/COVERAGE.md` updated for M01 requirements

When satisfied: **M01 validated — create commit** (optional).
