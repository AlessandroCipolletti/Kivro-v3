/** Master Spec §198 — compile UI presets into formal file constraints. */
export const MEDIA_PRESETS = {
  images: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  },
  video: {
    allowedMimeTypes: ["video/mp4", "video/quicktime", "video/webm"],
    allowedExtensions: [".mp4", ".mov", ".webm"],
  },
  audio: {
    allowedMimeTypes: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/flac"],
    allowedExtensions: [".mp3", ".wav", ".m4a", ".flac"],
  },
  documents: {
    allowedMimeTypes: [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedExtensions: [".pdf", ".txt", ".md", ".docx"],
  },
  data: {
    allowedMimeTypes: [
      "text/csv",
      "application/json",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    allowedExtensions: [".csv", ".json", ".xlsx"],
  },
  blender: {
    allowedMimeTypes: ["application/x-blender"],
    allowedExtensions: [".blend"],
  },
} as const;

export type MediaPresetKey = keyof typeof MEDIA_PRESETS;

export function fileConstraintsFromPreset(preset: MediaPresetKey) {
  return { ...MEDIA_PRESETS[preset] };
}
