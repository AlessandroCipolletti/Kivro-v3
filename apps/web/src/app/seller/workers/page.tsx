"use client";

import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE } from "@/lib/kivro-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type WorkerRow = {
  id: string;
  name: string;
  status: string;
  workerVersion: string;
  lastSeenAt: string | null;
  activeAssignmentCount: number;
};

type CapabilityRow = { id: string; slug: string; name: string; currentVersionId: string | null };

export default function SellerWorkersPage() {
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [capabilities, setCapabilities] = useState<CapabilityRow[]>([]);
  const [capabilityId, setCapabilityId] = useState("");
  const [assigned, setAssigned] = useState<Set<string>>(new Set());
  const [policy, setPolicy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async (id: string) => {
    if (!id) {
      setAssigned(new Set());
      return;
    }
    const res = await fetch(`${API_BASE}/seller/capabilities/${id}/worker-assignments`, {
      credentials: "include",
    });
    if (!res.ok) {
      setAssigned(new Set());
      return;
    }
    const body = (await res.json()) as { assignments: Array<{ workerDeviceId: string }> };
    setAssigned(new Set(body.assignments.map((row) => row.workerDeviceId)));
  }, []);

  const load = useCallback(async () => {
    setError(null);
    const [workerRes, capRes] = await Promise.all([
      fetch(`${API_BASE}/seller/workers`, { credentials: "include" }),
      fetch(`${API_BASE}/seller/capabilities`, { credentials: "include" }),
    ]);
    if (!workerRes.ok) {
      setError("Sign in as a verified seller to view Workers.");
      return;
    }
    const body = (await workerRes.json()) as { routingPolicy: string; workers: WorkerRow[] };
    setPolicy(body.routingPolicy);
    setWorkers(body.workers);
    if (capRes.ok) {
      const caps = (await capRes.json()) as { capabilities: CapabilityRow[] };
      const published = caps.capabilities.filter((cap) => cap.currentVersionId);
      setCapabilities(published);
      setCapabilityId((current) => current || published[0]?.id || "");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadAssignments(capabilityId);
  }, [capabilityId, loadAssignments]);

  async function toggleAssignment(workerId: string, active: boolean) {
    if (!capabilityId) {
      return;
    }
    setError(null);
    const res = await fetch(
      active
        ? `${API_BASE}/seller/capabilities/${capabilityId}/worker-assignments/${workerId}`
        : `${API_BASE}/seller/capabilities/${capabilityId}/worker-assignments`,
      active
        ? { method: "DELETE", credentials: "include" }
        : {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerDeviceId: workerId }),
          },
    );
    if (!res.ok) {
      setError("Could not update that assignment.");
      return;
    }
    await loadAssignments(capabilityId);
    await load();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        title="Workers"
        description="Each Worker has its own health and assignments. New jobs go to an eligible assigned Worker."
      />
      <Link href="/seller/dashboard" className="mb-6 inline-block text-sm">
        ← Dashboard
      </Link>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {policy ? <p className="mb-4 text-sm text-muted">Routing: {policy}</p> : null}
      {capabilities.length > 0 ? (
        <label className="mb-4 block text-sm">
          Capability version assignments
          <select
            className="mt-1 w-full rounded border border-border bg-background p-2"
            value={capabilityId}
            onChange={(event) => setCapabilityId(event.target.value)}
          >
            {capabilities.map((cap) => (
              <option key={cap.id} value={cap.id}>
                {cap.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {workers.length === 0 ? (
        <p className="text-sm text-muted">No Workers paired yet. Pair one from seller onboarding.</p>
      ) : (
        <ul className="grid gap-3">
          {workers.map((worker) => (
            <li key={worker.id} className="rounded border border-border p-4">
              <p className="font-medium">{worker.name}</p>
              <p className="text-sm text-muted">
                {worker.status} · v{worker.workerVersion} · {worker.activeAssignmentCount} active
                assignment{worker.activeAssignmentCount === 1 ? "" : "s"}
              </p>
              {capabilityId ? (
                <button
                  type="button"
                  className="mt-3 rounded border border-border px-3 py-1 text-sm"
                  onClick={() => void toggleAssignment(worker.id, assigned.has(worker.id))}
                >
                  {assigned.has(worker.id) ? "Unassign from this version" : "Assign to this version"}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
