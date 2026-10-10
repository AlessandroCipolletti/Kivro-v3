/** §48 — principles that stay visible and that code is not allowed to weaken. */
export const CORE_ARCHITECTURE_PRINCIPLES = [
  "Never execute buyer jobs in personal OpenClaw.",
  "Import selectively; never clone blindly.",
  "Buyer input is always untrusted.",
  "Prompt instructions are not a security boundary.",
  "Deny tools, resources, and network by default.",
  "Sandbox failure must fail closed.",
  "The seller's personal secrets should not be copied to the marketplace cloud.",
  "Dedicated worker credentials are preferred.",
  "Do not turn seller machines into general-purpose proxies.",
  "Every published capability has a narrow contract.",
  "Permissions are versioned and visible.",
  "Expanding permissions requires explicit seller approval.",
  "OpenClaw is an adapter, not the permanent domain model.",
  "Marketplace security policy overrides seller convenience.",
  "Build the smallest safe execution surface first.",
] as const;

/** §50 */
export const MVP_ONE_SENTENCE =
  "Install the Worker next to OpenClaw, select the capability to expose, publish it as a paid job, and let other users execute it through a restricted isolated runtime without exposing the personal OpenClaw environment.";
