"use client";

import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type MeResponse = { id: string; email: string; emailVerified: boolean };

export function SiteNavAuth() {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null | undefined>(undefined);

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (res.ok) {
        setUser((await res.json()) as MeResponse);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  async function signOut() {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    router.refresh();
    router.push("/");
  }

  if (user === undefined) {
    return <span className="nav-auth nav-auth-loading">…</span>;
  }

  if (user === null) {
    return (
      <Link href="/login" className="nav-auth">
        Sign in
      </Link>
    );
  }

  return (
    <span className="nav-auth nav-auth-signed-in">
      <span className="nav-auth-email" title={user.email}>
        {user.email}
      </span>
      <button type="button" className="nav-auth-signout" onClick={() => void signOut()}>
        Sign out
      </button>
    </span>
  );
}
