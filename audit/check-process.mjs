// Functional check of How we work across devices (lote 9): shut and opened
// on a phone, the FAQ's deep link to a step, a phone on its side, desktop.
//   AUDIT_TOOLS=... BASE_URL=... node audit/check-process.mjs
import { toolRequire, CHROME, BASE, sleep } from "./lib.mjs";
import { standInForUnsplash } from "./stand-in.mjs";
const { chromium } = toolRequire("playwright-core");
const b = await chromium.launch({ executablePath: CHROME, args: ["--disable-webgl", "--disable-webgl2"] });
let fails = 0;
const ok = (cond, what) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${what}`);
  if (!cond) fails++;
};
async function page(vp, url = "/") {
  const ctx = await b.newContext({ viewport: vp, hasTouch: vp.width < 1024, isMobile: vp.width < 1024 });
  await standInForUnsplash(ctx);
  const p = await ctx.newPage();
  await p.goto(BASE + url, { waitUntil: "networkidle" });
  await sleep(500);
  return p;
}
const state = (p) =>
  p.evaluate(() => {
    const s = document.getElementById("how-we-work");
    const row = document.getElementById("prc-row");
    return {
      shut: s.hasAttribute("data-shut"),
      openKey: !!s.querySelector("[data-prc-open]"),
      rowShown: row && !row.hidden && row.getBoundingClientRect().height > 0,
      held: getComputedStyle(s.firstElementChild).position === "sticky",
      height: s.offsetHeight,
      vh: innerHeight,
      top: Math.round(s.getBoundingClientRect().top),
      scrollable: row ? getComputedStyle(row).overflowX : null,
      flash: !!document.querySelector(".prc-stage[data-flash]"),
    };
  });

{ // Phone, upright.
  const p = await page({ width: 390, height: 844 });
  await p.mouse.click(195, 280);
  await sleep(2800);
  let s = await state(p);
  ok(s.shut && s.openKey && !s.rowShown, "phone: shut on arrival, open key shown, row hidden");
  ok(s.height < s.vh * 1.2, `phone: shut section is short (${s.height}px)`);
  await p.evaluate(() => document.getElementById("how-we-work").scrollIntoView());
  await sleep(600);
  await p.click("[data-prc-open]");
  await sleep(1200);
  s = await state(p);
  ok(!s.shut && s.rowShown && s.held, "phone: opened, row shown and the screen held");
  ok(Math.abs(s.top) <= 2, `phone: page put at the section's start (top ${s.top})`);
  ok(s.height > s.vh * 1.5, `phone: opened section has its slide (${s.height}px)`);
  const x0 = await p.evaluate(() => getComputedStyle(document.querySelector(".prc-track")).transform);
  await p.evaluate(() => scrollBy(0, 900));
  await sleep(900);
  const x1 = await p.evaluate(() => getComputedStyle(document.querySelector(".prc-track")).transform);
  ok(x0 !== x1, "phone: the row slides with the scroll");
  await p.click(".prc-close");
  await sleep(900);
  s = await state(p);
  ok(s.shut && !s.rowShown, "phone: closed again");
  ok(s.top >= -2 && s.top < s.vh / 2, `phone: heading back in view (top ${s.top})`);
  await p.context().close();
}
{ // Phone, the FAQ's deep link to a step.
  const p = await page({ width: 390, height: 844 }, "/#process-strategy");
  await sleep(5200);
  const s = await state(p);
  ok(!s.shut && s.rowShown, "phone deep link: opened by the link");
  const card = await p.evaluate(() => {
    const c = document.getElementById("step-strategy").closest(".prc-stage").getBoundingClientRect();
    return { l: Math.round(c.left), r: Math.round(c.right) };
  });
  ok(card.l < 390 && card.r > 0, `phone deep link: the step is on screen (${card.l}–${card.r})`);
  await p.context().close();
}
{ // Phone: the studio's "a completely different approach" leads to How we work.
  const p = await page({ width: 390, height: 844 });
  await p.mouse.click(195, 280);
  await sleep(2800);
  const link = await p.$(".std-approach");
  if (link) {
    await link.scrollIntoViewIfNeeded();
    await sleep(800);
    await link.click();
    await sleep(2000);
    const s = await state(p);
    ok(!s.shut && s.rowShown && Math.abs(s.top) <= 2, `phone studio link: How we work opened and on screen (top ${s.top})`);
  } else ok(false, "phone studio link: .std-approach found");
  await p.context().close();
}
{ // Phone on its side.
  const p = await page({ width: 844, height: 390 });
  await p.mouse.click(422, 130);
  await sleep(2800);
  const stage = await p.evaluate(() => {
    const st = document.querySelector("main > div > section");
    const idx = [...st.querySelectorAll("a, button")].map((e) => e.getBoundingClientRect().bottom);
    return { pos: getComputedStyle(st).position, h: st.offsetHeight, lastBottom: Math.max(...idx) + scrollY };
  });
  ok(stage.pos !== "sticky" && stage.h >= stage.lastBottom - 2, `landscape: second screen holds all of its index (${stage.h}px)`);
  await p.evaluate(() => document.getElementById("how-we-work").scrollIntoView());
  await sleep(600);
  await p.click("[data-prc-open]");
  await sleep(1200);
  const s = await state(p);
  ok(!s.held && s.rowShown && s.scrollable === "auto", "landscape: opened row is swiped, not held");
  await p.context().close();
}
{ // Desktop: as before.
  const p = await page({ width: 1440, height: 900 });
  await p.mouse.click(720, 300);
  await sleep(2800);
  const s = await state(p);
  ok(!s.shut && !s.openKey && s.rowShown && s.held, "desktop: no open key, row shown, screen held");
  ok(s.height > s.vh * 1.5, `desktop: the slide is there (${s.height}px)`);
  ok(!(await p.$(".prc-close")), "desktop: no close key");
  await p.context().close();
}
await b.close();
console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
