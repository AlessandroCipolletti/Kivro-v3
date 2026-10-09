/** M19 — AWS thin composition entry (shared API, profile-specific env). */
process.env.KIVRO_CLOUD_PROFILE ??= "aws";
await import("@kivro/api/dist/main.js");
