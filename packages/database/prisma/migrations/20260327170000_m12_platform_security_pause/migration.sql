-- M12 §393 — platform-triggered security pause (non-overridable until resolved)

ALTER TABLE "SellerProfile" ADD COLUMN "platformSecurityPause" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SellerProfile" ADD COLUMN "platformSecurityPauseReason" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "platformSecurityPausedAt" TIMESTAMP(3);
