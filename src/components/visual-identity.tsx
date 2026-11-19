"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { SlideIn } from "./enter";
import { BeforeAfter } from "./project-report";
import { ToneRoom } from "./tone-veil";
import { ProposalAsk } from "./about-faq";
import { useInView, type T } from "./sbs-shared";
import { BRANDS, Mark, PilarNewLogo, PilarOldLogo } from "./vi-brands";
import { TO_FILL } from "@/lib/work";
import { useT } from "@/lib/use-lang";

/* ==================================================================
   Visual Identity

   The service's own page (user, 2026-11-17), set as the photo shoot's
   and SEO & GEO's are, so the three read as one system: one ToneRoom
   whose sections turn from light to dark under the tonal veil, the same
   SlideIn on every heading.

   Reshaped by the user on 2026-11-19, twice:

   1. The header: the title and three grey cards, each the card of
      "Not sure?" - the mark taken apart and built again on its own
      brand's ground. Only the first is filled (Pilar); the other two
      wait for the cases the studio is adding.
   2. Why it is worth it: the text set as one large statement, its key
      ideas lit by black blocks as they are reached (after Bandcamp,
      through Inspo), and under it a short piece of motion graphics: the
      client takes the phone out, the camera goes into the screen, and
      back to the face, which reacts and speaks - once to the old
      identity, once to the new.
   3. Does it make sense for every business? On the dark ground, the
      question held in the middle of the screen until the scroll turns
      it into "No.", which then goes to the left under the question, now
      the section's title; the two lists of cases and the grey card come
      up close under them.
   4. How the price works.

   The proposal in three things seen (the slider, the symbol on its
   grid, the website mockup) was taken off the page as a near repeat of
   section 2; it is kept whole below, out of use, in Proposal.

   The construction grid around the symbol is ours and generic — the
   guides a mark is built on — not any client's geometry. References
   through Inspo: Orpetron (the mark shown as a seal with its
   construction in view) and Feathericons (the mark as a specimen in a
   ruled cell). Their colour and type stay with them.
   ================================================================== */

/* ---- the header -------------------------------------------------- */

/** Three of the grey card that closes "Does it make sense?" (user,
    2026-11-19): the first carries Pilar's loop, the other two stand
    empty for the two cases the studio is about to add. One over the
    other on a phone. */
