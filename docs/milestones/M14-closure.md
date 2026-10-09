# M14 — milestone closure (bounded)

UI design system, shared status language, developer settings UI, and polish across buyer/seller surfaces.

## Shipped

- `docs/design-system.md` + expanded `globals.css` tokens (type, status, a11y, reduced motion)
- UI primitives: `StatusBadge`, `EmptyState`, `PageHeader`, `Alert`, `Button`, `icons.tsx`
- `status-ui.ts` — unified marketplace/job/seller health semantics (§533)
- Settings: `/settings/api-keys`, `/settings/webhooks` (M13 §349 completion)
- Polished: discover/search, agent, favorites, run/checkout, capability cards/detail, jobs, seller profile/dashboard, auth alerts
- `LoadingState` for explicit loading copy (§537)
- Webhook delivery log in settings UI
- Gate: `pnpm verify:m14`

## Deferred (M15+)

- Automated Playwright/visual regression suite (§547) — manual screenshot checklist only
- Dark theme (not required for MVP)
- Dedicated billing/wallet UI screens (if added later in product plan)
