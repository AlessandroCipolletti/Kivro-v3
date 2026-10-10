/** §166 — platform AI keys stay in server environment injected by the host secret store. */
export type SecretAudience = "server" | "browser" | "worker" | "log" | "job_manifest";

export function platformAiKeyVisibleTo(audience: SecretAudience): boolean {
  return audience === "server";
}

export function productionPlatformSecretSource(): "managed_env_injection" {
  return "managed_env_injection";
}

/** `.env.example` may name a secret. It may not carry a value. */
export function exampleAssignsSecretValue(line: string): boolean {
  const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (!match) {
    return false;
  }
  const name = match[1] ?? "";
  const value = (match[2] ?? "").replace(/^["']|["']$/g, "");
  if (!/(?:_KEY|_SECRET|_TOKEN|_PASSWORD)$/i.test(name)) {
    return false;
  }
  if (value === "" || value.startsWith("#")) {
    return false;
  }
  return !value.includes("localhost") && !value.startsWith("change-me");
}
