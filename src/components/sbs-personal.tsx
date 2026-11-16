"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { Glass } from "./cta-glass";
import { useOriginFade, useProposal } from "./proposal-flow";
import { useInView, type T } from "./sbs-shared";
import { useHref, useT } from "@/lib/use-lang";

/* ==================================================================
   Personalization

   One card in black metal, played and not touched. On its left the
   choice of a website or a landing page, and the pages the proposal form
   offers ticked one by one (no boxes round them: a tick, and the name
   lit). On its right a sheet for each page ticked, side by side, and
   each sheet laid out as that page usually is: the home page's bar, its
   photograph and its title; the services listed with a mark each; the
   team in portraits; the gallery as a wall of pictures; the contact form
   and its map. Titles and buttons are real words; the body is a doctor's
   hand (a scrawl, drawn on) or empty lines. Then the switch moves to a
   landing page and the sheets draw together into one long page, each now
   a section of it, laid out as a section is (wide rather than tall), and
   their addresses turn into anchors.

   It does not loop: it plays forwards, then backwards, taking the
   website apart, then forwards again. One clock for all of it: every
   part is a CSS animation of the same length, run back and forth, so
   nothing can drift. The sheets' two layouts are chosen by the sheet's
   own proportions (a container query), so a page becomes a section as
   it changes shape.

   Below, in a black card of the same metal: the doubt and the call. Two
   tiles for António and Emanuel, one for the client, a line between
   them. Whoever speaks lights up, their words are typed in a panel over
   them, and the line fills from them to the one listening, a point of
   light running ahead of it; the other answers and it fills back.

   For anyone who has asked for less motion, the card shows where it
   ends (every page chosen, folded into one) and the call its last
   answer.
   ================================================================== */

/** One run of the card, forwards; the way back takes as long again. */
const RUN_S = 13;

/** Percentages of the run. */
const TICKS = [9, 16, 23, 30, 37];
const MODE: [number, number] = [52, 58];
function MOVE(i: number): [number, number] {
  return [58 + i * 2, 70 + i * 2];
}
const FRAME: [number, number] = [74, 82];
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
      `@keyframes sbp-tick-${i}{0%,${p + 0.4}%{stroke-dashoffset:14}${p + 2.2}%,100%{stroke-dashoffset:0}}`,
      `@keyframes sbp-opt-${i}{0%,${p}%{color:rgb(255 255 255 / 0.38)}${p + 1.2}%,100%{color:#fff}}`,
    );
    const [m0, m1] = MOVE(i);
    css.push(
      `@keyframes sbp-sheet-${i}{` +
        `0%,${p}%{opacity:0;translate:0 6%;left:var(--wx);top:var(--wy);width:var(--ww);height:var(--wh)}` +
        `${p + 4}%{opacity:1;translate:0 0;left:var(--wx);top:var(--wy);width:var(--ww);height:var(--wh)}` +
        `${m0}%{opacity:1;translate:0 0;left:var(--wx);top:var(--wy);width:var(--ww);height:var(--wh);${ease}}` +
        `${m1}%,100%{opacity:1;translate:0 0;left:var(--lx);top:var(--ly);width:var(--lw);height:var(--lh)}}`,
    );
    css.push(`.sbp-run .sbp-sheet[data-i="${i}"]{animation-name:sbp-sheet-${i}}`);
    css.push(`.sbp-run .sbp-opt[data-i="${i}"]{animation-name:sbp-opt-${i}}`);
    css.push(`.sbp-run .sbp-opt[data-i="${i}"] .sbp-tick path{animation-name:sbp-tick-${i}}`);
    // the sheet's doctor's hand is written as it arrives
    css.push(`@keyframes sbp-ink-${i}{0%,${p + 2}%{stroke-dashoffset:1}${p + 10}%,100%{stroke-dashoffset:0}}`);
    css.push(`.sbp-run .sbp-sheet[data-i="${i}"] .pg-scrawl path{animation-name:sbp-ink-${i}}`);
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
  css.push(windows("sbp-path", [[0, 54]]));
  css.push(windows("sbp-anchor", [[76, 100]]));
  css.push(windows("sbp-frame", [FRAME]));
  // the three steps under the card, each lit while it happens
  css.push(windows("sbp-step-0", [[0, 7], [50, 60]], 0.32));
  css.push(windows("sbp-step-1", [[7, 50]], 0.32));
  css.push(windows("sbp-step-2", [[60, 100]], 0.32));
  return css.join("\n");
})();

/* ---------------------------------------------------------------- */
/* The pieces a page is drawn with                                    */
/* ---------------------------------------------------------------- */

/** A scrawl: a run of loops of uneven size, as a hurried hand writes, in
    a box `width` wide and 10 tall. The same seed gives the same line. */
