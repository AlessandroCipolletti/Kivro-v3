export {
  normalizeEmail,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
} from "./crypto.js";
export { createSession, resolveSessionUser, revokeSession } from "./session.js";
export {
  registerWithEmail,
  loginWithEmail,
  verifyEmailToken,
  issueEmailVerificationToken,
  resendEmailVerification,
  isEmailVerified,
} from "./email-auth.js";
export type { VerifyEmailResult, ResendVerificationResult } from "./email-auth.js";
export {
  buildGoogleAuthorizationUrl,
  getGoogleConfig,
  loginOrLinkGoogleUser,
} from "./google-auth.js";
export { resolvePublicApiBaseUrl, resolveGoogleOAuthRedirectUri } from "./api-base-url.js";
export { createWorkerPairingCode, consumePairingCode } from "./worker-pairing.js";
