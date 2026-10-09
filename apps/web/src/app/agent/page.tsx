"use client";

import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useState } from "react";

type Recommendation = {
  slug: string;
  name: string;
  priceTierCents: number | null;
  currency: string;
  rating: number | null;
  whySelected: string[];
  limitation?: string;
};

export default function MarketplaceAgentPage() {
  const [goal, setGoal] = useState("");
  const [maxDollars, setMaxDollars] = useState("");
  const [minRating, setMinRating] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [parsed, setParsed] = useState<Record<string, unknown> | null>(null);

  async function discover(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const constraints: Record<string, unknown> = {};
      if (maxDollars) {
        constraints.maxPerJobSpendCents = Math.round(Number.parseFloat(maxDollars) * 100);
      }
      if (minRating) {
        constraints.minRating = Number.parseFloat(minRating);
      }
      if (onlineOnly) {
        constraints.onlineOnly = true;
      }
      const res = await fetch(`${API_BASE}/marketplace/agent/discover`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, constraints }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const body = (await res.json()) as {
        error?: string;
        recommendations?: Recommendation[];
        parsedConstraints?: Record<string, unknown>;
      };
      if (!res.ok) {
        setError(body.error ?? "Discovery failed");
        return;
      }
      setRecommendations(body.recommendations ?? []);
      setParsed(body.parsedConstraints ?? null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Marketplace Agent</h1>
      <p className="meta">
        Describe what you need. Kivro searches published capabilities and returns a shortlist — you
        choose which provider to run (assisted discovery, Mode A).
      </p>
      <form className="detail-panel form-stack" onSubmit={(e) => void discover(e)}>
        <div className="form-field">
          <label className="field-label" htmlFor="goal">
            What do you need?
          </label>
          <textarea
            id="goal"
            rows={4}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="I need company research with competitors, under $5, rated at least 4.5…"
            required
          />
        </div>
        <div className="filter-grid">
          <div className="form-field">
            <label className="field-label" htmlFor="agent-max">
              Max $ per job
            </label>
            <input
              id="agent-max"
              type="number"
              step="0.01"
              min="0"
              placeholder="Any"
              value={maxDollars}
              onChange={(e) => setMaxDollars(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="agent-rating">
              Min rating
            </label>
            <input
              id="agent-rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="e.g. 4.5"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            />
          </div>
          <div className="form-field">
            <span className="field-label">Availability</span>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={onlineOnly}
                onChange={(e) => setOnlineOnly(e.target.checked)}
              />
              <span>Online now</span>
            </label>
          </div>
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="form-actions">
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Searching…" : "Find the best services"}
          </button>
        </div>
      </form>
      {parsed && (
        <p className="meta" style={{ marginTop: "1rem" }}>
          Applied constraints: {JSON.stringify(parsed)}
        </p>
      )}
      {recommendations && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2 style={{ fontSize: "1.15rem" }}>Shortlist</h2>
          {recommendations.length === 0 && (
            <p className="meta">No capabilities match your constraints. Try relaxing filters.</p>
          )}
          <ol style={{ paddingLeft: "1.2rem" }}>
            {recommendations.map((rec, i) => (
              <li key={rec.slug} className="detail-panel" style={{ marginTop: "0.75rem" }}>
                <strong>
                  {i + 1}. {rec.name}
                </strong>
                <p className="meta">
                  {rec.rating != null ? `★ ${rec.rating.toFixed(1)} · ` : ""}
                  {rec.priceTierCents != null
                    ? `$${(rec.priceTierCents / 100).toFixed(2)}`
                    : "—"}
                </p>
                <ul>
                  {rec.whySelected.map((w) => (
                    <li key={w} className="meta">
                      {w}
                    </li>
                  ))}
                </ul>
                {rec.limitation && <p className="meta">Limitation: {rec.limitation}</p>}
                <Link className="button secondary" href={`/capabilities/${rec.slug}`}>
                  View & run
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
