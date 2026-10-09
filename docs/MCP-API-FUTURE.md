# Marketplace MCP / agent API (Master Spec §42)

**Post-MVP.** MVP ships:

- Human web flows (`apps/web`)
- REST v1 buyer API (`/v1/*`, OpenAPI stub)
- Marketplace Agent (`/agent`, orchestration in `@kivro/marketplace-agent`)

Future external agent surface (preserved architecture):

```text
search_capabilities(query, constraints)
get_capability(id)
run_capability(id, input)
get_job(id)
```

Implement only after web jobs and v1 REST are stable (`docs/milestones/M16-closure.md`).
