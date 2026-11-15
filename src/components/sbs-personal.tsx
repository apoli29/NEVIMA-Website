"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Glass } from "./cta-glass";
import { useOriginFade, useProposal } from "./proposal-flow";
import { useInView, type T } from "./sbs-shared";
import { useSeen } from "./use-seen";
import { useHref, useT } from "@/lib/use-lang";

/* ==================================================================
   Personalization

   One card that plays a website being put together, and is not to be
   touched: on the left the choice of a website or a landing page and
   the pages ticked one by one; on the right the skeleton taking shape,
   a sheet for each page, until the switch to a landing page draws the
   sheets together into one long page, their addresses turned into
   anchors. A line under the choices counts the pages as they come.

   When it has played through, it does not start again. A white sheet
   set to invert what is under it wipes across the card, as the bar's
   proposal button fills on hover, and the whole thing plays backwards
   in negative, taking the website apart again; at its start the sheet
   wipes off and it plays forwards. One clock for all of it: every part
   is a CSS animation of the same length, run back and forth, and the
   inverting sheet is one of twice that length, so nothing can drift.

   Below, a client's doubts typed and cleared in a prompt (Typeform's),
   over a field of small square points lit by lights that drift, as
   FURO's dot-matrix lettering and the speaker grille in Drams are lit
   (both through Inspo): the mosaic's glow, set in the site's own pixels.

   For anyone who has asked for less motion the card shows where it ends
   (every page chosen, folded into one), the points are lit once and
   still, and the prompt shows the first doubt.
   ================================================================== */

/** One run of the card, forwards; the way back takes as long again. */
const RUN_S = 12;

/** Percentages of the run. */
const TICKS = [10, 17, 24, 31, 38];
const MODE: [number, number] = [50, 56];
function MOVE(i: number): [number, number] {
  return [56 + i * 2, 66 + i * 2];
}
const FRAME: [number, number] = [70, 78];
const FADE = 1.6;

type Win = [number, number];

/** Opacity keyframes for the windows a thing is shown in. */
function windows(name: string, wins: Win[], lo = 0, hi = 1) {
  const pts: [number, number][] = [];
  wins.forEach(([a, b]) => {
    if (a <= 0) pts.push([0, hi]);
    else pts.push([a, lo], [Math.min(100, a + FADE), hi]);
    if (b >= 100) pts.push([100, hi]);
    else pts.push([b, hi], [Math.min(100, b + FADE), lo]);
  });
  if (pts[0]![0] > 0) pts.unshift([0, lo]);
  if (pts[pts.length - 1]![0] < 100) pts.push([100, lo]);
  return `@keyframes ${name}{${pts.map(([p, v]) => `${p.toFixed(2)}%{opacity:${v}}`).join("")}}`;
}

/** Everything the card does, written once for both languages. */
const CARD_CSS = (() => {
  const css: string[] = [];
  const ease = "animation-timing-function:cubic-bezier(0.65,0,0.35,1)";
  TICKS.forEach((p, i) => {
    css.push(
      `@keyframes sbp-box-${i}{0%,${p}%{background:transparent;border-color:rgb(0 0 0 / 0.28)}${p + 1.2}%,100%{background:#000;border-color:#000}}`,
      `@keyframes sbp-check-${i}{0%,${p + 0.6}%{stroke-dashoffset:14}${p + 2.4}%,100%{stroke-dashoffset:0}}`,
      `@keyframes sbp-opt-${i}{0%,${p}%{color:#75726e}${p + 1.2}%,100%{color:#000}}`,
    );
    const [m0, m1] = MOVE(i);
    css.push(
      `@keyframes sbp-sheet-${i}{` +
        `0%,${p}%{opacity:0;translate:0 8%;left:var(--wx);top:var(--wy);width:var(--ww);height:var(--wh)}` +
        `${p + 4}%{opacity:1;translate:0 0;left:var(--wx);top:var(--wy);width:var(--ww);height:var(--wh)}` +
        `${m0}%{opacity:1;translate:0 0;left:var(--wx);top:var(--wy);width:var(--ww);height:var(--wh);${ease}}` +
        `${m1}%,100%{opacity:1;translate:0 0;left:var(--lx);top:var(--ly);width:var(--lw);height:var(--lh)}}`,
    );
    css.push(`.sbp-run .sbp-sheet[data-i="${i}"]{animation-name:sbp-sheet-${i}}`);
    css.push(`.sbp-run .sbp-opt[data-i="${i}"]{animation-name:sbp-opt-${i}}`);
    css.push(`.sbp-run .sbp-opt[data-i="${i}"] .sbp-box{animation-name:sbp-box-${i}}`);
    css.push(`.sbp-run .sbp-opt[data-i="${i}"] .sbp-box path{animation-name:sbp-check-${i}}`);
  });
  // the count under the choices: one page, two, … five, then one with everything
  const counts: Win[] = TICKS.map((p, i) => [p, i < TICKS.length - 1 ? TICKS[i + 1]! - FADE : MODE[0]]);
  counts.forEach((w, i) => {
    css.push(windows(`sbp-count-${i}`, [w]));
    css.push(`.sbp-run .sbp-count[data-i="${i}"]{animation-name:sbp-count-${i}}`);
  });
  css.push(windows("sbp-count-all", [[MODE[1], 100]]));
  css.push(`.sbp-run .sbp-count[data-i="all"]{animation-name:sbp-count-all}`);
  // the switch, the addresses, the frame round the one long page
  css.push(`@keyframes sbp-mode{0%,${MODE[0]}%{translate:0 0;${ease}}${MODE[1]}%,100%{translate:100% 0}}`);
  css.push(windows("sbp-path", [[0, 52]]));
  css.push(windows("sbp-anchor", [[72, 100]]));
  css.push(windows("sbp-frame", [FRAME]));
  // the three steps under the card, each lit while it happens
  css.push(windows("sbp-step-0", [[0, 8], [46, 58]], 0.32));
  css.push(windows("sbp-step-1", [[8, 46]], 0.32));
  css.push(windows("sbp-step-2", [[58, 100]], 0.32));
  // the inverting sheet: on at the end of the run forwards, off at the end of the way back
  css.push(
    `@keyframes sbp-invert{0%,46%{clip-path:inset(0 100% 0 0)}50%,96%{clip-path:inset(0 0 0 0)}100%{clip-path:inset(0 0 0 100%)}}`,
  );
  return css.join("\n");
})();

