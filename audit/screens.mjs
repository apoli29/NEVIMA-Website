// Deterministic screenshots for before/after comparison.
//
//   AUDIT_TOOLS=... node audit/screens.mjs --out audit/screens/before
//   AUDIT_TOOLS=... node audit/screens.mjs --out audit/screens/after
//   AUDIT_TOOLS=... node audit/screens.mjs --compare audit/screens/before audit/screens/after
//
// Time is frozen and stepped by hand (Playwright's clock: Date, timers,
// requestAnimationFrame and performance.now), so JS-driven motion (Motion,
// Lenis, the opening's clock, the rotating headline, the drops) lands on
// exactly the same frame every run. CSS animations and Web Animations are
// then held at a fixed moment (infinite ones at a set time, finite ones at
// their end). Each shot is taken at a named moment: mid-opening frames, the
// second screen, and each section on its way through, at several viewports.
//
// The compare mode diffs the two folders pixel by pixel in the browser and
// writes a diff image for any shot that differs.
import fs from "node:fs";
import path from "node:path";
import { toolRequire, CHROME, BASE, arg, sleep } from "./lib.mjs";
import { standInForUnsplash } from "./stand-in.mjs";

const { chromium } = toolRequire("playwright-core");
const HERE = path.dirname(new URL(import.meta.url).pathname);

const VIEWPORTS = [
  { name: "phone-360", width: 360, height: 740, touch: true },
  { name: "phone-390", width: 390, height: 844, touch: true },
  { name: "phone-land", width: 844, height: 390, touch: true },
  { name: "tablet-768", width: 768, height: 1024, touch: true },
  { name: "laptop-1440", width: 1440, height: 900, touch: false },
  { name: "wide-1920", width: 1920, height: 1080, touch: false },
];

/** Holds every CSS/Web animation still at a fixed moment. */
function holdAnimations(at) {
  for (const a of document.getAnimations()) {
    const t = a.effect?.getComputedTiming?.();
    if (!t) continue;
    if (t.iterations === Infinity) {
      a.pause();
      a.currentTime = at;
    } else {
      try {
        a.finish();
      } catch {
        a.pause();
      }
    }
  }
}

async function shot(page, dir, name) {
  // Images arrive on real time, not on the page's clock: wait for every one
  // to be decoded, or a photo is there in one run and not in the next.
  await page.evaluate(() =>
    Promise.all([...document.images].map((img) => (img.complete ? img.decode?.() : new Promise((ok) => img.addEventListener("load", ok, { once: true }))).catch?.(() => {}))),
  );
  await page.evaluate(holdAnimations, 1500);
  // Twice, a frame apart: finishing an animation can start a follow-up one
  // (Motion chains its own), which is then held too.
  await page.clock.runFor(16);
  await page.evaluate(holdAnimations, 1500);
  await page.clock.runFor(16);
  await page.screenshot({ path: path.join(dir, `${name}.png`), animations: "disabled", caret: "hide" });
}

async function step(page, ms) {
  // Small steps, so rAF-driven code sees a normal stream of frames.
  for (let t = 0; t < ms; t += 16) await page.clock.runFor(16);
}

async function scrollToY(page, y) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await step(page, 1400);
}

const yOf = (page, sel, frac = 0) =>
  page.evaluate(
    ([s, f]) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return Math.round(r.top + window.scrollY + f * Math.max(0, r.height - window.innerHeight));
    },
    [sel, frac],
  );

