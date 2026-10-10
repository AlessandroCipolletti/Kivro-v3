import { describe, expect, it } from "vitest";
import { mimeAllowed, uploadTransportForSize, workerLoadsEntireFileIntoMemory } from "./upload-transport.js";

describe("upload transport", () => {
  it("keeps large files out of the API body and does not treat tags as MIME", () => {
    expect(uploadTransportForSize(100)).toBe("INLINE_METADATA");
    expect(uploadTransportForSize(5_000_000)).toBe("DIRECT_OBJECT");
    expect(uploadTransportForSize(50_000_000)).toBe("MULTIPART_OBJECT");
    expect(workerLoadsEntireFileIntoMemory()).toBe(false);
    expect(mimeAllowed("application/octet-stream", ["model/gltf-binary"])).toBe(false);
  });
});
