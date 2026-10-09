# M11 — milestone closure (bounded)

M11 orchestration and agent tooling are delivered in commits `71557c2` and `ead41ca`.

## Shipped

- Deterministic orchestration planner (competitor → compare → PDF heuristic)
- Plan persistence, approval authorization, budget hold, step job launch
- Cross-job draft input, runner advancement on job completion, agent tool HTTP surface
- Web `/agent` plan build/approve; `pnpm verify:m11`

## Explicitly deferred (see DEC-M11-001)

- Canonical staging E2E (Master Spec §160)
- Mode C delegated budget / full autonomous purchase flows
- General LLM planner beyond optional platform inference
- Cron sweep for stuck `RUNNING` plans
- Full §143–§145 synthesis UX polish

Track remaining rows in `spec/COVERAGE.md` until a follow-up milestone.
