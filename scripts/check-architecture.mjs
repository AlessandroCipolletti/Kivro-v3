import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sharedDir = path.join(root, "packages");
const forbiddenImports = [/cloud-aws/, /cloud-netsons/, /@aws-sdk\//, /netsons/i];

const sharedPackages = fs
  .readdirSync(sharedDir)
  .filter((name) => !["cloud-aws", "cloud-netsons"].includes(name));

let violations = [];

for (const pkg of sharedPackages) {
  const src = path.join(sharedDir, pkg, "src");
  if (!fs.existsSync(src)) continue;
  walk(src);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".ts")) {
      const text = fs.readFileSync(full, "utf8");
      for (const pattern of forbiddenImports) {
        if (pattern.test(text)) {
          violations.push(`${full} matches ${pattern}`);
        }
      }
    }
  }
}

if (violations.length) {
  console.error("Architecture check failed:\n" + violations.join("\n"));
  process.exit(1);
}
console.log("Architecture check passed (shared packages avoid provider imports).");
