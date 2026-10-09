#!/usr/bin/env node
/**
 * Deterministic local demo identities (§562 / DEV-LOCAL-011).
 */
async function main() {
  const { getPrismaClient } = await import("@kivro/database");
  const { hashPassword } = await import("@kivro/auth");
  const { grantBuyerCredits } = await import("@kivro/billing");
  const prisma = getPrismaClient();

  const buyerEmail = "buyer@kivro.local";
  const sellerEmail = "seller@kivro.local";
  const password = "KivroDevPass123!";

  const passwordHash = await hashPassword(password);

  const buyer = await prisma.user.upsert({
    where: { email: buyerEmail },
    create: {
      email: buyerEmail,
      passwordHash,
      emailVerifiedAt: new Date(),
      marketplaceTermsAcceptedAt: new Date(),
    },
    update: {
      passwordHash,
      emailVerifiedAt: new Date(),
      marketplaceTermsAcceptedAt: new Date(),
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: sellerEmail },
    create: {
      email: sellerEmail,
      passwordHash,
      emailVerifiedAt: new Date(),
      marketplaceTermsAcceptedAt: new Date(),
    },
    update: {
      passwordHash,
      emailVerifiedAt: new Date(),
      marketplaceTermsAcceptedAt: new Date(),
    },
  });

  await prisma.sellerProfile.upsert({
    where: { userId: seller.id },
    create: {
      userId: seller.id,
      displayName: "Kivro Local Seller",
      payoutStatus: "ACTIVE",
      verificationStatus: "VERIFIED",
      connectOnboardingStatus: "COMPLETE",
      transfersCapabilityStatus: "active",
      payoutsEnabled: true,
    },
    update: {
      displayName: "Kivro Local Seller",
      payoutStatus: "ACTIVE",
      verificationStatus: "VERIFIED",
      connectOnboardingStatus: "COMPLETE",
      transfersCapabilityStatus: "active",
      payoutsEnabled: true,
    },
  });

  if (process.env.KIVRO_DEV_PAYMENT_SHORTCUTS === "true") {
    await grantBuyerCredits(prisma, {
      buyerId: buyer.id,
      amountCents: 50_000,
      externalId: "dev-seed-buyer-credits-v1",
    });
  }

  console.log(
    JSON.stringify({
      seeded: true,
      buyer: { email: buyerEmail, password },
      seller: { email: sellerEmail, password },
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