function scrawl(seed: number, width = 100) {
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let d = "M0 6";
  let x = 0;
  while (x < width - 4) {
    const w = 2.2 + rand() * 3.4;
    const h = 2.5 + rand() * 3.5;
    if (rand() < 0.55) {
      d += ` C${(x + w * 0.9).toFixed(1)} ${(6 - h).toFixed(1)} ${(x + w * 0.1).toFixed(1)} ${(6 - h).toFixed(1)} ${(x + w * 0.6).toFixed(1)} 6.4`;
    } else {
      d += ` Q${(x + w * 0.5).toFixed(1)} ${(6 - h * 0.6).toFixed(1)} ${(x + w).toFixed(1)} 6`;
    }
    x += w;
    if (rand() < 0.14) {
      x += 2.5;
      d += ` M${x.toFixed(1)} 6`;
    }
  }
  return d;
}

function Scrawl({ seed, w = 100 }: { seed: number; w?: number }) {
  const path = useMemo(() => scrawl(seed, 100), [seed]);
  return (
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="pg-scrawl" style={{ width: `${w}%` }} aria-hidden="true">
      <path d={path} pathLength={1} />
    </svg>
  );
}

/** Empty lines, for the rest of a body. */
function Lines({ n }: { n: number }) {
  return (
    <span className="pg-lines">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} style={{ width: `${[94, 72, 86, 58][i % 4]}%` }} />
      ))}
    </span>
  );
}

/** A photograph's place: a plate with a mountain and a sun drawn on it,
    or a portrait's head and shoulders. */
function Pic({ kind = "land", dark, className = "" }: { kind?: "land" | "person"; dark?: boolean; className?: string }) {
  return (
    <span className={`pg-pic ${dark ? "pg-pic-dark" : ""} ${className}`}>
      {kind === "land" ? (
        <svg viewBox="0 0 40 30" aria-hidden="true">
          <circle cx="29" cy="9" r="3.2" />
          <path d="M4 25 15 13l7 7 5-4 9 9" />
        </svg>
      ) : (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="16" r="7" />
          <path d="M6 40c1-9 7-13 14-13s13 4 14 13" />
        </svg>
      )}
    </span>
  );
}

function Nav({ t }: { t: T }) {
  return (
    <span className="pg-nav">
      <b>Alvor</b>
      <i>{t("Services", "Serviços")}</i>
      <i>{t("Team", "Equipa")}</i>
      <i>{t("Contact", "Contactos")}</i>
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* The five pages, each as that page usually is                      */
/* ---------------------------------------------------------------- */

function HomePage({ t }: { t: T }) {
  return (
    <>
      <Nav t={t} />
      <span className="pg-hero">
        <Pic dark className="pg-hero-pic" />
        <span className="pg-hero-copy">
          <b className="pg-h">{t("Dentistry, with time for it.", "Medicina dentária, sem pressas.")}</b>
          <Scrawl seed={2} w={80} />
          <span className="pg-btn">{t("Book a visit", "Marcar consulta")}</span>
        </span>
      </span>
      <span className="pg-trio">
        {[0, 1, 2].map((i) => (
          <span key={i} className="pg-trio-item">
            <Pic />
            <Scrawl seed={5 + i} w={90} />
          </span>
        ))}
      </span>
      <span className="pg-more">
        <b className="pg-h">{t("Why Alvor", "Porquê a Alvor")}</b>
        <Scrawl seed={8} w={96} />
        <Lines n={3} />
      </span>
    </>
  );
}

function ServicesPage({ t }: { t: T }) {
  const items = [t("Implants", "Implantes"), t("Orthodontics", "Ortodontia"), t("Hygiene", "Higiene")];
  return (
    <>
      <Nav t={t} />
      <b className="pg-h pg-title">{t("Services", "Serviços")}</b>
      <span className="pg-list">
        {items.map((name, i) => (
          <span key={name} className="pg-row">
            <span className="pg-mark" />
            <span className="pg-row-copy">
              <b>{name}</b>
              <Scrawl seed={11 + i} w={92} />
              <Lines n={1} />
            </span>
          </span>
        ))}
      </span>
      <span className="pg-more">
        <span className="pg-btn">{t("Book a visit", "Marcar consulta")}</span>
      </span>
    </>
  );
}

function TeamPage({ t }: { t: T }) {
  return (
    <>
      <Nav t={t} />
      <b className="pg-h pg-title">{t("Team", "Equipa")}</b>
      <span className="pg-people">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="pg-person">
            <Pic kind="person" />
            <Scrawl seed={21 + i} w={70} />
            <Lines n={1} />
          </span>
        ))}
      </span>
    </>
  );
}

function GalleryPage({ t }: { t: T }) {
  return (
    <>
      <Nav t={t} />
      <b className="pg-h pg-title">{t("Gallery", "Galeria")}</b>
      <span className="pg-wall">
        {[0, 1, 2, 3, 4].map((i) => (
          <Pic key={i} dark={i === 1 || i === 4} className={`pg-wall-${i}`} />
        ))}
      </span>
    </>
  );
}

