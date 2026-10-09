export function assertAdminToken(provided: string | undefined): void {
  const expected = process.env.KIVRO_ADMIN_TOKEN;
  if (!expected) {
    throw new Error("ADMIN_TOKEN_NOT_CONFIGURED");
  }
  if (!provided || provided !== expected) {
    throw new Error("ADMIN_UNAUTHORIZED");
  }
}
