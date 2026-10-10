import { isProtocolVersionWithinCompatibilityWindow } from "@kivro/contracts";
import { KIVRO_COMPATIBILITY_MATRIX } from "./matrix.js";
import { evaluateWorkerVersion } from "./worker-policy.js";

export type CloudWorkerHandshakeResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "PROTOCOL_VERSION_UNSUPPORTED"
        | "WORKER_VERSION_REVOKED"
        | "WORKER_VERSION_BELOW_MINIMUM";
      message: string;
      httpStatus: 426 | 403;
      remediation: string;
    };

/** HARD-008 — unsupported Worker/protocol combinations fail closed with actionable health info. */
export function evaluateCloudWorkerHandshake(input: {
  protocolVersion?: number;
  workerVersion?: string;
  env?: NodeJS.ProcessEnv;
}): CloudWorkerHandshakeResult {
  const protocol = input.protocolVersion;
  if (protocol !== undefined) {
    const inWindow =
      protocol >= KIVRO_COMPATIBILITY_MATRIX.workerProtocolMin &&
      protocol <= KIVRO_COMPATIBILITY_MATRIX.workerProtocolMax &&
      isProtocolVersionWithinCompatibilityWindow(protocol);
    if (!inWindow) {
      return {
        ok: false,
        code: "PROTOCOL_VERSION_UNSUPPORTED",
        message: `Worker protocol ${protocol} is outside the supported window.`,
        httpStatus: 426,
        remediation: `Upgrade Worker to a build supporting protocol ${KIVRO_COMPATIBILITY_MATRIX.workerProtocolMin}–${KIVRO_COMPATIBILITY_MATRIX.workerProtocolMax}.`,
      };
    }
  }

  if (input.workerVersion) {
    const version = evaluateWorkerVersion(input.workerVersion, input.env);
    if (!version.ok) {
      return {
        ok: false,
        code: version.code,
        message: version.message,
        httpStatus: 403,
        remediation:
          version.code === "WORKER_VERSION_REVOKED"
            ? "Install a non-revoked Worker release from Kivro."
            : "Upgrade kivro-worker before connecting.",
      };
    }
  }

  return { ok: true };
}
