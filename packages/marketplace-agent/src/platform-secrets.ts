import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** §166 — platform AI keys stay in server environment injected by the host secret store. */
export type SecretAudience = "server" | "browser" | "worker" | "log" | "job_manifest";

export function platformAiKeyVisibleTo(audience: SecretAudience): boolean {
  return audience === "server";
}

export function productionPlatformSecretSource(): "managed_env_injection" {
  return "managed_env_injection";
}

/** Encryption, IAM, and rotation belong to the host secret store. The app reads injected env. */
export const HOST_SECRET_CONTROLS = [
  "encryption_at_rest",
  "least_privilege_iam",
  "rotation_without_redeploy",
] as const;

export function sourceEmbedsPlatformSecret(source: string): boolean {
  return /KIVRO_PLATFORM_(?:OPENAI|ANTHROPIC)_API_KEY\s*=\s*['"]?[A-Za-z0-9]/.test(source);
}

/** A key is read from the current environment. It is not cached in the app. */
export function readInjectedPlatformKey(
  env: Record<string, string | undefined>,
  name: "KIVRO_PLATFORM_OPENAI_API_KEY" | "KIVRO_PLATFORM_ANTHROPIC_API_KEY",
): string {
  return env[name]?.trim() ?? "";
}

export function productionSecretPosture(input: {
  runtime: "local" | "production";
  encryptionKey?: string;
  runtimeRole?: string;
  stagingKey?: string;
  productionKey?: string;
  imageSource: string;
  clientSource: string;
}): { ok: boolean; gaps: string[] } {
  const gaps: string[] = [];
  if (input.runtime === "production") {
    if (!canSealPlatformSecret(input.encryptionKey)) {
      gaps.push("encryption_at_rest");
    }
    if (!input.runtimeRole?.trim()) {
      gaps.push("least_privilege_iam");
    }
    if (productionPlatformSecretSource() !== "managed_env_injection") {
      gaps.push("managed_source");
    }
  }
  if (!platformAiKeyVisibleTo("server") || platformAiKeyVisibleTo("browser") || platformAiKeyVisibleTo("worker")) {
    gaps.push("server_side");
  }
  const staging = input.stagingKey?.trim() ?? "";
  const production = input.productionKey?.trim() ?? "";
  if (staging && production && staging === production) {
    gaps.push("separate_keys");
  }
  if (sourceEmbedsPlatformSecret(input.imageSource) || sourceEmbedsPlatformSecret(input.clientSource)) {
    gaps.push("embedded_secret");
  }
  return { ok: gaps.length === 0, gaps };
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

function canSealPlatformSecret(encryptionKey: string | undefined): boolean {
  if (!encryptionKey || encryptionKey.length < 32) {
    return false;
  }
  const sealed = sealPlatformSecret("probe", encryptionKey);
  return openPlatformSecret(sealed, encryptionKey) === "probe" && !sealed.includes("probe");
}

export function sealPlatformSecret(plaintext: string, encryptionKey: string): string {
  const key = scryptSync(encryptionKey, "kivro-platform-secret", 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${ciphertext.toString("base64url")}`;
}

export function openPlatformSecret(sealed: string, encryptionKey: string): string {
  const [version, iv, tag, ciphertext] = sealed.split(":");
  if (version !== "v1" || !iv || !tag || !ciphertext) {
    throw new Error("sealed secret is not readable");
  }
  const key = scryptSync(encryptionKey, "kivro-platform-secret", 32);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}

export function presentedTokenMatches(presented: string | undefined, expected: string | undefined): boolean {
  if (!presented || !expected) {
    return false;
  }
  const left = Buffer.from(presented);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
