// Frame-rate and main-thread measurement on an emulated phone.
//
//   AUDIT_TOOLS=~/nevima-audit-tools node audit/measure.mjs --cpu 4 --label baseline
//
// Runs against a production server (next build && next start) at BASE_URL.
// Every scenario starts from a fresh page, scrolls with real touch gestures
// (CDP Input.synthesizeScrollGesture, so the compositor scrolls the way a
// finger does), and records three things over the scenario's window:
//
//   1. page side: every requestAnimationFrame interval, long tasks, layout
//      shifts and event timings (for interaction latency);
//   2. a Chrome trace: frames presented vs dropped (PipelineReporter), and
//      where the main thread's time went (script, style, layout, paint...);
//   3. CDP Performance.getMetrics deltas.
//
// Results go to audit/results/<label>-cpu<rate>.json and a table is printed.
// The same scenarios, in the same order, with the same gestures, every time.
import fs from "node:fs";
import path from "node:path";
import { toolRequire, CHROME, BASE, PHONE, arg, sleep, pct } from "./lib.mjs";
import { standInForUnsplash } from "./stand-in.mjs";

const { chromium } = toolRequire("playwright-core");

const CPU = Number(arg("cpu", "4"));
const LABEL = arg("label", "baseline");
const ONLY = arg("only", "");
const RUNS = Number(arg("runs", "1"));
// WebGL off by default: this sandbox has no GPU, so WebGL runs in software
// (SwiftShader) and each frame of the second screen's water blocks the main
// thread for ~850 ms, which says nothing about a phone. With WebGL off the
// three canvases (the water, the footer's lens, the about page's values)
// simply do not start, and what is left is the DOM/CSS/JS cost, which CPU
// throttling does model. The WebGL cost is checked on a real phone.
const WEBGL = arg("webgl", "off") === "on";
// What-if experiments: a stylesheet laid over the page at runtime (nothing
// in the project changes), to price a fix before making it.
const INJECT = arg("inject", "");
const INJECT_CSS = INJECT ? fs.readFileSync(INJECT, "utf8") : "";
const INIT = arg("init", "");
const INIT_JS = INIT ? fs.readFileSync(INIT, "utf8") : "";
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), "results");

const TRACE_CATEGORIES = [
  "devtools.timeline",
  "disabled-by-default-devtools.timeline",
  "disabled-by-default-devtools.timeline.frame",
  "toplevel",
  "benchmark",
  "cc",
  "viz",
  "blink",
  "loading",
].join(",");

/* Installed before any page script: the probe the scenarios read back. */
const PROBE = () => {
  const p = (window.__probe = { on: false, frames: [], longtasks: [], shifts: [], events: [] });
  const raf = (t) => {
    if (p.on) p.frames.push(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (p.on) p.longtasks.push({ start: e.startTime, dur: e.duration });
    }).observe({ type: "longtask", buffered: false });
  } catch {}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) p.shifts.push({ t: e.startTime, v: e.value, input: e.hadRecentInput });
    }).observe({ type: "layout-shift", buffered: true });
  } catch {}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        if (p.on) p.events.push({ name: e.name, dur: e.duration, id: e.interactionId });
    }).observe({ type: "event", durationThreshold: 16, buffered: false });
  } catch {}
};

/* ------------------------------------------------------------------ */

async function touchScroll(cdp, { dy, x = 206, y = 700, speed = 1200, repeat = 1, gap = 250 }) {
  // Negative yDistance scrolls the page down (finger moves up).
  await cdp.send("Input.synthesizeScrollGesture", {
    x,
    y,
    yDistance: -dy,
    speed,
    gestureSourceType: "touch",
    repeatCount: repeat,
    repeatDelayMs: gap,
    preventFling: false,
  });
}

async function openHome(page, url = "/") {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await sleep(1200);
}

/** The opening is waiting for its trigger: a tap on the black. */
async function runOpening(page) {
  await page.mouse.click(206, 300);
  await sleep(2600);
}

/** Section top in page coordinates. */
const topOf = (page, sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  }, sel);

