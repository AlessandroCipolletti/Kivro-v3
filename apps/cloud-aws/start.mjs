/** M21 — AWS managed Node entry (shared API, profile-specific env). */
process.env.KIVRO_CLOUD_PROFILE ??= "aws";
const { loadAwsRuntimeConfig } = await import("@kivro/cloud-aws");
loadAwsRuntimeConfig(process.env);
await import("@kivro/api/dist/main.js");
