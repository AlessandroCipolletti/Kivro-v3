# M11 — manual validation checklist

## Prerequisites

```bash
pnpm db:setup   # applies m11_agent_orchestration migration
pnpm dev
```

Signed-in buyer with verified email and credits (M02/M08).

## 1. Assisted discovery (unchanged)

- `/agent` → describe goal → shortlist with transparency fields.

## 2. Orchestration plan (Mode B foundation)

- Same page → **Build execution plan** with a multi-competitor + PDF style goal and budget/rating constraints.
- Expect `AWAITING_APPROVAL` plan with step DAG and estimated total.
- **Approve plan** re-quotes prices, reserves orchestration budget, starts ready steps (parallel research when funded).
- When a step’s job completes (worker `/complete`), the next dependent step should auto-start.
- `POST /marketplace/agent/plans/:id/advance` manually advances a stuck RUNNING plan.
- Agent tools: `POST /marketplace/agent/tools/search_capabilities`, `GET .../get_capability/:slug`, etc.

## 3. Conversation persistence

- `POST /marketplace/agent/conversations` then pass `conversationId` on discover/plan.
- `GET /marketplace/agent/conversations/:id` shows message history.

## 4. Platform inference

- With no LLM env, constraints still parse deterministically from goal text (`KIVRO_DEV_AUTH_SHORTCUTS` unrelated).

## Automated gate

```bash
pnpm verify:m11
```