type Page = { id: string; label: string; slug: string; chosen: number | null };

/** The pages the card offers, as the proposal form does (questions.ts),
    with home and contact; five of them are chosen, in this order. */
function cardPages(t: T): Page[] {
  return [
    { id: "home", label: t("Home", "Início"), slug: "", chosen: 0 },
    { id: "services", label: t("Services", "Serviços"), slug: t("services", "servicos"), chosen: 1 },
    { id: "team", label: t("Team", "Equipa"), slug: t("team", "equipa"), chosen: 2 },
    { id: "prices", label: t("Prices", "Preços"), slug: t("prices", "precos"), chosen: null },
    { id: "gallery", label: t("Gallery", "Galeria"), slug: t("gallery", "galeria"), chosen: 3 },
    { id: "testimonials", label: t("Testimonials", "Testemunhos"), slug: t("testimonials", "testemunhos"), chosen: null },
    { id: "faq", label: t("FAQ", "Perguntas frequentes"), slug: t("faq", "perguntas"), chosen: null },
    { id: "contact", label: t("Contact", "Contactos"), slug: t("contact", "contactos"), chosen: 4 },
  ];
}

/** Where each sheet stands as a page of its own, and as a section of the
    one long page, in percentages of the stage. */
function sheetPlace(i: number) {
  const ww = 16.4;
  return {
    "--wx": `${3.5 + i * 19}%`,
    "--wy": "20%",
    "--ww": `${ww}%`,
    "--wh": "52%",
    "--lx": "33%",
    "--ly": `${8 + i * 16.8}%`,
    "--lw": "34%",
    "--lh": "16.8%",
  } as React.CSSProperties;
}

function SitemapCard({ t, run }: { t: T; run: boolean }) {
  const all = useMemo(() => cardPages(t), [t]);
  const chosen = all.filter((p) => p.chosen !== null).sort((a, b) => a.chosen! - b.chosen!);
  const counts = [
    t("One page.", "Uma página."),
    t("Two pages.", "Duas páginas."),
    t("Three pages.", "Três páginas."),
    t("Four pages.", "Quatro páginas."),
    t("Five pages.", "Cinco páginas."),
  ];
  return (
    <div className={`sbp-card ${run ? "sbp-run" : ""}`} aria-hidden="true" style={{ ["--run" as string]: `${RUN_S}s` }}>
      <style dangerouslySetInnerHTML={{ __html: CARD_CSS }} />

      <div className="sbp-card-side">
        <div className="sbp-modes">
          <span className="sbp-modes-thumb" />
          <span className="sbp-modes-cell">
            <span className="sbp-modes-n">01</span>
            {t("Website", "Website")}
          </span>
          <span className="sbp-modes-cell">
            <span className="sbp-modes-n">02</span>
            {t("Landing page", "Landing page")}
          </span>
        </div>

        <ul className="sbp-opts">
          {all.map((p) => (
            <li key={p.id} className="sbp-opt" data-i={p.chosen ?? undefined} data-off={p.chosen === null || undefined}>
              <span className="sbp-box">
                <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="1.6">
                  <path d="M2.5 6.2 5 8.6l4.6-5" pathLength={14} />
                </svg>
              </span>
              {p.label}
            </li>
          ))}
        </ul>

        <p className="sbp-counts">
          {counts.map((c, i) => (
            <span key={i} className="sbp-count" data-i={i}>
              {c}
            </span>
          ))}
          <span className="sbp-count" data-i="all">
            {t("One page, with everything.", "Uma só página, com tudo.")}
          </span>
        </p>
      </div>

      <div className="sbp-stage">
        <span className="sbp-frame" />
        {chosen.map((p, i) => (
          <div key={p.id} className="sbp-sheet" data-i={i} data-home={i === 0 || undefined} style={sheetPlace(i)}>
            <span className="sbp-sk">
              <span className="sbp-sk-nav" />
              <span className="sbp-sk-h" />
              <span className="sbp-sk-l" />
              <span className="sbp-sk-l sbp-sk-short" />
              <span className="sbp-sk-b" />
            </span>
            <span className="sbp-path">/{p.slug}</span>
            <span className="sbp-anchor">#{p.slug || t("top", "inicio")}</span>
          </div>
        ))}
      </div>

      <span className="sbp-invert" />
    </div>
  );
}

