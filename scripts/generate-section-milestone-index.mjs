#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const plan = fs.readFileSync(path.join(root, "spec/IMPLEMENTATION-PLAN.md"), "utf8");

/** section → earliest milestone that claims it (M00–M34) */
const sectionToMilestone = new Map();

for (const chunk of plan.split(/^#{2,3} M/m)) {
  const head = chunk.match(/^(\d+)/);
  if (!head) continue;
  const mNum = Number(head[1]);
  if (mNum > 34 || mNum === 17) continue;
  const label = `M${String(mNum).padStart(2, "0")}`;
  for (const sec of chunk.matchAll(/§(\d+)/g)) {
    const n = Number(sec[1]);
    const prev = sectionToMilestone.get(n);
    if (!prev || Number(prev.slice(1)) > mNum) {
      sectionToMilestone.set(n, label);
    }
  }
}

const idPrefixRules = [
  { prefix: "DEV-LOCAL-", milestone: "M18" },
  { prefix: "AUTH-", milestone: "M02" },
  { prefix: "HOST-NET-", milestone: "M20" },
  { prefix: "PORT-", milestone: "M19" },
  { prefix: "ARCH-UNI-", milestone: "M19" },
  { prefix: "HARD-", milestone: "M24" },
  { prefix: "ASYNC-", milestone: "M29" },
  { prefix: "BUYERUX-", milestone: "M30" },
  { prefix: "SELLERUX-", milestone: "M32" },
];

const out = {
  generatedFrom: "spec/IMPLEMENTATION-PLAN.md",
  sectionToMilestone: Object.fromEntries([...sectionToMilestone.entries()].sort((a, b) => a[0] - b[0])),
  idPrefixRules,
  postMvpSections: [47, 517, 518],
};

fs.mkdirSync(path.join(root, "spec/compliance"), { recursive: true });
fs.writeFileSync(
  path.join(root, "spec/compliance/section-milestone-index.json"),
  `${JSON.stringify(out, null, 2)}\n`,
);
console.log(`Wrote section-milestone-index (${sectionToMilestone.size} sections)`);
