# M12 — manual validation checklist

## Prerequisites

```bash
pnpm db:setup   # applies m12_seller_health migration
pnpm dev
```

Seller account with verified email, paired Worker (`kivro-worker pair`), at least one published capability.

## 1. Worker health CLI (§379)

```bash
pnpm --filter @kivro/worker exec kivro-worker health
```

Expect local Docker/OpenClaw checks and cloud heartbeat when paired.

## 2. Seller dashboard

- Sign in → open `/seller/dashboard`
- Worker summary, capability list, 24h job metrics, health timeline
- **Pause all new jobs** → capabilities stop accepting; buyer run flow shows not accepting
- **Resume new jobs** clears web emergency pause

## 3. Local emergency pause (§382–§384)

```bash
kivro-worker pause --all
kivro-worker health
```

Poll should return no new offers while pause active. `kivro-worker resume --all` clears local pause.

## Automated gate

```bash
pnpm verify:m12
```
