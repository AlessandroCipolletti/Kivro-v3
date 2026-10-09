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
- **Approve plan** creates jobs for ready steps (parallel research when funded).

## 3. Conversation persistence

- `POST /marketplace/agent/conversations` then pass `conversationId` on discover/plan.
- `GET /marketplace/agent/conversations/:id` shows message history.

## 4. Platform inference

- With no LLM env, constraints still parse deterministically from goal text (`KIVRO_DEV_AUTH_SHORTCUTS` unrelated).

## Automated gate

```bash
pnpm verify:m11
```
