import fs from "node:fs";
import path from "node:path";

export function evidencePaths(cell) {
  if (!cell || cell === "---") return [];
  return cell
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function looksLikeRepoPath(token) {
  const t = token.split(/\s+/)[0];
  if (["vitest", "prisma", "pnpm", "---", "post-MVP", "security/tests"].includes(t)) {
    return false;
  }
  return (
    /^(apps|packages|docs|scripts|security|tests|\.github)\//.test(t) ||
    t.endsWith(".md") ||
    t.endsWith(".ts")
  );
}

export function pathExists(root, rel) {
  const token = rel.split(/\s+/)[0];
  const candidates = [token];
  const pkgFile = token.match(/^packages\/([^/]+)\/([^/]+\.(ts|tsx|mjs|md))$/);
  if (pkgFile) {
    candidates.push(`packages/${pkgFile[1]}/src/${pkgFile[2]}`);
  }
  const apiRoute = token.match(/^apps\/api\/routes\/(.+)$/);
  if (apiRoute) {
    candidates.push(`apps/api/src/routes/${apiRoute[1]}`);
  }
  if (token === "apps/api/server.ts") {
    candidates.push("apps/api/src/server.ts");
  }
  if (/^packages\/[^/]+$/.test(token)) {
    candidates.push(`${token}/package.json`);
  }
  if (/^apps\/[^/]+$/.test(token)) {
    candidates.push(`${token}/package.json`);
  }
  return candidates.some((c) => fs.existsSync(path.join(root, c)));
}
