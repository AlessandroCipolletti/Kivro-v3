"use client";

import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      verificationToken?: string;
      message?: string;
    };
    if (!res.ok) {
      setError(body.error === "INVALID_CREDENTIALS" ? "Unable to create account with this email" : "Registration failed");
      return;
    }
    const qs = new URLSearchParams({ email });
    if (body.verificationToken) {
      qs.set("devToken", body.verificationToken);
    }
    router.push(`/verify-email?${qs.toString()}`);
  }

  return (
    <div className="auth-page">
      <h1>Create account</h1>
      <p className="meta" style={{ maxWidth: "28rem", margin: "0 auto 1.25rem", textAlign: "center" }}>
        We will email you a verification link. Paid jobs and seller features require a verified email.
      </p>
      <form
        className="auth-card form-stack"
        onSubmit={(e) => {
          void submitRegister(e);
        }}
      >
        <div className="form-field">
          <label className="field-label" htmlFor="reg-email">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="field-label" htmlFor="reg-password">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="field-label" htmlFor="reg-confirm">
            Confirm password
          </label>
          <input
            id="reg-confirm"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="form-actions">
          <button className="button" type="submit">
            Create account
          </button>
        </div>
      </form>
      <p className="meta" style={{ textAlign: "center", marginTop: "1.25rem" }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
