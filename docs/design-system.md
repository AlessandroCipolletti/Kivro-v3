# Kivro design system (M14)

Restrained marketplace UI: clarity over decoration. Tokens live in `apps/web/src/app/globals.css`; React primitives in `apps/web/src/components/ui/`.

## Typography

- **Font:** system sans stack (`--font-sans`)
- **Scale:** `--text-xs` through `--text-2xl` (see globals)
- **Mono:** job IDs, API keys, CLI — `font-mono` / `.input-mono` only

## Color

| Token | Use |
|-------|-----|
| `--bg`, `--surface` | Page and panels |
| `--ink`, `--muted` | Text hierarchy |
| `--accent` | Primary actions |
| `--status-*` | Semantic job/availability (always with label) |

## Components

- `StatusBadge` — unified availability/job states (§533)
- `EmptyState` — actionable empty views (§534)
- `PageHeader` — title + description + actions
- `Alert` — inline errors/info
- `Button` — primary / secondary / danger wrappers

## Icons

Single inline SVG set: `apps/web/src/components/icons.tsx` (stroke icons, 20px).

## Motion

Respect `prefers-reduced-motion`. No decorative animation (§536).

## Review checklist (§545)

Functional flow → hierarchy → density → responsive → copy → consistency with this doc.
