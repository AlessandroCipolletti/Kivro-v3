import { PROTOCOL_VERSION } from "./job-offer.js";

/** ARCH-UNI-024 — simultaneous control planes during backend transitions. */
export const WORKER_PROTOCOL_COMPATIBILITY_WINDOW = {
  minSupportedProtocolVersion: PROTOCOL_VERSION,
  maxAdvertisedProtocolVersion: PROTOCOL_VERSION,
} as const;

export function isProtocolVersionWithinCompatibilityWindow(version: number): boolean {
  return (
    version >= WORKER_PROTOCOL_COMPATIBILITY_WINDOW.minSupportedProtocolVersion &&
    version <= WORKER_PROTOCOL_COMPATIBILITY_WINDOW.maxAdvertisedProtocolVersion
  );
}
