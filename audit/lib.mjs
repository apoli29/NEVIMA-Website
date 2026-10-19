// Shared helpers for the audit scripts. Nothing here is part of the site.
// The tools (playwright-core, lighthouse) are not project dependencies: they
// are installed in a folder outside the repo and found through AUDIT_TOOLS,
// e.g.  npm i --prefix ~/nevima-audit-tools playwright-core@1.56.1 lighthouse@12
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const toolsDir = process.env.AUDIT_TOOLS;
if (!toolsDir) {
  console.error("Set AUDIT_TOOLS to the folder where playwright-core and lighthouse are installed.");
  process.exit(1);
}
export const toolRequire = createRequire(path.join(path.resolve(toolsDir), "package.json"));

export const CHROME =
  process.env.CHROME_PATH ||
  ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find((p) => fs.existsSync(p));

export const BASE = process.env.BASE_URL || "http://localhost:3000";

/** A mid-range Android phone (Pixel 7 class): what the numbers are taken on. */
export const PHONE = {
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
};

export function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function pct(sorted, p) {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}