/** A client's doubts, in the client's own voice (as the about page's
    questions are), typed and cleared one after another. */
function doubts(t: T) {
  return [
    t("A landing page or a website?", "Landing page ou website?"),
    t("How many pages do I need?", "Quantas páginas são precisas?"),
    t("A page for each service?", "Uma página para cada serviço?"),
    t("Do I need a gallery?", "Preciso de uma galeria?"),
  ];
}

function useTyping(lines: string[], run: boolean, still: boolean) {
  const [text, setText] = useState(still ? lines[0]! : "");
  const state = useRef({ line: 0, len: 0, back: false });
  useEffect(() => {
    if (still) {
      setText(lines[0]!);
      return;
    }
    if (!run) return;
    let id = 0;
    const step = () => {
      const s = state.current;
      const full = lines[s.line % lines.length]!;
      if (!s.back) {
        s.len += 1;
        setText(full.slice(0, s.len));
        if (s.len >= full.length) {
          s.back = true;
          id = window.setTimeout(step, 1600);
          return;
        }
        id = window.setTimeout(step, 48 + Math.random() * 40);
      } else {
        s.len -= 1;
        setText(full.slice(0, Math.max(0, s.len)));
        if (s.len <= 0) {
          s.back = false;
          s.line += 1;
          id = window.setTimeout(step, 420);
          return;
        }
        id = window.setTimeout(step, 22);
      }
    };
    id = window.setTimeout(step, 500);
    return () => window.clearTimeout(id);
  }, [lines, run, still]);
  return text;
}

/** The field behind the prompt: square points on a fine grid, each as
    bright and as large as the light falling on it. One light rests
    behind the prompt; two more drift across, slowly, never in step. */
function PointField({ run, still }: { run: boolean; still: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
    };
    const STEP = 10;
    const draw = (time: number) => {
      const s = time / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const lights = [
        { x: w * 0.5, y: h * 0.24, r: Math.max(w, h) * 0.26, k: 0.75 },
        { x: w * (0.5 + 0.36 * Math.sin(s * 0.11)), y: h * (0.55 + 0.3 * Math.sin(s * 0.083 + 1.3)), r: Math.max(w, h) * 0.24, k: 0.75 },
        { x: w * (0.5 + 0.4 * Math.sin(s * 0.067 + 2.4)), y: h * (0.5 + 0.34 * Math.cos(s * 0.097 + 0.4)), r: Math.max(w, h) * 0.2, k: 0.6 },
      ];
      ctx.fillStyle = "#fff";
      for (let y = STEP / 2; y < h; y += STEP) {
        for (let x = STEP / 2; x < w; x += STEP) {
          let lit = 0;
          for (const l of lights) {
            const dx = x - l.x;
            const dy = y - l.y;
            lit += l.k * Math.exp(-(dx * dx + dy * dy) / (l.r * l.r));
          }
          if (lit > 1) lit = 1;
          const side = 0.9 + lit * 2.2;
          ctx.globalAlpha = 0.06 + lit * 0.42;
          ctx.fillRect(x - side / 2, y - side / 2, side, side);
        }
      }
      ctx.globalAlpha = 1;
    };
    size();
    let raf = 0;
    let last = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last < 1000 / 30) return;
      last = time;
      draw(time);
    };
    if (run && !still) raf = requestAnimationFrame(loop);
    else draw(still ? 0 : performance.now());
    const watch = new ResizeObserver(() => {
      size();
      draw(performance.now());
    });
    watch.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      watch.disconnect();
    };
  }, [run, still]);
  return <canvas ref={canvas} aria-hidden="true" className="sbp-field" />;
}

