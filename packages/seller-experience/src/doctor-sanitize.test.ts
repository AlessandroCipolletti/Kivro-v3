import { describe, expect, it } from "vitest";
import { buildDoctorChecklist, sanitizeDoctorReport } from "./doctor-sanitize.js";

describe("doctor sanitize SELLERUX-032", () => {
  it("redacts secret-like tokens", () => {
    const out = sanitizeDoctorReport({
      token: "sk-abcdefghijklmnopqrstuvwxyz",
      note: "Bearer abc.def.ghi",
    });
    expect(JSON.stringify(out)).not.toContain("sk-abc");
    expect(JSON.stringify(out)).not.toContain("Bearer abc");
  });

  it("builds checklist rows", () => {
    const rows = buildDoctorChecklist({
      dockerOk: true,
      sandboxOk: true,
      openClawInstalled: true,
      openClawCompatible: true,
      credentialRefsConfigured: 1,
      credentialRefsStale: 0,
    });
    expect(rows.every((r) => r.ok)).toBe(true);
  });
});
