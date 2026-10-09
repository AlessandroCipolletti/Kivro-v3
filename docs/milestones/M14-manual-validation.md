# M14 — manual validation checklist

## Prerequisites

```bash
pnpm dev
```

Sign in as verified buyer; optional seller account for dashboard.

## 1. Design system (§541–§542)

- Open `/`, `/search`, `/jobs` — consistent typography, accent, spacing
- Confirm status chips use text + color (not color alone)
- `docs/design-system.md` matches `globals.css` tokens

## 2. Developer settings (§349)

- `/settings/api-keys` — create key, copy secret once, revoke
- `/settings/webhooks` — add HTTPS URL, copy signing secret, disable endpoint

## 3. Marketplace & jobs (§527–§537)

- Capability card: price, rating, **Available now** / **Busy** badge
- Capability detail: hierarchy (price, availability, CTA)
- Job list: bucket filters, empty state, status badges
- Job detail: timeline, result panel, download buttons

## 4. Seller dashboard (§531–§532)

- `/seller/dashboard` — worker health badges, emergency pause, capability pause
- Security warnings readable (no raw policy codes in main view)

## 5. Responsive (§538)

- Resize to mobile width: header nav wraps; job rows stack

## 6. Visual review (§546–§547)

Screenshot desktop + mobile for: search, capability detail, job detail, seller dashboard.
