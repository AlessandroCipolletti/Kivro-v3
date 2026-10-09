# M10 manual validation (marketplace buyer UX)

## Preconditions

- `pnpm db:setup`
- API on `:3001`, web on `:3000` (`pnpm --filter @kivro/api start` after build, `pnpm --filter @kivro/web dev`)
- At least one **PUBLISHED** capability with availability data (M03–M09)
- Signed-in buyer with verified email and credits (M02/M08)

## Discover & search (§122–§125)

```bash
export API=http://localhost:3001
curl -sS "$API/marketplace/capabilities?sort=most_used"
curl -sS "$API/marketplace/capabilities?q=video&onlineOnly=true&minRating=4"
```

Browser:

- http://localhost:3000 — Discover grid + **Recently used** (when signed in)
- http://localhost:3000/search — text, category, sort, rating/price filters, online now

## Detail & run (§124, §28)

- `/capabilities/<slug>` — price, availability, seller, trust, privacy, inputs, examples, reviews, Save, Ask Agent
- `/capabilities/<slug>/run` — structured form, current price at submit, schedule when offline

## Seller, favorites, history (§126–§127)

- `/sellers/<sellerProfileId>`
- `/favorites` — saved capabilities with live price/availability
- `/jobs` — buckets (Running, Queued, Completed, …)
- `/jobs/<id>` — timeline, result, **Download** deliverables, review, run again

```bash
curl -sS -b cookies.txt "$API/buyer/recent-capabilities"
curl -sS -b cookies.txt "$API/buyer/jobs?bucket=completed"
curl -sS -b cookies.txt "$API/buyer/jobs/<jobId>"
curl -sS -b cookies.txt "$API/buyer/jobs/<jobId>/assets/<assetId>/download"
```

## Reviews (§128)

```bash
curl -sS "$API/capabilities/<slug>/reviews"
curl -sS -b cookies.txt -X POST "$API/buyer/jobs/<jobId>/review" \
  -H 'content-type: application/json' -d '{"stars":5,"body":"Great"}'
```

## Marketplace Agent — assisted discovery Mode A (§129–§135)

```bash
curl -sS -b cookies.txt -X POST "$API/marketplace/agent/discover" \
  -H 'content-type: application/json' \
  -d '{"goal":"company research under $5 rated at least 4.5","constraints":{"onlineOnly":true}}'
```

Browser: http://localhost:3000/agent — natural language goal + constraint controls, shortlist with “why selected”.

## Out of M10 scope (M11)

Multi-job orchestration, DAG plans, orchestration budget reservation (Master Spec §136–§142, §159 extension) — see `DEC-M10-003`.

## Automated gate

`pnpm verify:m10` (unit tests, acceptance-m10, marketplace/storage build, API/web typecheck, `sync-m10-coverage.mjs`)
