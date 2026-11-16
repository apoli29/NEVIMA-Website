"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { Glass } from "./cta-glass";
import { useOriginFade, useProposal } from "./proposal-flow";
import { useInView, type T } from "./sbs-shared";
import { SECTORS } from "@/lib/proposal/questions";
import { useHref, useLang, useT } from "@/lib/use-lang";

/* ==================================================================
   Personalization

   One card, on the page's own white, ruled by hairlines, that is played
   and not touched. The kinds of business the proposal form asks about
   (SECTORS, questions.ts) float about it; after two seconds one of them
   is chosen (it fills with ink, as the bar's button fills, takes a tick,
   the others fall away and it goes up to the card's corner); the switch
   beside it settles on a website or a landing page; and only then does
   the frame come in and the website put itself together, laid out as
   that kind of business usually lays its website out: a restaurant's
   photograph, menu and table booking; a clinic's one long page with its
   treatments and a button to book; an estate agent's search and the
   houses under it. Titles and buttons are real words; the body is a
   doctor's hand, scrawled on and illegible, or plain empty lines.

   It does not loop: when one business is done, a white sheet set to
   invert what is under it wipes across the card and the next one plays
   in negative; at the end of that one the sheet wipes off. Under the
   card, the three steps it plays, each lit while it happens.

   Below, the doubt and the call: a drawing of a video call, António and
   Emanuel on one side, the client on the other, a line between them. Each
   time one of them speaks a cloud rises over them and the line fills
   from the one speaking to the one listening, who answers, and the line
   fills back. Drawn as by hand (a slight tremor on every stroke), in ink
   on the page's white.

   Nothing here runs off the screen, and for anyone who has asked for
   less motion the card shows its first website built and the call its
   last answer.
   ================================================================== */

type Mode = "website" | "landing";
type Kind = "restaurant" | "clinic" | "estate";
type Phase = "float" | "pick" | "build" | "out";
type SectorId = (typeof SECTORS)[number]["id"];

/** The businesses the card builds for, in order, and what each becomes. */
const RUNS: { sector: SectorId; kind: Kind; mode: Mode }[] = [
  { sector: "hospitality", kind: "restaurant", mode: "website" },
  { sector: "health", kind: "clinic", mode: "landing" },
  { sector: "realestate", kind: "estate", mode: "website" },
];

/** Where the floating businesses rest, in percentages of the board. */
const DRIFT: { id: SectorId; x: number; y: number }[] = [
  { id: "health", x: 6, y: 8 },
  { id: "beauty", x: 38, y: 4 },
  { id: "realestate", x: 70, y: 12 },
  { id: "hospitality", x: 16, y: 32 },
  { id: "lodging", x: 50, y: 28 },
  { id: "retail", x: 78, y: 40 },
  { id: "professional", x: 4, y: 58 },
  { id: "sport", x: 34, y: 54 },
  { id: "education", x: 60, y: 64 },
  { id: "events", x: 18, y: 82 },
  { id: "creative", x: 46, y: 86 },
  { id: "trades", x: 70, y: 82 },
];

/** How long each phase lasts, in milliseconds. */
const PHASE_MS: Record<Phase, number> = { float: 2200, pick: 1600, build: 7200, out: 700 };
const WIPE_MS = 900;

/* ---------------------------------------------------------------- */
/* The doctor's hand                                                 */
/* ---------------------------------------------------------------- */

/** A scrawl: a run of loops of uneven size, as a hurried hand writes,
    in a box `width` wide and 10 tall. The same seed always gives the
    same line. */
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

const delay = (d: number) => ({ ["--d" as string]: d }) as CSSProperties;

function Scrawl({ seed, width = 100, d = 0 }: { seed: number; width?: number; d?: number }) {
  const path = useMemo(() => scrawl(seed, width), [seed, width]);
  return (
    <svg viewBox={`0 0 ${width} 10`} preserveAspectRatio="none" className="sbp-scrawl" style={{ ...delay(d), width: `${width}%` }}>
      <path d={path} pathLength={1} />
    </svg>
  );
}

/** Empty lines, for the rest of the body. */
function Lines({ n, d = 0 }: { n: number; d?: number }) {
  return (
    <span className="sbp-lines" style={delay(d)}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} style={{ width: `${[92, 70, 84, 62][i % 4]}%` }} />
      ))}
    </span>
  );
}

/** A photograph's place: a grey plate with a mountain and a sun drawn
    on it, as a layout marks where a picture will go. */
