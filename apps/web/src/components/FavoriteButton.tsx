"use client";

import { API_BASE } from "@/lib/kivro-api";
import { useState } from "react";

export function FavoriteButton({
  capabilityId,
  initialFavorited = false,
}: {
  capabilityId: string;
  initialFavorited?: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      if (favorited) {
        const res = await fetch(`${API_BASE}/buyer/favorites/${capabilityId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          setFavorited(false);
        }
      } else {
        const res = await fetch(`${API_BASE}/buyer/favorites`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ capabilityId }),
        });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (res.ok) {
          setFavorited(true);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className="button secondary"
      type="button"
      disabled={busy}
      onClick={() => {
        void toggle();
      }}
      aria-pressed={favorited}
    >
      {favorited ? "Saved" : "Save"}
    </button>
  );
}
