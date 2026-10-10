/** Shared M28 family classification and schedule-note validation. */

export const M28_FAMILIES = [
  { id: "ARCH-UNI", prefix: "ARCH-UNI-" },
  { id: "PORT", prefix: "PORT-" },
  { id: "HOST-NET", prefix: "HOST-NET-" },
  { id: "HARD", prefix: "HARD-" },
];

export const PORTABILITY_FAMILY_IDS = ["ARCH-UNI", "PORT", "HOST-NET"];

export function familyOfRequirementId(id) {
  for (const f of M28_FAMILIES) {
    if (id.startsWith(f.prefix)) return f.id;
  }
  return null;
}

export function hasExplicitScheduleNote(notes) {
  const n = (notes ?? "").trim();
  if (!n || n === "---") return false;
  return /scheduled:|post-MVP|M\d{2}|IMPLEMENTATION-PLAN|bounded|deferred/i.test(n);
}
