"use client";

import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const devToken = searchParams.get("devToken");

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setStatus("verified");
      setMessage("Your email is verified. You can sign in and use the marketplace.");
      return;
    }
    const err = searchParams.get("error");
    if (err === "invalid_token") {
      setStatus("error");
      setMessage("This verification link is invalid or expired. Request a new one below.");
      return;
    }
    if (err === "missing_token") {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    const token = searchParams.get("token");
    if (!token) {
      setStatus("idle");
      setMessage("Check your inbox for the verification link, or resend it below.");
      return;
    }
    let cancelled = false;
    setStatus("verifying");
    void (async () => {
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (cancelled) {
        return;
      }
      if (res.ok) {
        setStatus("verified");
        setMessage("Your email is verified. You can sign in and use the marketplace.");
        router.replace("/verify-email?verified=1");
      } else {
        setStatus("error");
        setMessage("This verification link is invalid or expired. Request a new one below.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    setResendMessage(null);
    const res = await fetch(`${API_BASE}/auth/resend-verification`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.status === 429) {
      setResendMessage("Please wait a couple of minutes before requesting another email.");
      return;
    }
    setResendMessage("If an unverified account exists for that address, we sent a new link.");
  }

  return (
    <div className="auth-page">
      <h1>Verify your email</h1>
      {status === "verifying" && <p className="meta">Verifying…</p>}
      {message && <p className="meta">{message}</p>}
      {devToken && status !== "verified" && (
        <p className="meta">
          Dev verification token: <code style={{ wordBreak: "break-all" }}>{devToken}</code> — open{" "}
          <Link href={`/verify-email?token=${encodeURIComponent(devToken)}`}>verify link</Link>
        </p>
      )}
      {status === "verified" && (
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link className="button" href="/login">
            Sign in
          </Link>
        </p>
      )}
      {status !== "verified" && (
        <form
          className="auth-card form-stack"
          style={{ marginTop: "1.25rem" }}
          onSubmit={(e) => {
            void resend(e);
          }}
        >
          <div className="form-field">
            <label className="field-label" htmlFor="verify-email">
              Email
            </label>
            <input
              id="verify-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {resendMessage && <p className="meta">{resendMessage}</p>}
          <div className="form-actions">
            <button className="button secondary" type="submit">
              Resend verification email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="auth-page"><p className="meta">Loading…</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