function ProposalAsk({ label }: { label: string }) {
  const proposal = useProposal();
  const button = useRef<HTMLButtonElement>(null);
  const [launched, setLaunched] = useState(false);
  const present = proposal?.present ?? false;
  const href = useHref();
  useEffect(() => {
    if (!present) setLaunched(false);
  }, [present]);
  useOriginFade(button, proposal?.progress, launched && present);
  const look = "cta-drop cta-drop-light relative isolate inline-flex items-center justify-center text-[0.9375rem] leading-none whitespace-nowrap";
  const face = (
    <span className="btn-neu-face">
      <span>
        {label}
        <span aria-hidden="true" className="ml-2.5 inline-block">
          &rarr;
        </span>
      </span>
    </span>
  );
  if (!proposal) {
    return (
      <a href={href("/#proposal")} className={look}>
        <Glass />
        {face}
      </a>
    );
  }
  return (
    <button
      ref={button}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={launched && proposal.open}
      onClick={() => {
        if (!button.current) return;
        setLaunched(true);
        proposal.show(button.current, button.current, false);
      }}
      className={look}
    >
      <Glass />
      {face}
    </button>
  );
}

export function SbsPersonal() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const steps = [
    { n: "01", name: t("A website or a landing page", "Website ou landing page"), text: t("Several pages, or one with everything.", "Várias páginas, ou uma só com tudo.") },
    { n: "02", name: t("The pages and the sections", "As páginas e as secções"), text: t("Chosen by you, one by one.", "Escolhidas pelo cliente, uma a uma.") },
    { n: "03", name: t("The website", "O website"), text: t("Designed around those choices.", "Desenhado à volta dessas escolhas.") },
  ];

  const [ask, askInView] = useInView<HTMLDivElement>(0.3);
  const lines = useMemo(() => doubts(t), [t]);
  const typed = useTyping(lines, askInView, reduce);
  const askSeen = useSeen(ask, { threshold: 0.45 });

  return (
    <section aria-labelledby="sbp-title" className="sbp relative bg-paper pt-(--section-gap) pb-[clamp(1rem,2vw,1.5rem)]">
      <div className="shell">
        <div className="sbp-head">
          <div>
            <p className="mono-label text-ash-2">{t("Personalization", "Personalização")}</p>
            <h2 id="sbp-title" className="display mt-6 text-balance text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.02]">
              <span className="font-light sm:block">{t("This service is built, above all,", "Este serviço tem foco máximo")}</span>{" "}
              <span className="font-medium sm:block">{t("around personalization.", "na personalização.")}</span>
            </h2>
          </div>
          <p className="sbp-lede">
            {t(
              "You choose your website’s pages, or just one page (a landing page) with everything on it.",
              "O cliente escolhe as páginas do website, ou apenas uma página (landing page) com tudo.",
            )}
          </p>
        </div>

        <figure className="sbp-figure">
          <SitemapCard t={t} run={mounted && !reduce} />
          <figcaption>
            <ol className={`sbp-steps ${mounted && !reduce ? "sbp-run" : ""}`} style={{ ["--run" as string]: `${RUN_S}s` }}>
              {steps.map((s, i) => (
                <li key={s.n} className="sbp-step" data-i={i}>
                  <span className="sbp-step-n mono-label" aria-hidden="true">
                    <span className="sbp-step-rule" />
                    {s.n}
                    <span className="sbp-step-rule" />
                  </span>
                  <span className="sbp-step-name">{s.name}</span>
                  <span className="sbp-step-text">{s.text}</span>
                </li>
              ))}
            </ol>
          </figcaption>
        </figure>
      </div>

      <div className="shell mt-[clamp(4rem,9vw,7.5rem)]">
        <div ref={ask} className="sbp-ask relative isolate overflow-hidden bg-ink text-paper">
          <PointField run={askInView} still={reduce} />

          <div className="sbp-ask-inner">
            <div className="sbp-prompt" aria-hidden="true">
              <span className="sbp-prompt-text">
                {typed}
                <span className="sbp-caret" />
              </span>
              <span className="sbp-prompt-foot">
                <span className="mono-label text-paper/45">{t("A client’s doubt", "Dúvida do cliente")}</span>
                <span className="sbp-send">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </span>
            </div>
            <ul className="sr-only">
              {lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>

            <h3 className="sbp-answer display" data-seen={askSeen || reduce || undefined}>
              <span className="font-light sm:block">{t("Not sure what to choose? Don’t worry.", "Sem saber o que escolher? Não há problema.")}</span>{" "}
              <span className="font-medium sm:block">{t("When we meet, we’ll help you choose.", "Na reunião que marcamos, ajudamos a escolher.")}</span>
            </h3>
            <div className="sbp-cta" data-seen={askSeen || reduce || undefined}>
              <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
