import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { listLocalCredentialRefs, openWorkerStore, readLocalCredentialSecret, setLocalCredentialSecret } from "./index.js";

describe("local credentials SELLERUX-009", () => {
  it("stores secrets on disk without exposing via list API shape", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "kivro-cred-"));
    const store = openWorkerStore(root);
    setLocalCredentialSecret(store, { refId: "openai-main", provider: "openai", secret: "sk-test" });
    const refs = listLocalCredentialRefs(store);
    expect(refs).toHaveLength(1);
    expect(JSON.stringify(refs)).not.toContain("sk-test");
    expect(readLocalCredentialSecret(store, "openai-main")).toBe("sk-test");
  });
});
