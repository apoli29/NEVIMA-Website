// Turns measure.mjs results into a Markdown table, or compares two runs.
//
//   node audit/summarise.mjs audit/results/baseline-cpu4.json
//   node audit/summarise.mjs audit/results/baseline-cpu4.json audit/results/lote1-cpu4.json
//
// Runs of the same scenario are averaged. Main-thread figures are per
// second of the scenario's window, so scenarios of different lengths compare.
import fs from "node:fs";

const load = (f) => JSON.parse(fs.readFileSync(f, "utf8"));

function rows(data) {
  const by = new Map();
  for (const r of data.results) {
    if (r.error) continue;
    if (!by.has(r.id)) by.set(r.id, []);
    by.get(r.id).push(r);
  }
  const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const out = new Map();
  for (const [id, rs] of by) {
    const perSec = (f) => avg(rs.map((r) => (f(r) / r.windowMs) * 1000));
    const inter = rs.flatMap((r) => Object.values(r.interactions ?? {}));
    out.set(id, {
      title: rs[0].title,
      rafFps: avg(rs.map((r) => r.frames.rafFps)),
      p95: avg(rs.map((r) => r.frames.p95Ms)),
      over33: avg(rs.map((r) => r.frames.over33Pct)),
      dropped: avg(rs.map((r) => r.compositor.droppedPct)),
      busy: perSec((r) => r.trace.mainThreadMs.RunTask) / 10, // % of each second
      style: perSec((r) => r.trace.mainThreadMs.UpdateLayoutTree),
      paint: perSec((r) => r.trace.mainThreadMs.Paint + r.trace.mainThreadMs.PrePaint + r.trace.mainThreadMs.Layerize),
      script: perSec((r) => r.trace.mainThreadMs.FunctionCall + r.trace.mainThreadMs.FireAnimationFrame + r.trace.mainThreadMs.TimerFire),
      paints: perSec((r) => r.trace.paintCount),
      lt: avg(rs.map((r) => r.longTasks.blockingMs)),
      inp: inter.length ? Math.max(...inter) : null,
    });
  }
  return out;
}

const f = (n, d = 0) => (n === null || n === undefined || Number.isNaN(n) ? "–" : n.toFixed(d));

const [a, b] = process.argv.slice(2);
const A = load(a);
const ra = rows(A);
if (!b) {
  console.log(`**${A.label}**, CPU ${A.cpu}x, WebGL ${A.webgl ? "on" : "off"}${A.inject ? `, inject ${A.inject}` : ""}${A.init ? `, init ${A.init}` : ""}\n`);
  console.log("| Scenario | rAF fps | p95 frame (ms) | frames >33 ms | main thread busy | style ms/s | paint+prepaint+layerize ms/s | script ms/s | paints/s | long-task blocking (ms) | slowest interaction (ms) |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|");
  for (const [id, r] of ra)
    console.log(`| ${id} | ${f(r.rafFps, 1)} | ${f(r.p95, 1)} | ${f(r.over33, 1)}% | ${f(r.busy)}% | ${f(r.style)} | ${f(r.paint)} | ${f(r.script)} | ${f(r.paints)} | ${f(r.lt)} | ${f(r.inp)} |`);
} else {
  const B = load(b);
  const rb = rows(B);
  console.log(`**${A.label} → ${B.label}**, CPU ${A.cpu}x\n`);
  console.log("| Scenario | main thread busy | paint ms/s | style ms/s | rAF fps | frames >33 ms | long-task blocking (ms) |");
  console.log("|---|---|---|---|---|---|---|");
  for (const [id, x] of ra) {
    const y = rb.get(id);
    if (!y) continue;
    console.log(
      `| ${id} | ${f(x.busy)}% → ${f(y.busy)}% | ${f(x.paint)} → ${f(y.paint)} | ${f(x.style)} → ${f(y.style)} | ${f(x.rafFps, 1)} → ${f(y.rafFps, 1)} | ${f(x.over33, 1)}% → ${f(y.over33, 1)}% | ${f(x.lt)} → ${f(y.lt)} |`,
    );
  }
}