function Picture({ dark, d = 0, className = "" }: { dark?: boolean; d?: number; className?: string }) {
  return (
    <span className={`sbp-pic ${dark ? "sbp-pic-dark" : ""} ${className}`} style={delay(d)}>
      <svg viewBox="0 0 40 30" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <circle cx="29" cy="9" r="3.2" />
        <path d="M4 25 15 13l7 7 5-4 9 9" />
      </svg>
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* The three websites                                                */
/* ---------------------------------------------------------------- */

function Restaurant({ t }: { t: T }) {
  return (
    <div className="sbp-site">
      <div className="sbp-nav sbp-in" style={delay(0)}>
        <b>Maré</b>
        <span>{t("Menu", "Menu")}</span>
        <span>{t("Bookings", "Reservas")}</span>
        <span>{t("Contact", "Contactos")}</span>
      </div>
      <div className="sbp-hero-photo">
        <Picture dark d={1} className="sbp-fill" />
        <div className="sbp-hero-over">
          <h4 className="sbp-in" style={delay(2)}>
            {t("Market cooking, by the river.", "Cozinha de mercado, à beira-rio.")}
          </h4>
          <Scrawl seed={3} width={55} d={2.6} />
          <span className="sbp-btn sbp-btn-light sbp-in" style={delay(3.4)}>
            {t("Book a table", "Reservar mesa")}
          </span>
        </div>
      </div>
      <div className="sbp-row">
        <div className="sbp-col">
          <h5 className="sbp-in" style={delay(4.2)}>
            {t("The menu", "O menu")}
          </h5>
          {[0, 1, 2].map((i) => (
            <div key={i} className="sbp-item sbp-in" style={delay(4.6 + i * 0.4)}>
              <Scrawl seed={10 + i} width={62} d={4.8 + i * 0.4} />
              <span>{["14 €", "18 €", "9 €"][i]}</span>
            </div>
          ))}
        </div>
        <Picture d={5} className="sbp-square" />
        <Picture d={5.4} className="sbp-square" />
      </div>
    </div>
  );
}

function Clinic({ t }: { t: T }) {
  return (
    <div className="sbp-site">
      <div className="sbp-nav sbp-in" style={delay(0)}>
        <b>Alvor</b>
        <span className="sbp-btn sbp-btn-ink">{t("Book an appointment", "Marcar consulta")}</span>
      </div>
      <div className="sbp-split">
        <div className="sbp-col">
          <h4 className="sbp-in" style={delay(1)}>
            {t("Dentistry, with time for it.", "Medicina dentária, sem pressas.")}
          </h4>
          <Scrawl seed={21} width={90} d={1.8} />
          <Scrawl seed={22} width={66} d={2.3} />
          <span className="sbp-btn sbp-btn-ink sbp-in" style={delay(3)}>
            {t("Book an appointment", "Marcar consulta")}
          </span>
        </div>
        <Picture d={1.6} className="sbp-portrait" />
      </div>
      <div className="sbp-tiles">
        {[t("Implants", "Implantes"), t("Orthodontics", "Ortodontia"), t("Hygiene", "Higiene")].map((name, i) => (
          <div key={name} className="sbp-tile sbp-in" style={delay(3.8 + i * 0.4)}>
            <span className="sbp-tile-mark" />
            <h6>{name}</h6>
            <Lines n={2} d={4.2 + i * 0.4} />
          </div>
        ))}
      </div>
      <div className="sbp-band sbp-in" style={delay(5.4)}>
        <Scrawl seed={31} width={46} d={5.7} />
        <span className="sbp-btn sbp-btn-light">{t("Book an appointment", "Marcar consulta")}</span>
      </div>
    </div>
  );
}

function Estate({ t }: { t: T }) {
  return (
    <div className="sbp-site">
      <div className="sbp-nav sbp-in" style={delay(0)}>
        <b>Casa Norte</b>
        <span>{t("Homes", "Imóveis")}</span>
        <span>{t("Sell", "Vender")}</span>
        <span>{t("About", "Sobre")}</span>
        <span>{t("Contact", "Contactos")}</span>
      </div>
      <div className="sbp-search-hero">
        <h4 className="sbp-in" style={delay(1)}>
          {t("Homes with a history, in Porto.", "Casas com história, no Porto.")}
        </h4>
        <div className="sbp-search sbp-in" style={delay(1.8)}>
          <span>{t("Type", "Tipologia")}</span>
          <span>{t("Area", "Zona")}</span>
          <span className="sbp-btn sbp-btn-ink">{t("Search", "Procurar")}</span>
        </div>
      </div>
      <div className="sbp-cards">
        {["385 000 €", "240 000 €", "512 000 €"].map((price, i) => (
          <div key={price} className="sbp-house">
            <Picture d={2.8 + i * 0.5} className="sbp-house-pic" />
            <b className="sbp-in" style={delay(3.4 + i * 0.5)}>
              {price}
            </b>
            <Scrawl seed={41 + i} width={80} d={3.8 + i * 0.5} />
            <small className="sbp-in" style={delay(4.2 + i * 0.5)}>
              {["T3 · 120 m²", "T2 · 84 m²", "T4 · 168 m²"][i]}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* The card                                                          */
/* ---------------------------------------------------------------- */

function BuildCard({ t, still, onStep }: { t: T; still: boolean; onStep: (step: number) => void }) {
  const lang = useLang();
  const [card, inView] = useInView<HTMLDivElement>(0.35);
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>(still ? "build" : "float");
  /** The inverting sheet: off to the left, across, or off to the right. */
  const [sheet, setSheet] = useState<"left" | "on" | "right">("left");
  const [snap, setSnap] = useState(false);

  useEffect(() => {
    if (still) setPhase("build");
  }, [still]);

  const current = RUNS[run % RUNS.length]!;
  const label = (id: SectorId) => {
    const s = SECTORS.find((x) => x.id === id)!;
    return lang === "pt" ? s.pt : s.label;
  };

  // The one clock: each phase schedules the next while the card is seen.
  useEffect(() => {
    if (still || !inView) return;
    const next: Record<Phase, () => void> = {
      float: () => setPhase("pick"),
      pick: () => setPhase("build"),
      build: () => setPhase("out"),
      // the sheet crosses, and the next business plays on the other side
      // of it, all in one step, so nothing can be left half done
      out: () => {
        setSheet((s) => (s === "on" ? "right" : "on"));
        setRun((r) => r + 1);
        setPhase("float");
      },
    };
    const id = window.setTimeout(next[phase], PHASE_MS[phase]);
    return () => window.clearTimeout(id);
  }, [phase, inView, still]);

  // Once off to the right, the sheet goes back to the left unseen.
  useEffect(() => {
    if (sheet !== "right") return;
    const id = window.setTimeout(() => {
      setSnap(true);
      setSheet("left");
      requestAnimationFrame(() => requestAnimationFrame(() => setSnap(false)));
    }, WIPE_MS + 50);
    return () => window.clearTimeout(id);
  }, [sheet]);

  useEffect(() => {
    onStep(phase === "float" ? 0 : phase === "pick" ? 1 : 2);
  }, [phase, onStep]);

  const picked = phase !== "float";
  const modes = [
    { id: "website", label: t("Website", "Website") },
    { id: "landing", label: t("Landing page", "Landing page") },
  ];
  const modeAt = picked ? (current.mode === "website" ? 0 : 1) : -1;

  return (
    <div ref={card} className="sbp-card" data-phase={phase} data-sheet={sheet} data-snap={snap || undefined} aria-hidden="true">
      <div className="sbp-card-head">
        <span className="sbp-slot mono-label">{t("Business", "Negócio")}</span>
        <div
          className="sbx-switch sbp-modes"
          data-on={modeAt >= 0 || undefined}
          style={{ ["--at" as string]: Math.max(0, modeAt), ["--n" as string]: 2 } as CSSProperties}
        >
          <span className="sbx-switch-thumb" />
          {modes.map((m, i) => (
            <span key={m.id} className="sbx-switch-opt" aria-checked={i === modeAt}>
              <span className="sbx-switch-n">{String(i + 1).padStart(2, "0")}</span>
              {m.label}
            </span>
          ))}
        </div>
      </div>

      <div className="sbp-board">
        {DRIFT.map((b, i) => {
          const chosen = b.id === current.sector;
          return (
            <span
              key={`${run}-${b.id}`}
              className="sbp-biz"
              data-chosen={chosen || undefined}
              style={{ ["--x" as string]: `${b.x}%`, ["--y" as string]: `${b.y}%`, ["--i" as string]: i } as CSSProperties}
            >
              <span className="sbp-biz-fill" />
              <span className="sbp-biz-label">
                <span className="sbp-biz-tick">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2.5 6.2 5 8.6l4.6-5" />
                  </svg>
                </span>
                {label(b.id)}
              </span>
            </span>
          );
        })}

        <div className="sbp-frame" key={`frame-${run}`}>
          <span className="sbp-frame-bar">
            <i />
            <i />
            <i />
          </span>
          <div className="sbp-frame-page">
            {current.kind === "restaurant" ? <Restaurant t={t} /> : current.kind === "clinic" ? <Clinic t={t} /> : <Estate t={t} />}
          </div>
        </div>
      </div>

      <span className="sbp-invert" />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* The call                                                          */
/* ---------------------------------------------------------------- */

type Who = "antonio" | "emanuel" | "client";

/** Where each of them sits in the drawing (its own 1000 by 420). */
const SEAT: Record<Who, number> = { antonio: 150, emanuel: 310, client: 830 };

function dialogue(t: T): { who: Who; text: string }[] {
  return [
    { who: "client", text: t("A landing page or a website?", "Landing page ou website?") },
    { who: "antonio", text: t("How many services are there to show?", "Quantos serviços há para mostrar?") },
    { who: "client", text: t("Five, each with its own prices.", "Cinco, cada um com os seus preços.") },
    { who: "emanuel", text: t("Then a website, with a page for each service.", "Então um website, com uma página para cada serviço.") },
  ];
}

/** A cloud's outline round a box of w by h, bumps all the way round. */
function cloudPath(w: number, h: number) {
  const out: string[] = [];
  const side = (from: [number, number], to: [number, number], n: number, push: [number, number]) => {
    for (let i = 0; i < n; i++) {
      const bx = from[0] + ((to[0] - from[0]) * (i + 1)) / n;
      const by = from[1] + ((to[1] - from[1]) * (i + 1)) / n;
      const mx = from[0] + ((to[0] - from[0]) * (i + 0.5)) / n + push[0];
      const my = from[1] + ((to[1] - from[1]) * (i + 0.5)) / n + push[1];
      out.push(`Q${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);
    }
  };
  const b = 11;
  side([0, 0], [w, 0], 6, [0, -b]);
  side([w, 0], [w, h], 2, [b, 0]);
  side([w, h], [0, h], 6, [0, b]);
  side([0, h], [0, 0], 2, [-b, 0]);
  return `M0 0 ${out.join(" ")} Z`;
}
const CLOUD = cloudPath(200, 70);

function Cloud({ text, side, on }: { text: string; side: "left" | "right"; on: boolean }) {
  return (
    <span className="sbp-cloud" data-side={side} data-on={on || undefined}>
      <svg className="sbp-cloud-shape" viewBox="-14 -14 228 98" preserveAspectRatio="none" aria-hidden="true">
        <path d={CLOUD} filter="url(#sbp-hand)" />
      </svg>
      <span className="sbp-cloud-text">{text}</span>
      <svg className="sbp-cloud-tail" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="14" cy="9" r="6" />
        <circle cx="24" cy="27" r="3.5" />
      </svg>
    </span>
  );
}

/** A person, drawn as a quick sketch: head, neck, shoulders, and the
    hair that tells them apart. */
function Person({ x, hair }: { x: number; hair: "short" | "swept" | "long" }) {
  const hairs = {
    short: `M${x - 30} 176 Q${x - 26} 140 ${x} 138 Q${x + 28} 140 ${x + 31} 174 Q${x + 18} 156 ${x} 156 Q${x - 16} 155 ${x - 30} 176`,
    swept: `M${x - 32} 180 Q${x - 34} 138 ${x + 4} 136 Q${x + 36} 138 ${x + 32} 168 Q${x + 10} 146 ${x - 18} 158 Q${x - 26} 166 ${x - 32} 180`,
    long: `M${x - 34} 222 Q${x - 42} 140 ${x} 136 Q${x + 42} 140 ${x + 34} 222 Q${x + 30} 180 ${x + 22} 162 Q${x} 150 ${x - 22} 162 Q${x - 30} 180 ${x - 34} 222`,
  };
  return (
    <g>
      <path d={hairs[hair]} className="sbp-hair" />
      <ellipse cx={x} cy={178} rx={31} ry={36} />
      <path d={`M${x - 14} 180 q3 -3 6 0 M${x + 8} 180 q3 -3 6 0 M${x - 7} 197 q7 5 14 0`} className="sbp-face" />
      <path d={`M${x - 10} 212 L${x - 12} 228 M${x + 10} 212 L${x + 12} 228`} />
      <path d={`M${x - 72} 300 Q${x - 66} 238 ${x - 12} 228 Q${x} 236 ${x + 12} 228 Q${x + 66} 238 ${x + 72} 300`} />
    </g>
  );
}

const WIRE = "M452 240 Q576 226 698 240";
const WIRE_BACK = "M698 240 Q576 226 452 240";

function CallSketch({ t, still }: { t: T; still: boolean }) {
  const lines = useMemo(() => dialogue(t), [t]);
  const [wrap, inView] = useInView<HTMLDivElement>(0.4);
  const [step, setStep] = useState(still ? lines.length - 1 : -1);

  useEffect(() => {
    if (still) setStep(lines.length - 1);
  }, [still, lines.length]);

  useEffect(() => {
    if (still || !inView) return;
    const last = step >= lines.length - 1;
    const id = window.setTimeout(() => setStep(last ? -1 : step + 1), step < 0 ? 900 : last ? 4400 : 3400);
    return () => window.clearTimeout(id);
  }, [step, inView, still, lines.length]);

  const now = step >= 0 ? lines[step]! : null;
  const fromLeft = now ? now.who !== "client" : true;

  return (
    <div ref={wrap} className="sbp-call">
      <svg viewBox="0 0 1000 420" className="sbp-call-svg" aria-hidden="true">
        <defs>
          <filter id="sbp-hand" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="3.2" />
          </filter>
        </defs>
        <g filter="url(#sbp-hand)" className="sbp-ink">
          {/* the two windows of the call */}
          <path d="M40 104 L450 102 L452 330 L38 332 Z" />
          <path d="M698 104 L960 106 L958 330 L700 328 Z" />
          <path d="M40 128 L450 126 M698 128 L960 130" className="sbp-ink-thin" />
          <circle cx="58" cy="115" r="4" className="sbp-ink-thin" />
          <circle cx="716" cy="117" r="4" className="sbp-ink-thin" />
          <Person x={SEAT.antonio} hair="short" />
          <Person x={SEAT.emanuel} hair="swept" />
          <Person x={SEAT.client} hair="long" />
          <path d={WIRE} className="sbp-wire" />
        </g>
        <g filter="url(#sbp-hand)">
          <path key={`l-${step}`} d={WIRE} className="sbp-wire-fill" pathLength={1} data-on={(now && fromLeft) || undefined} />
          <path key={`r-${step}`} d={WIRE_BACK} className="sbp-wire-fill" pathLength={1} data-on={(now && !fromLeft) || undefined} />
        </g>
        <text x={SEAT.antonio} y={368} className="sbp-name">
          António
        </text>
        <text x={SEAT.emanuel} y={368} className="sbp-name">
          Emanuel
        </text>
        <text x={SEAT.client} y={368} className="sbp-name">
          {t("Client", "Cliente")}
        </text>
      </svg>

      {(["antonio", "emanuel", "client"] as Who[]).map((who) => {
        const said = now && now.who === who ? now.text : null;
        const lastSaid = lines
          .slice(0, Math.max(0, step + 1))
          .reverse()
          .find((l) => l.who === who);
        return (
          <span key={who} className="sbp-seat" style={{ ["--x" as string]: `${SEAT[who] / 10}%` } as CSSProperties}>
            <Cloud text={said ?? lastSaid?.text ?? ""} side={who === "client" ? "right" : "left"} on={!!said} />
          </span>
        );
      })}

      <ol className="sr-only">
        {lines.map((l, i) => (
          <li key={i}>
            {l.who === "client" ? t("Client", "Cliente") : l.who === "antonio" ? "António" : "Emanuel"}: {l.text}
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
  const look = "cta-drop relative isolate inline-flex items-center justify-center text-[0.9375rem] leading-none whitespace-nowrap";
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
  const [step, setStep] = useState(0);

  const steps = [
    { n: "01", name: t("The business", "O negócio"), text: t("Every website starts from the business it shows.", "Cada website parte do negócio que apresenta.") },
    { n: "02", name: t("A website or a landing page", "Website ou landing page"), text: t("Several pages, or one with everything.", "Várias páginas, ou uma só com tudo.") },
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
          <BuildCard t={t} still={reduce} onStep={setStep} />
          <figcaption>
            <ol className="sbp-steps">
              {steps.map((s, i) => (
                <li key={s.n} className="sbp-step" data-on={reduce || i === step || undefined}>
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

        <div className="sbp-ask">
          <CallSketch t={t} still={reduce} />
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
