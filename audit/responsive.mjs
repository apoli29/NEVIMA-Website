// Responsive check: every page at every width, phones also in landscape.
//
//   AUDIT_TOOLS=~/nevima-audit-tools node audit/responsive.mjs [--out audit/screens/responsive] [--pages /,/about]
//
// For each page and viewport it scrolls to the top of every section (and
// through the tall, pinned ones), takes a viewport screenshot and runs the
// same checks at each stop:
//   - horizontal overflow of the page (scrollWidth > clientWidth), and the
//     elements that stick out past the right edge unclipped;
//   - visible text under 12px;
//   - tap targets under 24×24 CSS px (WCAG 2.2 AA) and under 44×44 (the
//     size Apple and Google recommend), on touch viewports;
//   - images drawn at an aspect ratio other than their own (stretched);
//   - text cut off by an overflow:hidden box.
// Findings go to <out>/report.json; screenshots to <out>/<page>/<viewport>-<n>.png.
import fs from "node:fs";
import path from "node:path";
import { toolRequire, CHROME, BASE, arg, sleep } from "./lib.mjs";
import { standInForUnsplash } from "./stand-in.mjs";

const { chromium } = toolRequire("playwright-core");
const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.resolve(arg("out", path.join(HERE, "screens", "responsive")));
const PAGES = arg("pages", "/,/pt,/about,/services/seo,/services/visual-identity,/portfolio").split(",");
const SHOTS = arg("shots", "on") === "on";

const VIEWPORTS = [
  { name: "320x568", width: 320, height: 568, touch: true, dpr: 2 },
  { name: "360x740", width: 360, height: 740, touch: true, dpr: 3 },
  { name: "390x844", width: 390, height: 844, touch: true, dpr: 3 },
  { name: "414x896", width: 414, height: 896, touch: true, dpr: 2 },
  { name: "568x320-land", width: 568, height: 320, touch: true, dpr: 2 },
  { name: "844x390-land", width: 844, height: 390, touch: true, dpr: 3 },
  { name: "768x1024", width: 768, height: 1024, touch: true, dpr: 2 },
  { name: "1024x768", width: 1024, height: 768, touch: true, dpr: 2 },
  { name: "1280x800", width: 1280, height: 800, touch: false, dpr: 1 },
  { name: "1440x900", width: 1440, height: 900, touch: false, dpr: 1 },
  { name: "1920x1080", width: 1920, height: 1080, touch: false, dpr: 1 },
  { name: "2560x1440", width: 2560, height: 1440, touch: false, dpr: 1 },
];
const ONLY_VP = arg("viewports", "");

/* Runs in the page: what is wrong at this scroll position. */
function inspect(touch) {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const out = { overflowX: 0, sticking: [], tiny: [], targets: [], stretched: [], clipped: [] };
  out.overflowX = Math.max(0, document.documentElement.scrollWidth - vw);
  const label = (el) => {
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
    const txt = (el.innerText || el.getAttribute?.("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${cls ? "." + cls : ""}${txt ? ` "${txt}"` : ""}`;
  };
  const visible = (el, r) => {
    if (r.width === 0 || r.height === 0) return false;
    if (r.bottom < 0 || r.top > vh) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return false;
    for (let a = el; a; a = a.parentElement) {
      if (a.getAttribute?.("aria-hidden") === "true" && a !== el && a.tagName !== "svg") {
        /* still drawn; keep */
      }
      if (Number(getComputedStyle(a).opacity) === 0) return false;
    }
    return true;
  };
  const clippedByAncestor = (el) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(hidden|clip|auto|scroll)/.test(cs.overflowX) || cs.contain.includes("paint")) {
        const r = a.getBoundingClientRect();
        if (r.right <= vw + 1) return true;
      }
      if (cs.position === "fixed") return false;
    }
    return false;
  };
  for (const el of document.body.querySelectorAll("*")) {
    if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // Sticking out past the right edge, not clipped by anything.
    if (out.overflowX > 0 && r.right > vw + 1 && !clippedByAncestor(el)) {
      out.sticking.push({ el: label(el), right: Math.round(r.right), vw });
    }
    if (!visible(el, r)) continue;
    // Tiny text: an element that holds text of its own.
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (ownText) {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 12) out.tiny.push({ el: label(el), px: Math.round(fs * 10) / 10 });
      if (el.scrollWidth > el.clientWidth + 1 && /(hidden|clip)/.test(getComputedStyle(el).overflowX) && getComputedStyle(el).textOverflow !== "ellipsis") {
        out.clipped.push({ el: label(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });
      }
    }
    if (touch && el.matches("a[href], button, [role=button], input, select, textarea, summary, label[for]")) {
      if (el.closest("[inert]")) continue;
      const small = r.width < 24 || r.height < 24 ? "<24" : r.width < 44 || r.height < 44 ? "<44" : null;
      if (small) out.targets.push({ el: label(el), w: Math.round(r.width), h: Math.round(r.height), small });
    }
    if (el.tagName === "IMG" && el.naturalWidth && el.naturalHeight) {
      const fit = getComputedStyle(el).objectFit;
      if (fit === "fill" || fit === "") {
        const want = el.naturalWidth / el.naturalHeight;
        const got = r.width / r.height;
        if (Math.abs(got / want - 1) > 0.02 && !el.src.endsWith(".svg"))
          out.stretched.push({ el: label(el), natural: want.toFixed(3), drawn: got.toFixed(3) });
      }
    }
  }
  return out;
}

