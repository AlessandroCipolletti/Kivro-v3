# M14 — milestone closure (bounded)

UI design system, shared status language, developer settings UI, and polish across buyer/seller surfaces.

## Shipped

- `docs/design-system.md` + expanded `globals.css` tokens (type, status, a11y, reduced motion)
- UI primitives: `StatusBadge`, `EmptyState`, `PageHeader`, `Alert`, `Button`, `icons.tsx`
- `status-ui.ts` — unified marketplace/job/seller health semantics (§533)
- Settings: `/settings/api-keys`, `/settings/webhooks` (M13 §349 completion)
- Polished: capability cards/detail, job list/detail, seller dashboard
- Gate: `pnpm verify:m14`

## Deferred (M15+)

- Automated Playwright/visual regression suite (§547) — manual screenshot checklist only
- Dark theme (not required for MVP)
- Full pass on every auth/billing edge screen
