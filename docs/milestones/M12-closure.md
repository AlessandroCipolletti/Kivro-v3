# M12 — milestone closure (bounded)

M12 seller health, emergency controls, and platform security pause are delivered across commits `f75f0ca`+ (including hardening and §393).

## Shipped

- `@kivro/seller-health` — warnings, metrics, capability health, marketplace control, platform security triggers
- Seller web `/seller/dashboard` — worker/capability health, emergency + per-capability pause
- Worker CLI — `health`, `doctor`, `pause --all`, `resume --all`, `stop --all --confirm`
- Cloud ↔ local pause sync, orchestration/agent respect `accepting`
- **§393** — `platformSecurityPause` on seller profile, auto-trigger on critical telemetry, resume blocked until cleared
- **§389** — `expireQueuedJobsWhileAcceptanceBlocked` in scheduling sweeps + payment reconcile

## Deferred / later milestones

- **Worker request signing** (DEC-M07-002) — still `x-worker-device-id` header for job protocol
- Full **§394** manual E2E checklist in staging (automated subset in `acceptance-m12.test.ts`)
- Rich **dependency health** per capability (Blender/OpenClaw deps UI)
- **§395+** seller operational principles beyond dashboard MVP

## Gate

```bash
pnpm db:setup   # includes m12_seller_health + m12_platform_security_pause
pnpm verify:m12
```
