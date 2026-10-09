/** M19 — Netsons thin composition entry (shared API, profile-specific env). */
process.env.KIVRO_CLOUD_PROFILE ??= "netsons";
await import("@kivro/api/dist/main.js");