const SCENARIOS = [
  {
    id: "opening",
    title: "Opening (tap → mark flight → curtain lifts)",
    setup: async ({ page }) => openHome(page),
    run: async ({ page }) => {
      await page.mouse.click(206, 300);
      await sleep(2600);
    },
  },
  {
    id: "second-screen-idle",
    title: "Second screen at rest (water + rotating headline)",
    setup: async ({ page }) => {
      await openHome(page);
      await runOpening(page);
    },
    run: async () => sleep(4000),
  },
  {
    id: "gateway",
    title: "Gateway: swipe draws the studio up over the second screen",
    setup: async ({ page }) => {
      await openHome(page);
      await runOpening(page);
    },
    run: async ({ cdp }) => {
      await touchScroll(cdp, { dy: 300, speed: 900, repeat: 3, gap: 350 });
      await sleep(1500);
    },
  },
  {
    id: "studio-services",
    title: "Scroll through studio and services",
    setup: async ({ page, cdp }) => {
      await openHome(page);
      await runOpening(page);
      await touchScroll(cdp, { dy: 300, speed: 900, repeat: 4, gap: 350 });
      await sleep(1800);
    },
    run: async ({ cdp }) => {
      await touchScroll(cdp, { dy: 500, speed: 1400, repeat: 6, gap: 300 });
      await sleep(1200);
    },
  },
  {
    id: "how-we-work-scroll",
    title: "How we work: the row slides while the page scrolls",
    setup: async ({ page }) => {
      // The site's own deep link (about page FAQ): opening runs, then the
      // page is put at the start of the section.
      await openHome(page, "/#process");
      await sleep(4500);
    },
    run: async ({ cdp }) => {
      await touchScroll(cdp, { dy: 450, speed: 1200, repeat: 8, gap: 250 });
      await sleep(1000);
    },
  },
  {
    id: "how-we-work-idle",
    title: "How we work at rest, mid-row (cost of what keeps running)",
    setup: async ({ page, cdp }) => {
      await openHome(page, "/#process");
      await sleep(4500);
      await touchScroll(cdp, { dy: 600, speed: 1200, repeat: 1 });
      await sleep(1500);
    },
    run: async () => sleep(4000),
  },
  {
    id: "how-we-work-chip",
    title: "How we work: tap the four extra-service chips (interaction latency)",
    setup: async ({ page }) => {
      await openHome(page, "/#process");
      await sleep(4500);
    },
    run: async ({ page }) => {
      for (const i of [0, 1, 2, 3]) {
        await page.locator(".prc-chip").nth(i).tap();
        await sleep(600);
      }
    },
  },
  {
    id: "lower-sections",
    title: "Comparison → work together → footer",
    setup: async ({ page }) => {
      await openHome(page);
      await runOpening(page);
      const y = await topOf(page, ".cmp-section");
      await page.evaluate((y) => window.scrollTo(0, y - 200), y ?? 0);
      await sleep(1500);
    },
    run: async ({ cdp }) => {
      await touchScroll(cdp, { dy: 600, speed: 1400, repeat: 7, gap: 300 });
      await sleep(1000);
    },
  },
  {
    id: "about-scroll",
    title: "About page: scroll top to bottom",
    setup: async ({ page }) => {
      await page.goto(BASE + "/about", { waitUntil: "networkidle" });
      await sleep(1500);
    },
    run: async ({ cdp }) => {
      await touchScroll(cdp, { dy: 600, speed: 1400, repeat: 10, gap: 300 });
      await sleep(1000);
    },
  },
  {
    id: "service-scroll",
    title: "Service page (SEO): scroll top to bottom",
    setup: async ({ page }) => {
      await page.goto(BASE + "/services/seo", { waitUntil: "networkidle" });
      await sleep(1500);
    },
    run: async ({ cdp }) => {
      await touchScroll(cdp, { dy: 600, speed: 1400, repeat: 8, gap: 300 });
      await sleep(1000);
    },
  },
  {
    id: "portfolio-idle",
    title: "Portfolio at rest",
    setup: async ({ page }) => {
      await page.goto(BASE + "/portfolio", { waitUntil: "networkidle" });
      await sleep(2500);
    },
    run: async () => sleep(4000),
  },
];

/* ------------------------------------------------------------------ */