function ContactPage({ t }: { t: T }) {
  return (
    <>
      <Nav t={t} />
      <b className="pg-h pg-title">{t("Contact", "Contactos")}</b>
      <span className="pg-contact">
        <span className="pg-form">
          {[t("Name", "Nome"), t("Email", "E-mail")].map((l) => (
            <span key={l} className="pg-field">
              <small>{l}</small>
              <i />
            </span>
          ))}
          <span className="pg-field pg-field-tall">
            <small>{t("Message", "Mensagem")}</small>
            <i />
          </span>
          <span className="pg-btn">{t("Send", "Enviar")}</span>
        </span>
        <span className="pg-map">
          <span className="pg-pin" />
          <Scrawl seed={31} w={70} />
        </span>
      </span>
    </>
  );
}

type Page = { id: string; label: string; slug: string; chosen: number | null; draw?: (t: T) => ReactNode };

/** The pages the card offers, as the proposal form does (questions.ts),
    with home and contact; five of them are chosen, in this order. */
function cardPages(t: T): Page[] {
  return [
    { id: "home", label: t("Home", "Início"), slug: "", chosen: 0, draw: (t) => <HomePage t={t} /> },
    { id: "services", label: t("Services", "Serviços"), slug: t("services", "servicos"), chosen: 1, draw: (t) => <ServicesPage t={t} /> },
    { id: "team", label: t("Team", "Equipa"), slug: t("team", "equipa"), chosen: 2, draw: (t) => <TeamPage t={t} /> },
    { id: "prices", label: t("Prices", "Preços"), slug: t("prices", "precos"), chosen: null },
    { id: "gallery", label: t("Gallery", "Galeria"), slug: t("gallery", "galeria"), chosen: 3, draw: (t) => <GalleryPage t={t} /> },
    { id: "testimonials", label: t("Testimonials", "Testemunhos"), slug: t("testimonials", "testemunhos"), chosen: null },
    { id: "faq", label: t("FAQ", "Perguntas frequentes"), slug: t("faq", "perguntas"), chosen: null },
    { id: "contact", label: t("Contact", "Contactos"), slug: t("contact", "contactos"), chosen: 4, draw: (t) => <ContactPage t={t} /> },
  ];
}

/** Where each sheet stands as a page of its own, and as a section of the
    one long page, in percentages of the stage. */
