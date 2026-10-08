# Kivro architecture

See `spec/MONOREPO-ARCHITECTURE.md` and Master Spec §48, §52.

- One shared backend semantics layer in `packages/*`.
- Two composition roots: `packages/cloud-netsons`, `packages/cloud-aws`.
- Seller Worker: `apps/worker` + `packages/openclaw-adapter`.
- Marketplace UI: `apps/web` (expanded M10+).