function analyseTrace(trace) {
  const events = trace.traceEvents ?? trace;
  const threads = new Map();
  for (const e of events) {
    if (e.ph === "M" && e.name === "thread_name") threads.set(`${e.pid}:${e.tid}`, e.args.name);
  }
  // The page's main thread: the CrRendererMain that did the most work.
  const busy = new Map();
  for (const e of events) {
    const key = `${e.pid}:${e.tid}`;
    if (threads.get(key) === "CrRendererMain" && e.ph === "X" && e.name === "RunTask")
      busy.set(key, (busy.get(key) ?? 0) + (e.dur ?? 0));
  }
  const main = [...busy.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const mainPid = main?.split(":")[0];

  const NAMES = [
    "RunTask",
    "FunctionCall",
    "FireAnimationFrame",
    "TimerFire",
    "EventDispatch",
    "UpdateLayoutTree",
    "Layout",
    "PrePaint",
    "Paint",
    "Layerize",
    "Commit",
    "HitTest",
    "MajorGC",
    "MinorGC",
    "V8.GC_SCAVENGER",
  ];
  const byName = Object.fromEntries(NAMES.map((n) => [n, 0]));
  let paints = 0;
  let raster = 0;
  let gpu = 0;
  let ts0 = Infinity;
  let ts1 = 0;
  for (const e of events) {
    const key = `${e.pid}:${e.tid}`;
    if (e.ph !== "X") continue;
    if (key === main) {
      if (e.name in byName) byName[e.name] += e.dur ?? 0;
      if (e.name === "Paint") paints++;
      if (e.name === "RunTask") {
        ts0 = Math.min(ts0, e.ts);
        ts1 = Math.max(ts1, e.ts + (e.dur ?? 0));
      }
    }
    const tn = threads.get(key) ?? "";
    // Raster runs on the renderer's tile workers or, with GPU raster, in
    // the GPU process: counted wherever it happens.
    if (e.name === "RasterTask" || e.name === "GpuRasterization") raster += e.dur ?? 0;
    if (/CrGpuMain|VizCompositorThread/.test(tn) && e.name === "RunTask") gpu += e.dur ?? 0;
  }

  // Frames, as DevTools counts them: each PipelineReporter is one frame
  // the compositor was due to produce (a frame can be reported twice, the
  // main-thread fork and the compositor's; it counts once, by sequence).
  const bySeq = new Map();
  for (const e of events) {
    if (e.name !== "PipelineReporter" || e.ph !== "b" || String(e.pid) !== String(mainPid)) continue;
    const fr = e.args?.frame_reporter ?? e.args?.chrome_frame_reporter ?? {};
    const seq = fr.frame_sequence;
    const s = fr.state ?? "unknown";
    const rank = { STATE_PRESENTED_ALL: 3, STATE_PRESENTED_PARTIAL: 2, STATE_DROPPED: 1 }[s] ?? 0;
    const was = bySeq.get(seq);
    if (!was || rank > was.rank) bySeq.set(seq, { s, rank });
  }
  const states = {};
  for (const { s } of bySeq.values()) states[s] = (states[s] ?? 0) + 1;

  // What gets repainted, and how often: the nodes behind the Paint and
  // PaintImage events on the main thread.
  const painted = {};
  for (const e of events) {
    if (`${e.pid}:${e.tid}` !== main || e.ph !== "X") continue;
    if (e.name !== "Paint" && e.name !== "PaintImage") continue;
    const n = (e.args?.data?.nodeName ?? "?").slice(0, 90);
    const k = `${e.name}: ${n}`;
    painted[k] = painted[k] ?? { count: 0, ms: 0 };
    painted[k].count++;
    painted[k].ms += (e.dur ?? 0) / 1000;
  }
  const topPainted = Object.entries(painted)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12)
    .map(([k, v]) => ({ node: k, count: v.count, ms: Math.round(v.ms * 10) / 10 }));
  const ms = (us) => Math.round(us / 100) / 10;
  return {
    mainThreadMs: Object.fromEntries(Object.entries(byName).map(([k, v]) => [k, ms(v)])),
    paintCount: paints,
    rasterMs: ms(raster),
    gpuProcessMs: ms(gpu),
    frameStates: states,
    topPainted,
  };
}

function summariseFrames(frames, windowMs) {
  const gaps = [];
  for (let i = 1; i < frames.length; i++) gaps.push(frames[i] - frames[i - 1]);
  const sorted = [...gaps].sort((a, b) => a - b);
  const total = frames.length > 1 ? frames.at(-1) - frames[0] : windowMs;
  const r = (n) => Math.round(n * 10) / 10;
  return {
    rafFps: r(((frames.length - 1) / total) * 1000),
    p50Ms: r(pct(sorted, 50)),
    p95Ms: r(pct(sorted, 95)),
    worstMs: r(sorted.at(-1) ?? 0),
    over33Pct: r((gaps.filter((g) => g > 33.4).length / Math.max(1, gaps.length)) * 100),
    over50Pct: r((gaps.filter((g) => g > 50).length / Math.max(1, gaps.length)) * 100),
  };
}