function sheetPlace(i: number) {
  return {
    "--wx": `${2.5 + i * 19.4}%`,
    "--wy": "12%",
    "--ww": "17.6%",
    "--wh": "66%",
    "--lx": "27%",
    "--ly": `${5 + i * 18}%`,
    "--lw": "46%",
    "--lh": "18%",
  } as CSSProperties;
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
    <div className={`sbp-card sbx-metal ${run ? "sbp-run" : ""}`} aria-hidden="true" style={{ ["--run" as string]: `${RUN_S}s` }}>
      <style dangerouslySetInnerHTML={{ __html: CARD_CSS }} />

      <div className="sbp-card-side">
        <div className="sbx-switch sbx-switch-dark sbp-modes" style={{ ["--n" as string]: 2 } as CSSProperties}>
          <span className="sbp-modes-thumb" />
          <span className="sbx-switch-opt">
            <span className="sbx-switch-n">01</span>
            {t("Website", "Website")}
          </span>
          <span className="sbx-switch-opt">
            <span className="sbx-switch-n">02</span>
            {t("Landing page", "Landing page")}
          </span>
        </div>

        <ul className="sbp-opts">
          {all.map((p) => (
            <li key={p.id} className="sbp-opt" data-i={p.chosen ?? undefined} data-off={p.chosen === null || undefined}>
              <span className="sbp-tick">
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
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
          <div key={p.id} className="sbp-sheet" data-i={i} data-page={p.id} style={sheetPlace(i)}>
            <span className="pg">{p.draw?.(t)}</span>
            <span className="sbp-path">/{p.slug}</span>
            <span className="sbp-anchor">#{p.slug || t("top", "inicio")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* The call                                                          */
/* ---------------------------------------------------------------- */

type Who = "antonio" | "emanuel" | "client";

function dialogue(t: T): { who: Who; text: string }[] {
  return [
    { who: "client", text: t("A landing page or a website?", "Landing page ou website?") },
    { who: "antonio", text: t("How many services are there to show?", "Quantos serviços há para mostrar?") },
    { who: "client", text: t("Five, each with its own prices.", "Cinco, cada um com os seus preços.") },
    { who: "emanuel", text: t("Then a website, with a page for each service.", "Então um website, com uma página para cada serviço.") },
  ];
}

/** The words, typed in as they are said. */
function useTyped(text: string, on: boolean, still: boolean) {
  const [n, setN] = useState(still ? text.length : 0);
  useEffect(() => {
    if (still) {
      setN(text.length);
      return;
    }
    if (!on) return;
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 34);
    return () => window.clearInterval(id);
  }, [text, on, still]);
  return text.slice(0, n);
}

function Tile({ who, name, speaking, heard }: { who: Who; name: string; speaking: boolean; heard: boolean }) {
  return (
    <span className="sbc-tile" data-who={who} data-speaking={speaking || undefined} data-heard={heard || undefined}>
      <span className="sbc-ring" />
      <span className="sbc-face">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="15" r="6.5" />
          <path d="M7 36c1.5-8 6.5-12 13-12s11.5 4 13 12" />
        </svg>
        <span className="sbc-wave" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
      <span className="sbc-name mono-label">{name}</span>
    </span>
  );
}

function Panel({ who, text, on, still }: { who: Who; text: string; on: boolean; still: boolean }) {
  const typed = useTyped(text, on, still);
  return (
    <span className="sbc-panel" data-who={who} data-on={on || undefined}>
      <span className="sbc-panel-text">
        {typed}
        {on && !still && typed.length < text.length && <span className="sbc-caret" />}
      </span>
    </span>
  );
}

function CallGraph({ t, still }: { t: T; still: boolean }) {
  const lines = useMemo(() => dialogue(t), [t]);
  const [wrap, inView] = useInView<HTMLDivElement>(0.4);
  const [step, setStep] = useState(still ? lines.length - 1 : -1);

  useEffect(() => {
    if (still) setStep(lines.length - 1);
  }, [still, lines.length]);

  useEffect(() => {
    if (still || !inView) return;
    const last = step >= lines.length - 1;
    const id = window.setTimeout(() => setStep(last ? -1 : step + 1), step < 0 ? 900 : last ? 4600 : 3600);
    return () => window.clearTimeout(id);
  }, [step, inView, still, lines.length]);

  const now = step >= 0 ? lines[step]! : null;
  const dir = now ? (now.who === "client" ? "rtl" : "ltr") : "none";
  const names: Record<Who, string> = { antonio: "António", emanuel: "Emanuel", client: t("Client", "Cliente") };

  return (
    <div ref={wrap} className="sbc">
      <div className="sbc-row">
        <div className="sbc-side sbc-us">
          {(["antonio", "emanuel"] as Who[]).map((who) => (
            <span key={who} className="sbc-seat">
              <Panel who={who} text={now?.who === who ? now.text : ""} on={now?.who === who} still={still} />
              <Tile who={who} name={names[who]} speaking={now?.who === who} heard={dir === "rtl"} />
            </span>
          ))}
        </div>

        <div className="sbc-line" data-dir={dir} key={`line-${step}`}>
          <span className="sbc-line-fill" />
          <span className="sbc-line-head" />
        </div>

        <div className="sbc-side sbc-them">
          <span className="sbc-seat">
            <Panel who="client" text={now?.who === "client" ? now.text : ""} on={now?.who === "client"} still={still} />
            <Tile who="client" name={names.client} speaking={now?.who === "client"} heard={dir === "ltr"} />
          </span>
        </div>
      </div>

      <ol className="sr-only">
        {lines.map((l, i) => (
          <li key={i}>
            {names[l.who]}: {l.text}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------- */

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
  const run = mounted && !reduce;

  const steps = [
    { n: "01", name: t("A website or a landing page", "Website ou landing page"), text: t("Several pages, or one with everything.", "Várias páginas, ou uma só com tudo.") },
    { n: "02", name: t("The pages and the sections", "As páginas e as secções"), text: t("Chosen by you, one by one.", "Escolhidas pelo cliente, uma a uma.") },
    { n: "03", name: t("The website", "O website"), text: t("Designed around those choices.", "Desenhado à volta dessas escolhas.") },
  ];

  return (
    <section aria-labelledby="sbp-title" className="sbp relative bg-paper pt-(--section-gap) pb-(--section-gap)">
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
          <SitemapCard t={t} run={run} />
          <figcaption>
            <ol className={`sbp-steps ${run ? "sbp-run" : ""}`} style={{ ["--run" as string]: `${RUN_S}s` }}>
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

        <div className="sbp-ask sbx-metal">
          <CallGraph t={t} still={reduce} />
          <div className="sbp-ask-foot">
            <h3 className="sbp-answer display">
              <span className="font-light sm:block">{t("Not sure what to choose? Don’t worry.", "Sem saber o que escolher? Não há problema.")}</span>{" "}
              <span className="font-medium sm:block">{t("When we meet, we’ll help you choose.", "Na reunião que marcamos, ajudamos a escolher.")}</span>
            </h3>
            <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
          </div>
        </div>
      </div>
    </section>
  );
}
