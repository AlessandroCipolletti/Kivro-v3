"use client";

import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifiedBanner = searchParams.get("verified") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = (await res.json().catch(() => ({}))) as { emailVerified?: boolean };
    if (!res.ok) {
      setError("Invalid credentials");
      return;
    }
    if (body.emailVerified === false) {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      return;
    }
    router.push("/jobs");
  }

  return (
    <div className="auth-page">
      <h1>Sign in</h1>
      {verifiedBanner && (
        <p className="meta" style={{ textAlign: "center", marginBottom: "1rem" }}>
          Email verified. Sign in to continue.
        </p>
      )}
      <form
        className="auth-card form-stack"
        onSubmit={(e) => {
          void submitLogin(e);
        }}
      >
        <div className="form-field">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="form-actions">
          <button className="button" type="submit">
            Sign in
          </button>
        </div>
      </form>
      <p className="meta" style={{ textAlign: "center", margin: "1.25rem 0 0.75rem" }}>
        or
      </p>
      <a className="button secondary google-signin" href={`${API_BASE}/api/users/auth/google`}>
        Continue with Google
      </a>
      <p className="meta" style={{ textAlign: "center", marginTop: "1.25rem" }}>
        New here? <Link href="/register">Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page"><p className="meta">Loading…</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
