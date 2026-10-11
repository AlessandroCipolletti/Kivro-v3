#!/usr/bin/env node
/**
 * After the local worker is paired, publish a buyable summary plus the
 * company-research and PDF listings the staging dry-run selects.
 * Idempotent. Development only.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sellerEmail = "seller@kivro.local";
const password = "KivroDevPass123!";

const listings = [
  {
    slug: "local-summary",
    name: "Local summary",
    description: "Summarize a short question. Local manual-test fixture.",
    category: "general",
    rating: 4.8,
    priceTierCents: 500,
  },
  {
    slug: "local-company-research-a",
    name: "Company research alpha",
    description: "Company research for a named business.",
    category: "Research",
    rating: 4.8,
    priceTierCents: 300,
  },
  {
    slug: "local-company-research-b",
    name: "Company research beta",
    description: "Company research for a named business.",
    category: "Research",
    rating: 4.7,
    priceTierCents: 300,
  },
  {
    slug: "local-company-research-c",
    name: "Company research gamma",
    description: "Company research for a named business.",
    category: "Research",
    rating: 4.6,
    priceTierCents: 300,
  },
  {
    slug: "local-pdf-report",
    name: "PDF report",
    description: "Turn supplied text into a pdf report.",
    category: "Documents",
    rating: 4.8,
    priceTierCents: 400,
  },
];

function baseUrl() {
  return (
    process.env.KIVRO_CLOUD_URL?.trim() ||
    process.env.API_URL?.trim() ||
    `http://localhost:${process.env.PORT?.trim() || "3001"}`
  );
}

function runtimeRoot() {
  const configured = process.env.KIVRO_RUNTIME_ROOT ?? "~/.kivro/runtime";
  return configured.startsWith("~") ? path.join(os.homedir(), configured.slice(1)) : configured;
}

async function main() {
  if (process.env.NODE_ENV === "production" || process.env.KIVRO_RUNTIME === "production") {
    throw new Error("local listing seed is development only");
  }
  const base = baseUrl();
  const statePath = path.join(runtimeRoot(), "worker-state.json");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  const deviceId = state.device?.workerDeviceId;
  if (!deviceId) {
    throw new Error("paired worker device id is missing");
  }
  const manifestRun = spawnSync(
    "node",
    ["apps/worker/dist/cli.js", "manifest", "--skills", "company-research"],
    { encoding: "utf8", cwd: root },
  );
  if (manifestRun.status !== 0) {
    throw new Error(manifestRun.stderr || "worker manifest failed");
  }
  const manifest = JSON.parse(manifestRun.stdout);
  const login = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: sellerEmail, password }),
  });
  const setCookie = login.headers.getSetCookie?.() ?? [];
  if (!login.ok || setCookie.length === 0) {
    throw new Error(`seller login failed (${login.status})`);
  }
  const cookie = setCookie.map((line) => line.split(";")[0]).join("; ");
  const { getPrismaClient } = await import("@kivro/database");
  const prisma = getPrismaClient();
  const published = [];
  for (const item of listings) {
    const existing = await prisma.capability.findFirst({
      where: { slug: item.slug, status: "PUBLISHED" },
    });
    if (existing) {
      await prisma.capability.update({
        where: { id: existing.id },
        data: { marketplaceCategory: item.category, rating: item.rating },
      });
      published.push(item.slug);
      continue;
    }
    const contract = {
      name: item.name,
      description: item.description,
      currency: "USD",
      priceTierCents: item.priceTierCents,
      inputs: { contractVersion: 1, fields: [{ key: "question", type: "string", required: true }] },
      output: { contractVersion: 1, type: "TEXT" },
    };
    const permissionManifest = {
      manifestVersion: 1,
      categories: [{ key: "PUBLIC_INTERNET", state: "USED", buyerLabel: "Web" }],
    };
    const draft = await request(base, cookie, "POST", "/seller/capabilities", {
      slug: item.slug,
      contract,
      permissionManifest,
    });
    await request(base, cookie, "POST", `/seller/capabilities/${draft.capability.id}/publish`, {
      workerDeviceId: deviceId,
      localWorkerId: "local-demo",
      contract,
      permissionManifest,
      workerManifest: manifest,
      inferenceDependency: {
        mode: "LOCAL",
        provider: "ollama",
        model: "llama",
        billingOwner: "SELLER",
      },
      executionModelAcknowledged: true,
      discovery: { snapshotVersion: 1, skills: ["company-research"], tools: [], warnings: [] },
      consent: {
        consentVersion: 1,
        selectedSkills: ["company-research"],
        selectedTools: [],
        permissionManifest,
      },
      rootName: item.name,
    });
    await prisma.capability.update({
      where: { id: draft.capability.id },
      data: { marketplaceCategory: item.category, rating: item.rating },
    });
    published.push(item.slug);
  }
  await prisma.$disconnect();
  console.log(JSON.stringify({ seededListings: published }));
}

async function request(base, cookie, method, pathname, body) {
  const res = await fetch(`${base}${pathname}`, {
    method,
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${method} ${pathname} → ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