async function capture(outDir) {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--disable-webgl", "--disable-webgl2", "--font-render-hinting=none", "--disable-lcd-text"] });
  const only = arg("viewports", "");
  for (const vp of VIEWPORTS) {
    if (only && !only.split(",").includes(vp.name)) continue;
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.touch && vp.width < 1024,
      hasTouch: vp.touch,
      reducedMotion: "no-preference",
    });
    await standInForUnsplash(context);
    const dir = path.join(outDir, vp.name);
    fs.mkdirSync(dir, { recursive: true });

    /* Home: the opening frame by frame, then every section. */
    {
      const page = await context.newPage();
      await page.clock.install({ time: new Date("2026-10-19T10:00:00Z") });
      // Installed, the clock still runs on with real time; paused, it only
      // moves when stepped, which is what makes two runs the same.
      await page.clock.pauseAt(new Date("2026-10-19T10:00:01Z"));
      await page.goto(BASE + "/", { waitUntil: "networkidle" });
      await step(page, 1500);
      await shot(page, dir, "home-00-black");
      await page.mouse.click(Math.round(vp.width / 2), Math.round(vp.height / 3));
      // The run starts on whichever frame the click lands before, which
      // varies by one frame from run to run. Every sample is timed from the
      // first frame the mark is seen to move (102ms into the run), so two
      // runs are read on the same frames.
      const markNow = () =>
        page.evaluate(() => getComputedStyle(document.querySelector(".fixed.inset-0.z-\\[60\\] img") ?? document.body).transform);
      const atRest = await markNow();
      for (let waited = 0; waited < 800 && (await markNow()) === atRest; waited += 16) await page.clock.runFor(16);
      const probe = [];
      globalThis.__last = 100;
      for (const ms of [300, 700, 1100, 1500, 1800, 2100]) {
        // Cumulative: each frame of the run at its own moment.
        await step(page, ms - globalThis.__last);
        globalThis.__last = ms;
        // The opening's state read as numbers, which are exact run to run
        // (the screenshots of a moving, rescaled layer are not quite).
        probe.push({
          ms,
          ...(await page.evaluate(() => {
            const st = (el, ...props) => (el ? props.map((k) => getComputedStyle(el)[k]).join(" | ") : null);
            return {
              curtain: st(document.querySelector("main section > .bg-ink.absolute.inset-0"), "opacity"),
              mark: st(document.querySelector(".fixed.inset-0.z-\\[60\\] img"), "transform", "left", "top", "width"),
              bar: st(document.querySelector("header"), "opacity", "transform"),
              links: st(document.querySelector("header nav"), "opacity"),
              words: st(document.querySelector("main section .shell.flex.h-full"), "transform"),
            };
          })),
        });
        await shot(page, dir, `home-01-run-${String(ms).padStart(4, "0")}ms`);
      }
      globalThis.__last = 0;
      fs.writeFileSync(path.join(dir, "opening.json"), JSON.stringify(probe, null, 2));
      if (arg("opening-only", "") === "on") {
        await page.close();
        await context.close();
        console.log(`${vp.name}: opening done`);
        continue;
      }
      await step(page, 1500);
      await shot(page, dir, "home-02-second-screen");
      const points = [
        ["home-03-studio", "#studio", 0],
        ["home-04-services", "#services", 0],
        ["home-05-process-start", "#how-we-work", 0],
        ["home-06-process-mid", "#how-we-work", 0.5],
        ["home-07-process-end", "#how-we-work", 1],
        ["home-08-comparison", "#comparison", 0],
        ["home-09-work-together", "#work-together", 0],
        ["home-10-footer", "#contact", 0],
      ];
      for (const [name, sel, f] of points) {
        const y = await yOf(page, sel, f);
        if (y === null) continue;
        await scrollToY(page, y);
        await shot(page, dir, name);
      }
      await page.close();
    }

    /* The other pages: top and each section. */
    for (const p of ["/about", "/services/seo", "/portfolio", "/pt/about"]) {
      const page = await context.newPage();
      await page.clock.install({ time: new Date("2026-10-19T10:00:00Z") });
      // Installed, the clock still runs on with real time; paused, it only
      // moves when stepped, which is what makes two runs the same.
      await page.clock.pauseAt(new Date("2026-10-19T10:00:01Z"));
      await page.goto(BASE + p, { waitUntil: "networkidle" });
      await step(page, 2500);
      const slug = p.replace(/^\//, "").replace(/\//g, "_");
      await shot(page, dir, `${slug}-00-top`);
      const tops = await page.evaluate(() =>
        [...document.querySelectorAll("main > section, main section[id], footer, #contact")]
          .map((el) => Math.round(el.getBoundingClientRect().top + window.scrollY))
          .filter((y, i, a) => y > 0 && a.indexOf(y) === i)
          .slice(0, 8),
      );
      for (const [i, y] of tops.entries()) {
        await scrollToY(page, y);
        await shot(page, dir, `${slug}-${String(i + 1).padStart(2, "0")}`);
      }
      await page.close();
    }
    await context.close();
    console.log(`${vp.name}: done`);
  }
  await browser.close();
}

