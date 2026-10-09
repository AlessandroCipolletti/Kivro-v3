import { describe, expect, it, vi } from "vitest";
import { sendBrevoTemplate } from "./brevo-transactional.js";

const config = {
  apiKey: "test-key",
  senderEmail: "noreply@example.com",
  senderName: "Kivro",
  templates: { emailVerification: 1, passwordReset: 2, accountConfirmed: 3 },
};

describe("sendBrevoTemplate", () => {
  it("posts template payload to Brevo", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 201 }));
    const result = await sendBrevoTemplate(
      config,
      { to: "user@example.com", templateId: 1, params: { confirmLink: "https://x" } },
      fetchImpl,
    );
    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["api-key"]).toBe("test-key");
    const body = JSON.parse(String(init.body)) as {
      templateId: number;
      to: Array<{ email: string }>;
    };
    expect(body.templateId).toBe(1);
    expect(body.to[0]?.email).toBe("user@example.com");
  });
});
