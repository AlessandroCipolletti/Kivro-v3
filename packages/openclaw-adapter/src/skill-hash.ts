import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function hashDirectory(dir: string): string {
  const hash = createHash("sha256");
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    hash.update(entry.name);
    if (entry.isDirectory()) {
      hash.update(hashDirectory(full));
    } else if (entry.isFile()) {
      hash.update(fs.readFileSync(full));
    }
  }
  return `sha256:${hash.digest("hex")}`;
}

/** Best-effort skill content hash from OpenClaw skill folder (§32 supply-chain). */
export function hashOpenClawSkill(skillName: string, openClawHome?: string): string {
  const home = openClawHome ?? path.join(process.env.HOME ?? "", ".openclaw");
  const candidates = [
    path.join(home, "skills", skillName),
    path.join(home, "workspace", "skills", skillName),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      return hashDirectory(dir);
    }
  }
  const fallback = createHash("sha256").update(`skill-name:${skillName}`).digest("hex");
  return `sha256:${fallback}`;
}