async function compare(a, b, noiseDir) {
  // With a second reference run, an image that already differs between the
  // two references is "unstable": it passes if the after-run differs from
  // the reference by no more than 1.5x that noise.
  const noise = {};
  if (noiseDir && fs.existsSync(path.join(noiseDir, "compare.json")))
    for (const r of JSON.parse(fs.readFileSync(path.join(noiseDir, "compare.json"), "utf8"))) noise[r.file] = r.pixels ?? 0;
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage();
  const files = [];
  const walk = (d, rel = "") => {
    for (const f of fs.readdirSync(path.join(d, rel))) {
      const r = path.join(rel, f);
      if (fs.statSync(path.join(d, r)).isDirectory()) walk(d, r);
      else if (f.endsWith(".png") && !f.endsWith(".diff.png")) files.push(r);
    }
  };
  walk(a);
  const rows = [];
  for (const f of files) {
    const pb = path.join(b, f);
    if (!fs.existsSync(pb)) {
      rows.push({ file: f, status: "missing in after" });
      continue;
    }
    const res = await page.evaluate(
      async ([x, y]) => {
        const load = (src) =>
          new Promise((ok) => {
            const i = new Image();
            i.onload = () => ok(i);
            i.src = src;
          });
        const [i1, i2] = await Promise.all([load(x), load(y)]);
        if (i1.width !== i2.width || i1.height !== i2.height) return { size: true };
        const c = document.createElement("canvas");
        c.width = i1.width;
        c.height = i1.height;
        const g = c.getContext("2d");
        g.drawImage(i1, 0, 0);
        const d1 = g.getImageData(0, 0, c.width, c.height).data;
        g.clearRect(0, 0, c.width, c.height);
        g.drawImage(i2, 0, 0);
        const img2 = g.getImageData(0, 0, c.width, c.height);
        const d2 = img2.data;
        let diff = 0;
        for (let k = 0; k < d1.length; k += 4) {
          const delta = Math.abs(d1[k] - d2[k]) + Math.abs(d1[k + 1] - d2[k + 1]) + Math.abs(d1[k + 2] - d2[k + 2]);
          if (delta > 24) {
            diff++;
            d2[k] = 255;
            d2[k + 1] = 0;
            d2[k + 2] = 0;
            d2[k + 3] = 255;
          }
        }
        g.putImageData(img2, 0, 0);
        return { diff, total: d1.length / 4, png: diff ? c.toDataURL("image/png") : null };
      },
      [
        "data:image/png;base64," + fs.readFileSync(path.join(a, f)).toString("base64"),
        "data:image/png;base64," + fs.readFileSync(pb).toString("base64"),
      ],
    );
    if (res.size) rows.push({ file: f, status: "different size" });
    else {
      const share = res.diff / res.total;
      const floor = noise[f] ?? 0;
      const status = !res.diff ? "identical" : floor && res.diff <= floor * 1.5 ? "within noise" : "DIFFERS";
      rows.push({ file: f, status, pixels: res.diff, noise: floor, share: Math.round(share * 1e6) / 1e4 + "%" });
      if (res.png) fs.writeFileSync(path.join(b, f.replace(/\.png$/, ".diff.png")), Buffer.from(res.png.split(",")[1], "base64"));
    }
  }
  await browser.close();
  // The opening's numbers must match exactly.
  for (const d of fs.readdirSync(a)) {
    const oa = path.join(a, d, "opening.json");
    const ob = path.join(b, d, "opening.json");
    if (fs.existsSync(oa) && fs.existsSync(ob)) {
      // Read as numbers, within what two runs of the same build differ by
      // (a few thousandths): a change of duration, delay or curve moves
      // these by tenths.
      const A = JSON.parse(fs.readFileSync(oa, "utf8"));
      const B = JSON.parse(fs.readFileSync(ob, "utf8"));
      let worst = "";
      A.forEach((sa, i) => {
        for (const key of Object.keys(sa)) {
          if (key === "ms") continue;
          const na = String(sa[key] ?? "").match(/-?[\d.]+/g) ?? [];
          const nb = String(B[i]?.[key] ?? "").match(/-?[\d.]+/g) ?? [];
          na.forEach((x, k) => {
            const a = Number(x);
            const b = Number(nb[k]);
            const tol = Math.abs(a) <= 1.5 ? 0.02 : 3; // opacities and scales; pixels
            if (!(Math.abs(a - b) <= tol)) worst += ` ${sa.ms}ms ${key}[${k}] ${a}→${b};`;
          });
        }
      });
      rows.push({ file: `${d}/opening.json`, status: worst ? "DIFFERS" : "within noise", note: worst.trim() });
    }
  }
  const bad = rows.filter((r) => r.status === "DIFFERS" || r.status.startsWith("missing") || r.status.startsWith("different"));
  for (const r of rows) console.log(`${r.status.padEnd(16)} ${r.file} ${r.pixels ?? ""} ${r.share ?? ""}${r.noise ? ` (noise ${r.noise})` : ""}${r.note ? " " + r.note : ""}`);
  console.log(`\n${rows.length - bad.length}/${rows.length} pass`);
  fs.writeFileSync(path.join(b, "compare.json"), JSON.stringify(rows, null, 2));
}

const cmp = process.argv.indexOf("--compare");
if (cmp > -1) await compare(process.argv[cmp + 1], process.argv[cmp + 2], arg("noise", ""));
else await capture(path.resolve(arg("out", path.join(HERE, "screens", "before"))));
