// Lighthouse, mobile preset (Moto G Power class, simulated slow 4G, 4x CPU),
// on each route of the production build.
//
//   AUDIT_TOOLS=... node audit/lighthouse.mjs --label baseline [--runs 3]
//
// Writes audit/results/lighthouse-<label>.json (the median run per route by
// performance score) and prints a table. The home page's LCP is taken with
// the opening waiting for its trigger, as a first visit is.
import fs from "node:fs";
import path from "node:path";
import { toolRequire, CHROME, BASE, arg } from "./lib.mjs";

const lighthouse = (await import(toolRequire.resolve("lighthouse"))).default;
const chromeLauncher = await import(toolRequire.resolve("chrome-launcher"));

const LABEL = arg("label", "baseline");
const RUNS = Number(arg("runs", "3"));
const ROUTES = arg("routes", "/,/pt,/about,/services/seo,/portfolio").split(",");
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), "results");

const chrome = await chromeLauncher.launch({
  chromePath: CHROME,
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const pick = (lhr) => {
  const a = lhr.audits;
  const n = (id) => a[id]?.numericValue;
  return {
    score: Math.round((lhr.categories.performance.score ?? 0) * 100),
    fcpMs: Math.round(n("first-contentful-paint")),
    lcpMs: Math.round(n("largest-contentful-paint")),
    tbtMs: Math.round(n("total-blocking-time")),
    cls: Math.round(n("cumulative-layout-shift") * 1000) / 1000,
    siMs: Math.round(n("speed-index")),
    ttiMs: Math.round(n("interactive")),
    bootupMs: Math.round(n("bootup-time")),
    mainThreadMs: Math.round(n("mainthread-work-breakdown")),
    jsKB: Math.round(
      (a["resource-summary"]?.details?.items?.find((i) => i.resourceType === "script")?.transferSize ?? 0) / 1024,
    ),
    totalKB: Math.round((n("total-byte-weight") ?? 0) / 1024),
    domSize: n("dom-size"),
    lcpElement: a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet ?? null,
    unusedJsKB: Math.round((a["unused-javascript"]?.details?.overallSavingsBytes ?? 0) / 1024),
    unusedCssKB: Math.round((a["unused-css-rules"]?.details?.overallSavingsBytes ?? 0) / 1024),
    nonComposited: a["non-composited-animations"]?.details?.items?.length ?? 0,
    longTasks: a["long-tasks"]?.details?.items?.length ?? 0,
  };
};

const results = {};
for (const route of ROUTES) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    const r = await lighthouse(BASE + route, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance"],
      // The services' photos live on images.unsplash.com, which the audit
      // sandbox cannot reach; they are left out rather than timed out.
      blockedUrlPatterns: process.env.REAL_UNSPLASH ? [] : ["*images.unsplash.com*"],
    });
    runs.push(pick(r.lhr));
    if (i === 0) {
      const a = r.lhr.audits;
      runs[0].nonCompositedDetail = (a["non-composited-animations"]?.details?.items ?? []).map((it) => ({
        node: it.node?.snippet?.slice(0, 120),
        why: (it.subItems?.items ?? []).map((s) => s.failureReason).slice(0, 4),
      }));
    }
  }
  runs.sort((x, y) => x.score - y.score);
  results[route] = { median: runs[Math.floor(runs.length / 2)], runs };
  const m = results[route].median;
  console.log(
    `${route.padEnd(16)} score ${m.score}  FCP ${m.fcpMs}  LCP ${m.lcpMs}  TBT ${m.tbtMs}  CLS ${m.cls}  SI ${m.siMs}  JS ${m.jsKB}KB  total ${m.totalKB}KB  DOM ${m.domSize}`,
  );
}
await chrome.kill();
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, `lighthouse-${LABEL}.json`), JSON.stringify({ label: LABEL, date: new Date().toISOString(), results }, null, 2));
console.log(`Saved ${path.join(OUT, `lighthouse-${LABEL}.json`)}`);
