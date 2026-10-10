-- M33 SELLERUX-028 — seller notification event coverage
ALTER TABLE "SellerProfile" ADD COLUMN "sellerNotifyFailure" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SellerProfile" ADD COLUMN "sellerNotifyMissedWindow" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SellerProfile" ADD COLUMN "sellerNotifyProblemReport" BOOLEAN NOT NULL DEFAULT true;
