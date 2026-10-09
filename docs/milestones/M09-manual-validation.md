# M09 manual validation (scheduling & availability)

## Prerequisites

- `pnpm db:setup`
- Published capability with bound online worker (M03–M07)
- Buyer credits or Stripe test mode (M08)

## Marketplace list with availability (agent §405)

```bash
curl -sS "$API/capabilities?includeAvailability=true"
```

## Seller schedule

```bash
# GET schedule (session cookie)
curl -sS -b cookies.txt "$API/seller/capabilities/$CAP_ID/schedule"

# PUT custom weekly window (UTC Monday 09:00–17:00)
curl -sS -b cookies.txt -X PUT "$API/seller/capabilities/$CAP_ID/schedule" \
  -H 'content-type: application/json' \
  -d '{"mode":"CUSTOM_SCHEDULE","timezone":"UTC","windows":[{"dayOfWeek":1,"startMinutes":540,"endMinutes":1020}]}'
```

Operational pause/resume (published capability, §412):

```bash
curl -sS -b cookies.txt -X POST "$API/seller/capabilities/$CAP_ID/schedule/pause"
curl -sS -b cookies.txt -X POST "$API/seller/capabilities/$CAP_ID/schedule/resume"
```

## Buyer availability

```bash
curl -sS "$API/capabilities/$SLUG/availability"
# { accepting, status: ONLINE|BUSY|SCHEDULED_OFFLINE|OFFLINE|PAUSED, reasons[] }
```

## Scheduled job

```bash
curl -sS -b buyer-cookies.txt -X POST "$API/buyer/jobs" \
  -H 'content-type: application/json' \
  -d '{"capabilityId":"...","inputs":{},"scheduledRunAt":"2026-12-01T12:00:00.000Z"}'
```

Promote due jobs + expire overdue waits (admin):

```bash
curl -sS -X POST "$API/platform/admin/jobs/promote-scheduled" \
  -H "x-kivro-admin-token: $KIVRO_ADMIN_TOKEN"
```

Buyer cancel scheduled job:

```bash
curl -sS -b buyer-cookies.txt -X POST "$API/buyer/jobs/$JOB_ID/cancel" \
  -H 'content-type: application/json' -d '{"reason":"changed mind"}'
```

Immediate submit while schedule-closed should return `409` with `CAPABILITY_SCHEDULED_OFFLINE` and `nextAvailableAt` (no durable charge).

Automated gate: `pnpm verify:m09`
