// Do the two pinned screens fit? The second screen and How we work's held
// screen are one viewport tall with overflow hidden, so anything taller than
// the viewport is cut off and cannot be scrolled to. Reports, per viewport,
// how many pixels of each are cut (top and bottom).
//   AUDIT_TOOLS=... node audit/fit-check.mjs
import { toolRequire, CHROME, BASE, sleep } from "./lib.mjs";
import { standInForUnsplash } from "./stand-in.mjs";
const { chromium } = toolRequire("playwright-core");
const SIZES = [[320,568],[360,640],[375,667],[360,740],[390,844],[414,896],[568,320],[667,375],[740,360],[844,390],[932,430],[1024,600],[1280,720],[1366,768]];
const b = await chromium.launch({ executablePath: CHROME, args: ["--disable-webgl","--disable-webgl2"] });
console.log("viewport   | second screen: cut top/bottom (px) | how we work: cut top/bottom (px)");
for (const [w,h] of SIZES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 1024, isMobile: w < 1024 });
  await standInForUnsplash(ctx);
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await sleep(600);
  await p.mouse.click(Math.round(w/2), Math.round(h/3));
  await sleep(2800);
  const r = await p.evaluate(async () => {
    const bar = document.querySelector("header .shell > div")?.getBoundingClientRect().bottom ?? 0;
    // Second screen: the words and the index, against the screen and the bar.
    const stage = document.querySelector("main > div > section");
    const kids = [...stage.querySelectorAll("[data-jelly-quiet], h1, nav, dl, ul, ol, a, button, p")].map(e => e.getBoundingClientRect()).filter(r => r.width && r.height);
    const top1 = Math.min(...kids.map(r => r.top)), bot1 = Math.max(...kids.map(r => r.bottom));
    const vh = innerHeight;
    // How we work, at its start.
    const sec = document.getElementById("how-we-work");
    window.scrollTo(0, sec.getBoundingClientRect().top + scrollY);
    await new Promise(r => setTimeout(r, 900));
    const screen = sec.firstElementChild;
    const parts = [...screen.querySelectorAll("h2, p, button, li.prc-stage, .prc-head, a")].map(e => e.getBoundingClientRect()).filter(r => r.width && r.height && r.left < innerWidth && r.right > 0);
    const top2 = Math.min(...parts.map(r => r.top)), bot2 = Math.max(...parts.map(r => r.bottom));
    const bar2 = document.querySelector("header .shell > div")?.getBoundingClientRect().bottom ?? 0;
    return { s: [Math.max(0, Math.round(bar - top1)), Math.max(0, Math.round(bot1 - vh))], p: [Math.max(0, Math.round(bar2 - top2)), Math.max(0, Math.round(bot2 - vh))] };
  });
  console.log(`${(w+"x"+h).padEnd(10)} | ${String(r.s[0]).padStart(5)} / ${String(r.s[1]).padEnd(24)} | ${String(r.p[0]).padStart(5)} / ${r.p[1]}`);
  await ctx.close();
}
await b.close();
