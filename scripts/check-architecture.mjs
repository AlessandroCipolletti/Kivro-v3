import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sharedDir = path.join(root, "packages");
const providerPackages = new Set(["cloud-aws", "cloud-netsons"]);

const sharedPackages = fs
  .readdirSync(sharedDir)
  .filter((name) => !providerPackages.has(name));

let violations = [];

/** S3-compatible object storage port (MinIO/AWS) lives in @kivro/storage. */
const awsSdkAllowedPackages = new Set(["storage"]);

const forbiddenImportPatterns = [
  /from\s+["']@kivro\/cloud-netsons["']/,
  /from\s+["']@kivro\/cloud-aws["']/,
  /from\s+["'][^"']*cloud-netsons[^"']*["']/,
  /from\s+["'][^"']*cloud-aws[^"']*["']/,
  /import\s+["']@aws-sdk\//,
];

for (const pkg of sharedPackages) {
  const src = path.join(sharedDir, pkg, "src");
  if (!fs.existsSync(src)) continue;
  walk(src, pkg);
}

function walk(dir, pkgName) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, pkgName);
    else if (entry.name.endsWith(".ts")) {
      const text = fs.readFileSync(full, "utf8");
      for (const pattern of forbiddenImportPatterns) {
        if (pattern.source.includes("@aws-sdk") && awsSdkAllowedPackages.has(pkgName)) {
          continue;
        }
        if (pattern.test(text)) {
          violations.push(`${full} forbidden import pattern ${pattern}`);
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
