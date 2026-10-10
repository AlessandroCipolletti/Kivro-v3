/** §217 — archives are rejected unless a future safe extractor is explicitly enabled. */
const ARCHIVE_MIME = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "application/x-tar",
  "application/gzip",
  "application/x-gzip",
  "application/x-7z-compressed",
  "application/vnd.rar",
  "application/x-rar-compressed",
]);

const ARCHIVE_EXT = new Set([".zip", ".tar", ".gz", ".tgz", ".7z", ".rar"]);

export function isArchiveMime(value: string): boolean {
  return ARCHIVE_MIME.has(value.trim().toLowerCase());
}

export function isArchiveExtension(value: string): boolean {
  const ext = value.trim().toLowerCase();
  const dotted = ext.startsWith(".") ? ext : `.${ext}`;
  return ARCHIVE_EXT.has(dotted);
}

export function archiveInputIssue(fieldKey: string, mimes: string[], extensions: string[]): string | null {
  if (mimes.some(isArchiveMime) || extensions.some(isArchiveExtension)) {
    return `field ${fieldKey}: archive formats are not accepted`;
  }
  return null;
}
