/** Brevo templates use {{params.confirmLink}}, {{params.resetLink}}, etc. */

export function workspaceNameFromEnv(): string {
  return process.env.BREVO_WORKSPACE_NAME?.trim() || "Kivro";
}

export function namesFromEmail(email: string): { firstName: string; lastName: string } {
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) {
    return { firstName: "there", lastName: "" };
  }
  const parts = local.split(/[._+-]/).filter(Boolean);
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  if (parts.length >= 2) {
    return {
      firstName: capitalize(parts[0] ?? local),
      lastName: capitalize(parts.slice(1).join(" ")),
    };
  }
  return { firstName: capitalize(local), lastName: "" };
}

export function baseTemplateParams(email: string): Record<string, string> {
  const { firstName, lastName } = namesFromEmail(email);
  return {
    workspaceName: workspaceNameFromEnv(),
    firstName,
    lastName,
    inviterName: "",
  };
}
