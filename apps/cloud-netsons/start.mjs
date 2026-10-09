/** M20 — Netsons managed Node entry (shared API, profile-specific env). */
process.env.KIVRO_CLOUD_PROFILE ??= "netsons";
const { loadNetsonsRuntimeConfig } = await import("@kivro/cloud-netsons");
loadNetsonsRuntimeConfig(process.env);
await import("@kivro/api/dist/main.js");
