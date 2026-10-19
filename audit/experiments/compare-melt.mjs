// Pixel check of the compositor-melt prototype against the real drops (or,
// with REAL_URL and PROTO_URL, of two builds against each other):
// the same page, the same moments of the drops' loops (every animation on
// the page set to the same currentTime), cropped to the drops, diffed.
//   AUDIT_TOOLS=... node audit/experiments/compare-melt.mjs <outdir>
import fs from "node:fs";
import path from "node:path";
import { toolRequire, CHROME, BASE } from "../lib.mjs";
import { standInForUnsplash } from "../stand-in.mjs";
const { chromium } = toolRequire("playwright-core");
const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const css = fs.readFileSync(path.join(HERE, "compositor-melt.css"), "utf8");
const js = fs.readFileSync(path.join(HERE, "compositor-melt.js"), "utf8");
const TIMES = [0, 1700, 3800, 6100, 9300, 14200];
const browser = await chromium.launch({ executablePath: CHROME, args: ["--disable-webgl", "--disable-webgl2"] });
const shots = {};
for (const variant of ["real", "proto"]) {
  for (const [page_, vp] of [["/portfolio", { width: 1440, height: 900 }], ["/#process", { width: 1440, height: 900 }]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
    await standInForUnsplash(ctx);
    const base = (variant === "real" ? process.env.REAL_URL : process.env.PROTO_URL) || BASE;
    if (variant === "proto" && !process.env.PROTO_URL) {
      await ctx.addInitScript({ content: js });
      await ctx.addInitScript((c) => document.addEventListener("DOMContentLoaded", () => { const s = document.createElement("style"); s.textContent = c; document.head.appendChild(s); }), css);
    }
    const p = await ctx.newPage();
    await p.goto(base + page_, { waitUntil: "networkidle" });
    await p.waitForTimeout(page_.includes("process") ? 5000 : 2500);
    const boxes = await p.evaluate(() => [...document.querySelectorAll(".cta-drop")].map((el) => el.getBoundingClientRect()).filter((r) => r.width && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth).map((r) => ({ x: Math.max(0, r.left - 30), y: Math.max(0, r.top - 30), width: r.width + 60, height: r.height + 60 })));
    for (const t of TIMES) {
      await p.evaluate((t) => {
        for (const a of document.getAnimations()) {
          const n = a.animationName ?? a.effect?.target?.className ?? "";
          a.pause();
          a.currentTime = /cta-melt|nv-melt|drop-tilt|drop-breathe/.test(a.animationName ?? "") ? t : a.currentTime;
          a.effect?.target?.closest?.("[data-offscreen]")?.removeAttribute("data-offscreen");
        }
      }, t);
      await p.waitForTimeout(100);
      for (const [i, clip] of boxes.entries()) {
        const name = `${page_.replace(/[^a-z]/g, "") || "home"}-drop${i}-t${t}`;
        const file = path.join(OUT, `${variant}-${name}.png`);
        await p.screenshot({ path: file, clip });
        (shots[name] ??= {})[variant] = file;
      }
    }
    await ctx.close();
  }
}
// Diff in the browser.
const page = await browser.newPage();
const rows = [];
for (const [name, v] of Object.entries(shots)) {
  if (!v.real || !v.proto) continue;
  const r = await page.evaluate(async ([a, b]) => {
    const load = (s) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = s; });
    const [i1, i2] = await Promise.all([load(a), load(b)]);
    const c = document.createElement("canvas"); c.width = i1.width; c.height = i1.height;
    const g = c.getContext("2d"); g.drawImage(i1, 0, 0); const d1 = g.getImageData(0, 0, c.width, c.height).data;
    g.drawImage(i2, 0, 0); const d2 = g.getImageData(0, 0, c.width, c.height).data;
    let max = 0, n8 = 0, n24 = 0;
    for (let k = 0; k < d1.length; k += 4) {
      const d = Math.max(Math.abs(d1[k] - d2[k]), Math.abs(d1[k + 1] - d2[k + 1]), Math.abs(d1[k + 2] - d2[k + 2]));
      if (d > max) max = d; if (d > 8) n8++; if (d > 24) n24++;
    }
    return { max, over8: n8, over24: n24, total: d1.length / 4 };
  }, ["data:image/png;base64," + fs.readFileSync(v.real).toString("base64"), "data:image/png;base64," + fs.readFileSync(v.proto).toString("base64")]);
  rows.push({ name, ...r });
  console.log(`${name.padEnd(28)} max channel diff ${String(r.max).padStart(3)}  px>8: ${r.over8}  px>24: ${r.over24} of ${r.total}`);
}
fs.writeFileSync(path.join(OUT, "compare.json"), JSON.stringify(rows, null, 2));
await browser.close();