/** Where to stop on a page: the top of each section, and through tall ones. */
function stops() {
  const vh = window.innerHeight;
  const ys = new Set([0]);
  const els = document.querySelectorAll("section, footer, #contact, [id=work-together]");
  for (const el of els) {
    if (el.parentElement?.closest("section")) continue;
    const r = el.getBoundingClientRect();
    const top = Math.round(r.top + window.scrollY);
    ys.add(Math.max(0, top));
    if (r.height > vh * 1.5) {
      ys.add(Math.round(top + (r.height - vh) / 2));
      ys.add(Math.round(top + r.height - vh));
    }
  }
  ys.add(document.documentElement.scrollHeight - vh);
  const sorted = [...ys].sort((a, b) => a - b);
  const kept = [];
  for (const y of sorted) if (!kept.length || y - kept.at(-1) > vh * 0.3) kept.push(y);
  return kept.slice(0, 16);
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--disable-webgl", "--disable-webgl2"] });
const report = [];
for (const vp of VIEWPORTS) {
  if (ONLY_VP && !ONLY_VP.split(",").includes(vp.name)) continue;
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.touch && vp.width < 1024,
    hasTouch: vp.touch,
  });
  await standInForUnsplash(context);
  for (const p of PAGES) {
    const page = await context.newPage();
    const entry = { page: p, viewport: vp.name, stops: [] };
    try {
      await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 30000 });
      await sleep(800);
      if (p === "/" || p === "/pt") {
        // The opening waits for its trigger.
        await page.mouse.click(Math.round(vp.width / 2), Math.round(vp.height / 3));
        await sleep(2800);
      }
      await page.evaluate(() => document.fonts.ready);
      const ys = await page.evaluate(stops);
      const dir = path.join(OUT, p === "/" ? "home" : p.replace(/^\//, "").replace(/\//g, "_"));
      fs.mkdirSync(dir, { recursive: true });
      for (const [i, y] of ys.entries()) {
        await page.evaluate((y) => window.scrollTo(0, y), y);
        await sleep(800);
        const found = await page.evaluate(inspect, vp.touch);
        entry.stops.push({ y, ...found });
        if (SHOTS) await page.screenshot({ path: path.join(dir, `${vp.name}-${String(i).padStart(2, "0")}.png`) });
      }
    } catch (err) {
      entry.error = err.message;
    }
    report.push(entry);
    const issues = entry.stops.reduce(
      (s, x) => ({
        overflow: Math.max(s.overflow, x.overflowX),
        tiny: s.tiny + x.tiny.length,
        targets: s.targets + x.targets.filter((t) => t.small === "<24").length,
        stretched: s.stretched + x.stretched.length,
        clipped: s.clipped + x.clipped.length,
      }),
      { overflow: 0, tiny: 0, targets: 0, stretched: 0, clipped: 0 },
    );
    console.log(`${vp.name.padEnd(13)} ${p.padEnd(26)} stops ${entry.stops.length} ${entry.error ? "ERROR " + entry.error : JSON.stringify(issues)}`);
    await page.close();
  }
  await context.close();
}
await browser.close();
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(`Saved ${path.join(OUT, "report.json")}`);