async function runScenario(browser, sc) {
  const context = await browser.newContext({ ...PHONE });
  await context.addInitScript(PROBE);
  if (INIT_JS) await context.addInitScript({ content: INIT_JS });
  if (INJECT_CSS)
    await context.addInitScript((css) => {
      const add = () => {
        const s = document.createElement("style");
        s.setAttribute("data-audit-inject", "");
        s.textContent = css;
        document.head.appendChild(s);
      };
      if (document.head) add();
      else document.addEventListener("DOMContentLoaded", add);
    }, INJECT_CSS);
  await standInForUnsplash(context);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  await sc.setup({ page, cdp });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
  const m0 = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  await browser.startTracing(page, { categories: TRACE_CATEGORIES.split(",") });
  await page.evaluate(() => (window.__probe.on = true));
  const t0 = Date.now();
  await sc.run({ page, cdp });
  const windowMs = Date.now() - t0;
  const probe = await page.evaluate(() => {
    window.__probe.on = false;
    return window.__probe;
  });
  const traceBuf = await browser.stopTracing();
  const m1 = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  if (process.env.SAVE_TRACE) fs.writeFileSync(path.join(OUT, `trace-${sc.id}.json`), traceBuf);
  const trace = analyseTrace(JSON.parse(traceBuf.toString()));
  const d = (k) => Math.round((m1[k] - m0[k]) * 10000) / 10;
  const presented =
    (trace.frameStates.STATE_PRESENTED_ALL ?? 0) + (trace.frameStates.STATE_PRESENTED_PARTIAL ?? 0);
  const dropped = trace.frameStates.STATE_DROPPED ?? 0;
  const res = {
    id: sc.id,
    title: sc.title,
    windowMs,
    frames: summariseFrames(probe.frames, windowMs),
    compositor: {
      presentedFps: Math.round((presented / windowMs) * 10000) / 10,
      droppedPct: Math.round((dropped / Math.max(1, presented + dropped)) * 1000) / 10,
      states: trace.frameStates,
    },
    longTasks: {
      count: probe.longtasks.length,
      blockingMs: Math.round(probe.longtasks.reduce((s, t) => s + Math.max(0, t.dur - 50), 0)),
      longestMs: Math.round(Math.max(0, ...probe.longtasks.map((t) => t.dur))),
    },
    interactions: probe.events
      .filter((e) => e.id)
      .reduce((m, e) => ({ ...m, [e.id]: Math.max(m[e.id] ?? 0, e.dur) }), {}),
    cls: Math.round(probe.shifts.filter((s) => !s.input).reduce((s, x) => s + x.v, 0) * 10000) / 10000,
    cdp: {
      taskMs: d("TaskDuration"),
      scriptMs: d("ScriptDuration"),
      layoutMs: d("LayoutDuration"),
      styleMs: d("RecalcStyleDuration"),
      layoutCount: m1.LayoutCount - m0.LayoutCount,
      styleCount: m1.RecalcStyleCount - m0.RecalcStyleCount,
    },
    trace,
  };
  await context.close();
  return res;
}

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--enable-gpu-rasterization", "--ignore-gpu-blocklist", ...(WEBGL ? [] : ["--disable-webgl", "--disable-webgl2"])],
});
const results = [];
for (const sc of SCENARIOS) {
  if (ONLY && !ONLY.split(",").includes(sc.id)) continue;
  for (let r = 0; r < RUNS; r++) {
    process.stdout.write(`${sc.id} (run ${r + 1}/${RUNS}) ... `);
    try {
      const res = await runScenario(browser, sc);
      results.push({ ...res, run: r + 1 });
      console.log(
        `raf ${res.frames.rafFps}fps p95 ${res.frames.p95Ms}ms >33ms ${res.frames.over33Pct}% | presented ${res.compositor.presentedFps}fps dropped ${res.compositor.droppedPct}% | main busy ${res.trace.mainThreadMs.RunTask}ms paint ${res.trace.mainThreadMs.Paint}ms (${res.trace.paintCount}) | LT ${res.longTasks.count}/${res.longTasks.blockingMs}ms`,
      );
    } catch (err) {
      console.log("FAILED", err.message);
      results.push({ id: sc.id, error: err.message });
    }
  }
}
await browser.close();

fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, `${LABEL}-cpu${CPU}${WEBGL ? "-webgl" : ""}.json`);
fs.writeFileSync(
  file,
  JSON.stringify({ label: LABEL, cpu: CPU, webgl: WEBGL, inject: INJECT || null, init: INIT || null, base: BASE, phone: PHONE, date: new Date().toISOString(), results }, null, 2),
);
console.log(`\nSaved ${file}`);