function Cases3({ t }: { t: T }) {
  const pilar = BRANDS[0]!;
  // The mark exactly as the grey card of "Not sure?" shows it, in a much
  // thinner rim of grey; the trade over it and the name under it, both
  // outside the card (user, 2026-11-19).
  const items = [
    { key: "pilar", trade: pilar.trade(t), name: pilar.name, body: <Morph t={t} bare /> },
    { key: "next-1", trade: TO_FILL, name: TO_FILL, body: <span className="vi-trio-wait" aria-hidden="true" /> },
    { key: "next-2", trade: TO_FILL, name: TO_FILL, body: <span className="vi-trio-wait" aria-hidden="true" /> },
  ];
  return (
    <div className="vi-trio">
      {items.map((it) => (
        <figure key={it.key} className="vi-trio-item" data-empty={it.key !== "pilar" || undefined}>
          <span className="mono-label vi-trio-trade">{it.trade}</span>
          <div className="vi-trio-card">{it.body}</div>
          <figcaption className="vi-trio-name">{it.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/** The title and the three cards, and nothing else. */
function Head({ t }: { t: T }) {
  return (
    <section data-tone="dark" className="relative isolate text-paper">
      <header className="shell ps-head" data-tone-body>
        <SlideIn ready>
          <h1 className="display max-w-[18ch] text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98] font-light">
            {t("Visual identity", "Identidade visual")}
          </h1>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.12}>
          <Cases3 t={t} />
        </SlideIn>
      </header>
    </section>
  );
}

/* ---- the opening ------------------------------------------------- */

/** A key idea of the statement: a black block draws itself behind it,
    from the left and line by line, once it is reached, and its words
    turn white over it - the way the back-end page lights "hours". */
function Lit({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLSpanElement>(0.9);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (inView) setOn(true);
  }, [inView]);
  return (
    <span ref={ref} className="vi-lit" data-on={on || reduce || undefined}>
      {children}
    </span>
  );
}

function Opening({ t }: { t: T }) {
  return (
    <section data-tone="light" className="relative">
      <div className="shell ps-open vi-open" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("Why it is worth it", "Porque vale a pena")}</p>
          <h2 className="display ps-open-title">
            <span className="font-light sm:block">{t("A client's first impression", "A primeira impressão de um cliente")}</span>{" "}
            <span className="font-medium sm:block">{t("rests on a mark.", "assenta numa marca.")}</span>
          </h2>
        </SlideIn>

        {/* The two paragraphs, every word kept, set as one statement
            (after Bandcamp's, through Inspo): large, and the three ideas
            that carry it lit as they are reached. */}
        <div className="vi-say">
          <SlideIn ready distance={0} delay={0.06}>
            <p className="vi-say-p">
              {t("It rests on the core of an organisational identity: ", "Assenta no núcleo de uma identidade organizacional: ")}
              <Lit>{t("the logo, and the symbol beside it.", "o logótipo e o símbolo ao lado dele.")}</Lit>{" "}
              {t(
                "When that core is out of date — or never matched what the company became — the best-built website in the world ",
                "Quando esse núcleo está desatualizado — ou nunca correspondeu ao que a empresa veio a ser —, o website mais bem feito do mundo ",
              )}
              <Lit>{t("contradicts it.", "entra em contradição com ele.")}</Lit>
            </p>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.1}>
            <p className="vi-say-p vi-say-p2">
              {t(
                "That is why this service is sold inside the web design: a compact visual identity, drawn at the same time as the look and the feel of the website, so that ",
                "É por isso que este serviço se vende dentro do web design: uma identidade visual mais compacta, desenhada ao mesmo tempo que a estética e a aparência do website, para que ",
              )}
              <Lit>{t("everything speaks the same language.", "tudo fale a mesma linguagem.")}</Lit>
            </p>
          </SlideIn>
        </div>

        <SlideIn ready distance={0} delay={0.12}>
          <Glance t={t} />
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- the client, looking it up: motion graphics ------------------ */

type Shot = "wide" | "raise" | "screen" | "face";

/** One take, as it is seen: where the camera is and for how long. Run
    twice - the old identity, then the new - and then again. */
const TAKE: { shot: Shot; ms: number }[] = [
  { shot: "wide", ms: 900 }, // the client, the phone down
  { shot: "raise", ms: 1100 }, // the phone comes up
  { shot: "screen", ms: 2300 }, // into the screen: the website
  { shot: "face", ms: 3300 }, // back to the face, which reacts and speaks
];

/** Where the camera points, in percent of the stage, and how close.
    The figure is drawn in an 800 by 450 field: the phone in the hand at
    (452, 236), the face at (330, 140). */
const CAMERA: Record<Shot, { x: number; y: number; s: number }> = {
  wide: { x: 50, y: 50, s: 1 },
  raise: { x: 50, y: 50, s: 1 },
  screen: { x: 56.5, y: 52.4, s: 6.5 },
  face: { x: 44, y: 32, s: 2.3 },
};

/** The words typed in as they are said, as the call types them. */
function useTyped(text: string, on: boolean, still: boolean) {
  const [n, setN] = useState(still ? text.length : 0);
  useEffect(() => {
    if (still) {
      setN(text.length);
      return;
    }
    if (!on) {
      setN(0);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 40);
    return () => window.clearInterval(id);
  }, [text, on, still]);
  return text.slice(0, n);
}

/** What the phone shows, close up: Pilar's website with the identity it
    had, or with the one it has. */
function Site({ t, side, on }: { t: T; side: "old" | "new"; on: boolean }) {
  return (
    <span className="vi-site" data-side={side} data-on={on || undefined}>
      <span className="vi-site-bar">
        <span className="vi-site-logo">{side === "old" ? <PilarOldLogo t={t} /> : <PilarNewLogo t={t} />}</span>
        <span className="vi-site-burger">
          <i />
          <i />
          {side === "old" && <i />}
        </span>
      </span>
      <span className="vi-site-pic" />
      <span className="vi-site-lines">
        <i />
        <i />
        <i />
      </span>
      <span className="vi-site-cards">
        <i />
        <i />
      </span>
    </span>
  );
}

/** The client and the phone, as a short film (user, 2026-11-19: not the
    call card's structure, only its figure and its words). The figure is
    a white line on the dark ground: the phone comes up, the camera goes
    into the screen, then back to the face, which frowns and speaks at
    the old identity, and the same again smiling at the new one. One
    camera, moved by transform; the scenes overlap so no frame is empty.
    With less motion it holds on the last shot: the face, smiling, and
    what it says. */
function Glance({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = reduce || !mounted;
  const [ref, inView] = useInView<HTMLDivElement>(0.45);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (still || !inView) return;
    const id = window.setTimeout(() => setBeat((b) => (b + 1) % (TAKE.length * 2)), TAKE[beat % TAKE.length]!.ms);
    return () => window.clearTimeout(id);
  }, [beat, inView, still]);

  const round = still ? 1 : Math.floor(beat / TAKE.length);
  const shot: Shot = still ? "face" : TAKE[beat % TAKE.length]!.shot;
  const side = round === 0 ? "old" : "new";
  const up = shot !== "wide";
  const mood = shot === "face" ? (side === "old" ? "bad" : "good") : "none";
  const words = side === "old" ? t("Are they even still around?", "Será que ainda existem?") : t("These I’d trust.", "Nestes confiava.");
  const typed = useTyped(words, mood !== "none", still);
  const cam = CAMERA[shot];
  const camStyle = {
    transform: `translate(${50 - cam.s * cam.x}%, ${50 - cam.s * cam.y}%) scale(${cam.s})`,
  };

  return (
    <div
      ref={ref}
      className="vi-mg"
      data-shot={shot}
      data-still={still || undefined}
      role="img"
      aria-label={t(
        "A client looks Pilar up on a phone: the old identity puts them off, the new one wins them over.",
        "Um cliente procura a Pilar no telemóvel: a identidade antiga afasta-o, a nova convence-o.",
      )}
    >
      <div className="vi-mg-stage" aria-hidden="true">
        <div className="vi-mg-cam" style={camStyle}>
          <svg viewBox="0 0 800 450" className="vi-mg-art">
            <line x1="120" y1="430" x2="680" y2="430" className="vi-mg-floor" />
            {/* the figure */}
            <path d="M258 430 C262 300 290 196 330 196 C370 196 398 300 402 430" className="vi-mg-line" />
            <circle cx="330" cy="140" r="36" className="vi-mg-line vi-mg-head" />
            {/* the face */}
            <g className="vi-mg-face" data-mood={mood}>
              <circle cx="318" cy="134" r="3.2" className="vi-mg-dot" />
              <circle cx="342" cy="134" r="3.2" className="vi-mg-dot" />
              <path d="M307 120l12 4M353 120l-12 4" className="vi-mg-feel" data-for="bad" />
              <path d="M318 159q12-8 24 0" className="vi-mg-feel" data-for="bad" />
              <path d="M316 152q14 12 28 0" className="vi-mg-feel" data-for="good" />
              <path d="M319 156h22" className="vi-mg-feel" data-for="none" />
            </g>
            {/* the arm and the phone in its hand, raised from the shoulder */}
            <g className="vi-mg-arm" data-up={up || undefined}>
              <path d="M374 232 Q404 318 412 326 Q432 300 448 262" className="vi-mg-line" />
              <rect x="439" y="212" width="27" height="48" rx="5" className="vi-mg-phone" />
              <rect x="442" y="217" width="21" height="38" rx="2" className="vi-mg-glass" data-side={side} />
            </g>
          </svg>
        </div>

        {/* Inside the phone: the screen, crisp, once the camera is in. */}
        <div className="vi-mg-screen" data-on={shot === "screen" || undefined}>
          <span className="vi-mg-frame">
            <Site t={t} side="old" on={side === "old"} />
            <Site t={t} side="new" on={side === "new"} />
          </span>
        </div>

        {/* What the face says, beside it. */}
        <div className="vi-mg-say" data-on={mood !== "none" || undefined}>
          <span className="vi-mg-say-text">
            {typed}
            {!still && typed.length < words.length && <span className="sbc-caret" />}
          </span>
        </div>
      </div>

      <div className="vi-mg-foot">
        <span className="vi-mg-steps" aria-hidden="true">
          {[0, 1].map((n) => (
            <i key={n} data-on={n === round || undefined} />
          ))}
        </span>
        <span className="mono-label vi-mg-cap">
          {side === "old" ? t("The identity they had", "A identidade que tinham") : t("The identity they have", "A identidade que passam a ter")}
        </span>
      </div>
    </div>
  );
}

/* ---- kept, out of use: the proposal, in three things seen -------- */

/** The guides a mark is built on: the square, its halves, its
    diagonals and the circle inscribed in it. Ours and generic — no
    client's geometry is drawn here. */
function Grid({ drawn }: { drawn: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className="vi-grid" data-in={drawn || undefined} aria-hidden="true">
      <rect x="20" y="20" width="160" height="160" className="vi-g-rule" style={{ ["--d" as string]: 640, ["--o" as string]: "0s" }} />
      <line x1="100" y1="20" x2="100" y2="180" className="vi-g-rule" style={{ ["--d" as string]: 160, ["--o" as string]: "0.18s" }} />
      <line x1="20" y1="100" x2="180" y2="100" className="vi-g-rule" style={{ ["--d" as string]: 160, ["--o" as string]: "0.26s" }} />
      <line x1="20" y1="20" x2="180" y2="180" className="vi-g-rule vi-g-faint" style={{ ["--d" as string]: 227, ["--o" as string]: "0.34s" }} />
      <line x1="180" y1="20" x2="20" y2="180" className="vi-g-rule vi-g-faint" style={{ ["--d" as string]: 227, ["--o" as string]: "0.42s" }} />
      <circle cx="100" cy="100" r="80" className="vi-g-rule" style={{ ["--d" as string]: 503, ["--o" as string]: "0.5s" }} />
      <circle cx="100" cy="100" r="50" className="vi-g-rule vi-g-faint" style={{ ["--d" as string]: 314, ["--o" as string]: "0.58s" }} />
      {/* The four corners of the field, marked as a proof sheet marks them. */}
      {[
        [20, 20],
        [180, 20],
        [20, 180],
        [180, 180],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" className="vi-g-dot" />
      ))}
    </svg>
  );
}

/** A place for one image: the label of what belongs there while it is
    missing, and the shape it will keep when it arrives. */
function Slot({ src, label, ratio, dark }: { src: string; label: string; ratio: string; dark?: boolean }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="vi-slot" data-dark={dark || undefined} style={{ aspectRatio: ratio }}>
      {broken ? (
        <span className="vi-slot-say mono-label">{label}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          draggable={false}
          ref={(node) => {
            if (node && node.complete && node.naturalWidth === 0) setBroken(true);
          }}
          onError={() => setBroken(true)}
        />
      )}
    </span>
  );
}

/** Taken off the page on 2026-11-19 (user: a near repeat of the client
    looking it up), kept whole so it can come back: a line in
    VisualIdentity below and nothing else. */
export function Proposal({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const drawn = inView || reduce;

  return (
    <section aria-labelledby="vi-prop-title" data-tone="dark" className="relative text-paper">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("The proposal", "A proposta")}</p>
          <h2 id="vi-prop-title" className="display ps-title">
            <span className="font-light sm:block">{t("The mark is redrawn,", "A marca é refeita,")}</span>{" "}
            <span className="font-medium sm:block">{t("and the website is drawn with it.", "e o website é desenhado com ela.")}</span>
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <p className="ps-lede ps-lede-dark">
            {t(
              "Three things happen here, and all three are worth seeing rather than reading: the logo is redrawn, the symbol is built, and the two are put to work on the website they were made with.",
              "Três coisas acontecem aqui, e as três valem mais vistas do que lidas: o logótipo é refeito, o símbolo é construído, e os dois são aplicados no website que foi feito com eles.",
            )}
          </p>
        </SlideIn>

        <div ref={ref} className="vi-three">
          <SlideIn ready distance={0} delay={0.12}>
            <figure className="vi-piece">
              <BeforeAfter
                name={t("The logo", "O logótipo")}
                ratio="3 / 2"
                before="/visual-identity/logotipo/antes.webp"
                after="/visual-identity/logotipo/depois.webp"
                says={{
                  before: t("Image: the old logo", "Imagem: o logótipo antigo"),
                  after: t("Image: the new logo", "Imagem: o logótipo novo"),
                }}
              />
              <figcaption className="vi-cap">
                <span className="vi-cap-name">{t("Before and after", "Antes e depois")}</span>
                <span className="mono-label vi-cap-shape">3:2</span>
              </figcaption>
            </figure>
          </SlideIn>

          <SlideIn ready distance={0} delay={0.18}>
            <figure className="vi-piece">
              <span className="vi-mark">
                <Grid drawn={drawn} />
                <span className="vi-mark-slot">
                  <Slot src="/visual-identity/simbolo/simbolo.webp" label={t("Image: the symbol", "Imagem: o símbolo")} ratio="1 / 1" dark />
                </span>
              </span>
              <figcaption className="vi-cap">
                <span className="vi-cap-name">{t("The symbol, on its grid", "O símbolo, na sua grelha")}</span>
                <span className="mono-label vi-cap-shape">1:1</span>
              </figcaption>
            </figure>
          </SlideIn>

          <SlideIn ready distance={0} delay={0.24}>
            <figure className="vi-piece">
              <Slot
                src="/visual-identity/website/mockup.webp"
                label={t("Image: the website with the new identity", "Imagem: o website com a nova identidade")}
                ratio="16 / 10"
                dark
              />
              <figcaption className="vi-cap">
                <span className="vi-cap-name">{t("Applied to the website", "Aplicada no website")}</span>
                <span className="mono-label vi-cap-shape">16:10</span>
              </figcaption>
            </figure>
          </SlideIn>
        </div>
      </div>
    </section>
  );
}

/* ---- does it make sense for every business? ---------------------- */

/** One run of the cases, in milliseconds. */
const CASE_MS = 2800;

/** The component the user picked out: a lead line, and under it the
    cases turning in place. Two of them stand side by side here - the
    ones it is for and the ones it is not - off one clock, so they
    always turn together. The right-hand one is set in grey, since what
    it lists is what we would turn down. */
function Cases({ lead, items, at, muted }: { lead: string; items: string[]; at: number; muted?: boolean }) {
  const i = at % items.length;
  return (
    <p className="vi-case" data-muted={muted || undefined}>
      <span className="vi-case-lead">{lead}</span>
      <span className="vi-case-slot">
        {items.map((c, n) => (
          <span
            key={c}
            className="vi-case-word"
            data-on={n === i || undefined}
            data-gone={n < i || (i === 0 && n === items.length - 1) || undefined}
          >
            {c}
          </span>
        ))}
        {/* The longest holds the line open, so nothing under it moves. */}
        <span aria-hidden="true" className="vi-case-ghost">
          {items.reduce((a, b) => (b.length > a.length ? b : a))}
        </span>
      </span>
    </p>
  );
}

/** A share of the way from a to b, held between 0 and 1. */
const span = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Does it make sense for every business? (user, 2026-11-19) On the
    dark ground, held by the scroll: the question in the middle of the
    screen fades; "No." comes in where it stood, uncovered by the bar of
    How we work; then "No." goes to the left and the question comes back
    over it as the section's title, the normal structure of a section.
    The two lists of cases and the grey card come up into the room left
    under them, so the pin lets go with them already close by.

    The scroll values are functions, not ranges: Motion hands a ranged
    opacity to the browser's own scroll timeline, which measured this
    held section wrongly. With less motion, the title, "No." and the
    rest simply stand in order. */
function Fits({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const run = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const no = useRef<HTMLSpanElement>(null);
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [said, setSaid] = useState(false);
  const [at, setAt] = useState(0);
  // How far "No." sits, in its place, from the middle of the screen; and
  // how much room the pinned screen leaves under the title.
  const [room, setRoom] = useState(0);
  const gap = useRef({ dx: 0, dy: 0 });

  useLayoutEffect(() => {
    if (reduce) return;
    const measure = () => {
      const p = pin.current;
      const n = no.current;
      const h = head.current;
      if (!p || !n || !h) return;
      const pb = p.getBoundingClientRect();
      const nb = n.getBoundingClientRect();
      // Its centre, measured without the move the scroll puts on it (a
      // scale about the centre leaves the centre where it is).
      const m = new DOMMatrixReadOnly(getComputedStyle(n).transform);
      gap.current = {
        dx: pb.left + pb.width / 2 - (nb.left + nb.width / 2 - m.m41),
        dy: pb.top + pb.height / 2 - (nb.top + nb.height / 2 - m.m42),
      };
      setRoom(Math.max(0, p.offsetHeight - (h.offsetTop + h.offsetHeight)));
    };
    measure();
    const watch = new ResizeObserver(measure);
    if (pin.current) watch.observe(pin.current);
    return () => watch.disconnect();
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: run, offset: ["start start", "end end"] });
  const qCentre = useTransform(scrollYProgress, (p) => 1 - span(p, 0.12, 0.26));
  const qCentreY = useTransform(scrollYProgress, (p) => -32 * span(p, 0.12, 0.26));
  const noIn = useTransform(scrollYProgress, (p) => span(p, 0.28, 0.4));
  const noMove = (p: number) => ease(span(p, 0.46, 0.68));
  const noX = useTransform(scrollYProgress, (p) => gap.current.dx * (1 - noMove(p)));
  const noY = useTransform(scrollYProgress, (p) => gap.current.dy * (1 - noMove(p)));
  const noScale = useTransform(scrollYProgress, (p) => 1.5 - 0.5 * noMove(p));
  const title = useTransform(scrollYProgress, (p) => span(p, 0.6, 0.74));
  const titleY = useTransform(scrollYProgress, (p) => 18 * (1 - span(p, 0.6, 0.74)));
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p > 0.32) setSaid(true);
  });

  const fits = [
    t("no symbol at all", "nenhum símbolo"),
    t("a logo that looks dated", "um logótipo com ar antiquado"),
    t("a mark that says nothing about the business", "uma marca que não diz nada sobre o negócio"),
    t("a logo that does not match what the company is today", "um logótipo que não corresponde ao que a empresa é hoje"),
  ];
  const doesNot = [
    t("a professional visual identity already in place", "uma identidade visual profissional já feita"),
    t("a logo consistent with its corporate identity", "um logótipo coerente com a identidade corporativa"),
    t("a mark drawn for the website it already has", "uma marca desenhada para o website que já tem"),
    t("a symbol that still says what it was made to say", "um símbolo que ainda diz o que foi feito para dizer"),
  ];

  useEffect(() => {
    if (!inView || reduce) return;
    const tick = window.setInterval(() => setAt((n) => n + 1), CASE_MS);
    return () => window.clearInterval(tick);
  }, [inView, reduce]);

  const question = t("Does it make sense for every business?", "Faz sentido para todos os negócios?");
  const answer = (
    <span className="vi-no" data-said={said || reduce || undefined} data-still={reduce || undefined}>
      <span className="vi-no-word">{t("No.", "Não.")}</span>
      <span aria-hidden="true" className="vi-no-bar" />
    </span>
  );

  const rest = (
    <>
      <div className="vi-cases">
        <Cases at={at} lead={t("It makes sense for a business with:", "Faz sentido para um negócio com:")} items={fits} />
        <Cases at={at} muted lead={t("It doesn’t make sense for a business with:", "Não faz sentido para um negócio com:")} items={doesNot} />
      </div>
      <NotSure t={t} />
    </>
  );

  return (
    <section aria-labelledby="vi-fit-title" data-tone="dark" className="vi-fit relative text-paper">
      <div data-tone-body>
        {reduce ? (
          <div className="shell vi-fit-still">
            <div className="vi-fit-head">
              <p className="mono-label text-paper/55">{t("Who it is for", "Para quem é")}</p>
              <h2 id="vi-fit-title" className="display vi-fit-title">
                {question}
              </h2>
              <p className="vi-fit-no">{answer}</p>
            </div>
            <div ref={ref}>{rest}</div>
          </div>
        ) : (
          <>
            <div ref={run} className="vi-ask-run">
              <div ref={pin} className="vi-ask-pin">
                {/* The question, alone in the middle of the screen. */}
                <motion.p aria-hidden="true" className="display vi-ask-q" style={{ opacity: qCentre, y: qCentreY }}>
                  {question}
                </motion.p>

                {/* Where the section's head ends up: the label and the
                    question as its title, and "No." under them, brought
                    here from the middle of the screen. */}
                <div ref={head} className="shell vi-fit-head">
                  <motion.div style={{ opacity: title, y: titleY }}>
                    <p className="mono-label text-paper/55">{t("Who it is for", "Para quem é")}</p>
                    <h2 id="vi-fit-title" className="display vi-fit-title">
                      {question}
                    </h2>
                  </motion.div>
                  <p className="vi-fit-no">
                    <motion.span
                      ref={no}
                      className="vi-fit-no-move"
                      style={{ opacity: noIn, x: noX, y: noY, scale: noScale }}
                    >
                      {answer}
                    </motion.span>
                  </p>
                </div>
              </div>
            </div>
            {/* Pulled up into the room the pinned screen leaves under the
                title, so it arrives as the pin lets go. */}
            <div ref={ref} className="shell vi-fit-rest" style={{ marginTop: `${-Math.max(0, room - 48)}px` }}>
              {rest}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ---- not sure? --------------------------------------------------- */

/** How long each step of the change holds, in milliseconds. */
const MORPH_MS = 1250;

/** The mark the business had, taken apart over the guides a mark is
    built on, and the mark it ends up with put together on them. Four
    steps: it stands on the white of its old website, it comes apart, the
    guides draw and the new one is built on Pilar's Noite, it stands.

    References through Inspo: Geex (forms sculpted and resolved on an
    empty ground) and Portal One (the construction geometry left in
    view). The composition only - the colour and the type are ours. */
function Morph({ t, bare = false }: { t: T; bare?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const tick = window.setInterval(() => setN((v) => v + 1), MORPH_MS);
    return () => window.clearInterval(tick);
  }, [inView, reduce]);

  const step = reduce ? 3 : n % 4;
  const brand = BRANDS[Math.floor(n / 4) % BRANDS.length]!;

  return (
    <div
      ref={ref}
      className="vi-morph"
      data-step={step}
      role="img"
      aria-label={t(
        "Pilar's old mark taken apart and its new mark built on the guides.",
        "A marca antiga da Pilar desfeita e a nova construída sobre as guias.",
      )}
    >
      <span className="vi-morph-stage" aria-hidden="true">
        <span className="vi-morph-grid">
          <Grid drawn={step === 1 || step === 2} />
        </span>
        <span className="vi-morph-face vi-morph-old">
          <Mark brand={brand} side="before" />
        </span>
        <span className="vi-morph-face vi-morph-new">
          <Mark brand={brand} side="after" />
        </span>
      </span>
      {/* Bare in the header, where the name and the trade stand outside the card. */}
      {!bare && (
        <p className="vi-morph-say">
          <span className="vi-morph-name">{brand.name}</span>
          <span className="mono-label vi-morph-trade">{brand.trade(t)}</span>
        </p>
      )}
    </div>
  );
}

/** The grey card, inside the section above it (user, 2026-11-19): the
    doubt, the answer to it, and the mark taken apart and built again on
    its own brand's ground. */
function NotSure({ t }: { t: T }) {
  return (
    <div className="vi-sure">
      <div className="vi-sure-words">
        <h3 className="display vi-sure-title">
          {t("Not sure whether you need a new visual identity or not?", "Com dúvidas sobre se é precisa uma nova identidade visual?")}
        </h3>
        <p className="vi-sure-say">
          {t(
            "Don’t worry. We’ll help you make the best decision on our first call. Fill in our form so we can help you.",
            "Não há problema. Ajudamos a tomar a melhor decisão logo na primeira reunião. Basta preencher o formulário para podermos ajudar.",
          )}
        </p>
      </div>
      <Morph t={t} />
    </div>
  );
}

/* ---- how the price works ----------------------------------------- */

function Prices({ t }: { t: T }) {
  const rows = [
    {
      n: "01",
      head: t("What the service is", "O que inclui o serviço"),
      body: t(
        "The logo and the symbol, drawn at the same time as the look of the website, so the two are thought out together rather than one after the other.",
        "O logótipo e o símbolo, desenhados ao mesmo tempo que a estética do website, para os dois serem pensados em conjunto e não um depois do outro.",
      ),
    },
    {
      n: "02",
      head: t("What it costs", "Quanto custa"),
      body: t(
        `${TO_FILL}. Whether it is charged on its own or inside a package with the website: ${TO_FILL}.`,
        `${TO_FILL}. Se é cobrado à parte ou incluído num pacote com o website: ${TO_FILL}.`,
      ),
    },
    {
      n: "03",
      head: t("Proposals and revisions", "Propostas e revisões"),
      body: t(
        `${TO_FILL} proposals and ${TO_FILL} rounds of revisions are included.`,
        `Estão incluídas ${TO_FILL} propostas e ${TO_FILL} rondas de revisões.`,
      ),
    },
    {
      n: "04",
      head: t("The first meeting, free", "A reunião inicial, gratuita"),
      body: t(
        "Before any of that, we sit down and work out whether a new identity makes sense at all. It costs nothing and it commits to nothing.",
        "Antes disso, reunimos para perceber se uma nova identidade faz sequer sentido. Não custa nada e não compromete a nada.",
      ),
    },
  ];

  return (
    <section aria-labelledby="vi-price-title" data-tone="dark" className="relative text-paper">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("How the price works", "Como funcionam os preços")}</p>
          <h2 id="vi-price-title" className="display ps-title">
            <span className="font-light sm:block">{t("The mark and the website", "A marca e o website")}</span>{" "}
            <span className="font-medium sm:block">{t("are priced as one piece of work.", "são orçamentados como um só trabalho.")}</span>
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <dl className="vi-price">
            {rows.map((row) => (
              <div key={row.n} className="vi-price-row">
                <dt>
                  <span className="mono-label vi-price-n" aria-hidden="true">
                    {row.n}
                  </span>
                  <span className="vi-price-head">{row.head}</span>
                </dt>
                <dd className="vi-price-body">{row.body}</dd>
              </div>
            ))}
          </dl>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.16}>
          <div className="vi-price-foot">
            <p className="mono-label">
              {t(
                "The figures are the studio's to set; the form works an estimate out meanwhile.",
                "Os valores são definidos pelo estúdio; entretanto, o formulário calcula uma estimativa.",
              )}
            </p>
            <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* ================================================================== */

export function VisualIdentity() {
  const t = useT();
  return (
    <ToneRoom>
      <Head t={t} />
      <Opening t={t} />
      <Fits t={t} />
      <Prices t={t} />
    </ToneRoom>
  );
}
