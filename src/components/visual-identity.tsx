"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { SlideIn } from "./enter";
import { BeforeAfter } from "./project-report";
import { ToneRoom } from "./tone-veil";
import { ProposalAsk } from "./about-faq";
import { useInView, type T } from "./sbs-shared";
import { STILL_KEY } from "./footer";
import { BRANDS, Mark, PilarNewLogo, PilarOldLogo, type Brand } from "./vi-brands";
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

/* ---- what the visitor asked for ---------------------------------- */

/** The footer offers to hold the moving things still and remembers it
    (STILL_KEY). Everything on this page that runs on a clock reads it,
    the same way the bar and the portfolio do; prefers-reduced-motion
    is read beside it. */
function useStill() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    try {
      setStill(!!localStorage.getItem(STILL_KEY));
    } catch {}
  }, []);
  return still;
}

/* ---- the symbol on the guides it was built on -------------------- */

/** A dark plate, a grid of modules almost out of sight on it, the
    mark's own edges and the lines its angles run along dashed over
    that, and the mark itself in white with its mark of registration
    beside it. Under the plate, the wordmark and the name as it would
    be registered.

    It builds itself once, when it is reached, in the order the mark is
    drawn in: the modules come up, the straight guides are wiped in
    from the left, the diagonals from the top, the mark's pieces fill
    one after another, and the registration and the wordmark arrive
    last. Nothing moves but transforms and opacities; the guides keep
    their dashes because what wipes them in is a clip, not the dash
    itself.

    Asked to hold still - by the footer, or by the system - it is
    simply there, built, with nothing running. */
function MarkPlate({ brand, t, still }: { brand: Brand & { guides: NonNullable<Brand["guides"]> }; t: T; still: boolean }) {
  const [ref, inView] = useInView<HTMLElement>(0.35);
  const [built, setBuilt] = useState(false);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    if (inView) setBuilt(true);
  }, [inView]);

  const After = brand.after;
  const mods = Array.from({ length: 9 }, (_, i) => (i + 1) * 10);

  return (
    <figure ref={ref} className="vi-plate" data-built={built || still || undefined} data-still={still || undefined}>
      <span className="vi-plate-stage">
        <svg className="vi-plate-svg" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <clipPath id={`${id}-s`}>
              <rect className="vi-plate-wipe vi-plate-wipe-x" x="-10" y="-10" width="120" height="120" />
            </clipPath>
            <clipPath id={`${id}-d`}>
              <rect className="vi-plate-wipe vi-plate-wipe-y" x="-10" y="-10" width="120" height="120" />
            </clipPath>
          </defs>

          {/* the modules the mark is set out on */}
          <g className="vi-plate-mods">
            {mods.map((at) => (
              <line key={`v${at}`} x1={at} y1="0" x2={at} y2="100" />
            ))}
            {mods.map((at) => (
              <line key={`h${at}`} x1="0" y1={at} x2="100" y2={at} />
            ))}
          </g>

          {/* where the mark's own edges fall */}
          <g className="vi-plate-guides" clipPath={`url(#${id}-s)`}>
            {brand.guides.x.map((x) => (
              <line key={`gx${x}`} x1={x} y1="-10" x2={x} y2="110" />
            ))}
            {brand.guides.y.map((y) => (
              <line key={`gy${y}`} x1="-10" y1={y} x2="110" y2={y} />
            ))}
          </g>

          {/* and the lines its angles run along, carried past it */}
          <g className="vi-plate-guides" clipPath={`url(#${id}-d)`}>
            {brand.guides.diag.map((d) => (
              <line key={d.join()} x1={d[0]} y1={d[1]} x2={d[2]} y2={d[3]} />
            ))}
          </g>

          <g className="vi-plate-mark">
            <After />
          </g>
        </svg>
        <span className="vi-plate-reg" aria-hidden="true">
          &#174;
        </span>
      </span>
      <figcaption className="vi-plate-say">
        <span className="vi-plate-word">{brand.name}</span>
        <span className="mono-label vi-plate-legal">{brand.legal(t)}</span>
      </figcaption>
    </figure>
  );
}

/** The symbols on the guides they were set out on. The section "The
    proposal" used to hold them, and it is no longer on the page
    (2026-11-19), so they stand on their own, between the header and
    who the service is for.

    Only the marks that were actually set out this way appear here.
    The title promises that every edge sits on a guide, and Briciola's
    is drawn with a brush, by eye; it was taken out rather than have
    the plate claim something the drawing cannot keep (user,
    2026-11-20). A brand with no `guides` is passed over, so this
    sorts itself out as marks are added. */
function Plates({ t }: { t: T }) {
  const still = useStill();
  return (
    <section aria-labelledby="vi-plates-title" data-tone="dark" className="relative text-paper">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("How a mark is built", "Como se constr\u00f3i uma marca")}</p>
          <h2 id="vi-plates-title" className="display ps-title">
            <span className="font-light sm:block">{t("Nothing is drawn by eye:", "Nada \u00e9 desenhado a olho:")}</span>{" "}
            <span className="font-medium sm:block">{t("every edge sits on a guide.", "cada aresta assenta numa guia.")}</span>
          </h2>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.1}>
          <div className="vi-plates-row">
            {BRANDS.filter((b) => b.guides).map((brand) => (
              <MarkPlate
                key={brand.id}
                brand={brand as Brand & { guides: NonNullable<Brand["guides"]> }}
                t={t}
                still={still}
              />
            ))}
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- the header -------------------------------------------------- */

/** Three of the grey card that closes "Does it make sense?" (user,
    2026-11-19): the first carries Pilar's loop, the second Terral's,
    and the third stands empty for the case after it. One over the
    other on a phone. */
/** A business that has no before: the card is the end of the walk,
    held, with the guides already drawn behind it.

    Out of use since 2026-11-20, when the user asked for Briciola's
    card to run the same animation as the other two; kept because a
    card that should hold still rather than loop will want it. */
function Finished({ t, brand }: { t: T; brand: Brand }) {
  return (
    <div className="vi-morph" data-step="3" data-whole="" data-held="">
      <span className="vi-morph-stage" aria-hidden="true">
        <span className="vi-morph-grid">
          <Grid drawn />
        </span>
        <span className="vi-morph-face vi-morph-new">{brand.newLogo?.(t)}</span>
      </span>
    </div>
  );
}

function Cases3({ t }: { t: T }) {
  const pilar = BRANDS[0]!;
  // The mark exactly as the grey card of "Not sure?" shows it, in a much
  // thinner rim of grey; the trade over it and the name under it, both
  // outside the card (user, 2026-11-19).
  /* The second card is limen's (user, 2026-11-20; it was Terral's from
     2026-11-19, and Terral is kept in SPARE_BRANDS); the third waits
     for the case after it. Each card is pinned to its own business -
     left to itself the loop walks them all, which would have the two
     cards swapping businesses. Both are shown whole: the mark and the
     name together, side by side. */
  const limen = BRANDS[1]!;
  /* The third is Briciola (user, 2026-11-20). It has no before, and
     for a day the card simply stood at the end of the walk; the user
     asked for the same animation as the other two, so it takes the
     walk the part of it that is true - an empty ground, the guides,
     and the mark built on them. */
  const briciola = BRANDS[2]!;
  const items = [
    { key: "pilar", trade: pilar.trade(t), name: pilar.name, body: <Morph t={t} bare whole only={pilar} /> },
    { key: "limen", trade: limen.trade(t), name: limen.name, body: <Morph t={t} bare whole only={limen} /> },
    { key: "briciola", trade: briciola.trade(t), name: briciola.name, body: <Morph t={t} bare whole only={briciola} /> },
  ];
  return (
    <div className="vi-trio">
      {items.map((it) => (
        <figure key={it.key} className="vi-trio-item" data-empty={it.key.startsWith("next") || undefined}>
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
        {/* The film, up here under the three cards (user, 2026-11-19);
            the words it used to follow come after it, in Opening. */}
        <SlideIn ready distance={0} delay={0.16}>
          <div className="vi-head-film">
            <Glance t={t} />
          </div>
        </SlideIn>
        {/* Why it is worth it, cut to one line of title and one of text
            and set under the film (user, 2026-11-19: a fifth of what the
            section took). The full text and its three options are kept,
            out of use, in Opening and WorthOptions below. */}
        <SlideIn ready distance={0} delay={0.2}>
          <div className="vi-worth">
            <div>
              <p className="mono-label text-paper/55">{t("Why it is worth it", "Porque vale a pena")}</p>
              <h2 className="display vi-worth-title">
                {t("A client's first impression rests on a mark.", "A primeira impressão de um cliente assenta numa marca.")}
              </h2>
            </div>
            <p className="vi-worth-say">
              {t(
                "When the logo and the symbol are out of date, even the best-built website contradicts them. So we draw them with the website, ",
                "Quando o logótipo e o símbolo estão desatualizados, até o website mais bem feito entra em contradição com eles. Por isso são desenhados com o website, ",
              )}
              <b>{t("so everything speaks the same language.", "para que tudo fale a mesma linguagem.")}</b>
            </p>
          </div>
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

/** The section as it stood until 2026-11-19, with the three options;
    out of use (the header carries the short version). */
export function Opening({ t }: { t: T }) {
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

        {/* The two paragraphs, every word kept, in three ways to read
            them lighter (user, 2026-11-19: pick one). Each after a site
            found through Inspo, the composition only. */}
        <WorthOptions t={t} />
      </div>
    </section>
  );
}

/** The words of the two paragraphs, cut where each fact ends, so the
    three options below share them exactly. */
function worth(t: T) {
  return {
    core: t("It rests on the core of an organisational identity: ", "Assenta no núcleo de uma identidade organizacional: "),
    mark: t("the logo, and the symbol beside it.", "o logótipo e o símbolo ao lado dele."),
    when: t(
      "When that core is out of date — or never matched what the company became — the best-built website in the world ",
      "Quando esse núcleo está desatualizado — ou nunca correspondeu ao que a empresa veio a ser —, o website mais bem feito do mundo ",
    ),
    against: t("contradicts it.", "entra em contradição com ele."),
    why: t(
      "That is why this service is sold inside the web design: a compact visual identity, drawn at the same time as the look and the feel of the website, so that ",
      "É por isso que este serviço se vende dentro do web design: uma identidade visual mais compacta, desenhada ao mesmo tempo que a estética e a aparência do website, para que ",
    ),
    same: t("everything speaks the same language.", "tudo fale a mesma linguagem."),
  };
}

/** One option, framed and labelled, so the three can be told apart and
    one chosen. Taken off once the choice is made. */
function Option({ id, name, from, children }: { id: string; name: string; from: string; children: ReactNode }) {
  return (
    <section className="vi-opt" aria-label={name}>
      <p className="vi-opt-tag mono-label">
        <b>{id}</b> {name} <span>· {from}</span>
      </p>
      {children}
    </section>
  );
}

function WorthOptions({ t }: { t: T }) {
  const w = worth(t);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <div className="vi-opts">
      {/* A - two columns under a hairline, each with a small label,
          after Frontier Climate's "Buyers / Suppliers". */}
      <Option id="A" name={t("Two columns", "Duas colunas")} from="Frontier Climate">
        <div className="vi-wa">
          <div className="vi-wa-col">
            <p className="mono-label vi-wa-label">{t("The problem", "O problema")}</p>
            <p className="vi-wa-body">
              {w.core}
              <b>{w.mark}</b> {w.when}
              <Lit>{w.against}</Lit>
            </p>
          </div>
          <div className="vi-wa-col">
            <p className="mono-label vi-wa-label">{t("Our answer", "A nossa resposta")}</p>
            <p className="vi-wa-body">
              {w.why}
              <Lit>{w.same}</Lit>
            </p>
          </div>
        </div>
      </Option>

      {/* B - one line large, the rest small and narrow, set off to the
          right under it, after NB Studio's and Linked by Air's openings. */}
      <Option id="B" name={t("One line, then the detail", "Uma frase, depois o detalhe")} from="NB Studio · Linked by Air">
        <div className="vi-wb">
          <p className="display vi-wb-big">
            {cap(w.same)}
          </p>
          <div className="vi-wb-small">
            <p>
              {w.core}
              <b>{w.mark}</b> {w.when}
              <b>{w.against}</b>
            </p>
            <p>
              {w.why}
              <b>{w.same}</b>
            </p>
          </div>
        </div>
      </Option>

      {/* C - three numbered points, each headed by one of the three ideas
          the text turns on, after Dia & Co's "How it works". */}
      <Option id="C" name={t("Three points", "Três pontos")} from="Dia & Co">
        <ol className="vi-wc">
          <li>
            <span className="mono-label vi-wc-n">01</span>
            <h3 className="vi-wc-head">{cap(w.mark)}</h3>
            <p className="vi-wc-body">{w.core}{w.mark}</p>
          </li>
          <li>
            <span className="mono-label vi-wc-n">02</span>
            <h3 className="vi-wc-head">{t("The website contradicts it.", "O website entra em contradição com ele.")}</h3>
            <p className="vi-wc-body">{w.when}{w.against}</p>
          </li>
          <li>
            <span className="mono-label vi-wc-n">03</span>
            <h3 className="vi-wc-head">{cap(w.same)}</h3>
            <p className="vi-wc-body">{w.why}{w.same}</p>
          </li>
        </ol>
      </Option>
    </div>
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
    The figure is drawn in an 800 by 500 field running from y = -25: the
    phone in the hand at (453, 223.25), the face at (330, 140). Close on
    the phone, it fills 89% of the stage's height (77.5 units, 5.74 times
    over) - a quarter larger than before (user, 2026-11-19), which is why
    the stage went from 16:9 to 16:10. */
const CAMERA: Record<Shot, { x: number; y: number; s: number }> = {
  wide: { x: 50, y: 50, s: 1 },
  raise: { x: 50, y: 50, s: 1 },
  screen: { x: 56.625, y: 49.65, s: 5.74 },
  face: { x: 44, y: 33.8, s: 2.3 },
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

/** What the phone shows, close up: only the logo (user, 2026-11-19),
    the one it had on its white or the one it has on Pilar's Noite. */
function Site({ t, side, on }: { t: T; side: "old" | "new"; on: boolean }) {
  return (
    <span className="vi-site" data-side={side} data-on={on || undefined}>
      <span className="vi-site-logo">{side === "old" ? <PilarOldLogo t={t} /> : <PilarNewLogo t={t} />}</span>
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
          <svg viewBox="0 -25 800 500" className="vi-mg-art">
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
              {/* Large, with a thin bezel (user, 2026-11-19): 42.5 by
                  77.5 units, the glass 1.6 units in from every edge. The
                  edge is a shape a quarter unit proud of the body, not a
                  stroke: a stroke would thicken as the camera, moved by
                  CSS, closes in. */}
              <rect x="431.5" y="184.25" width="43" height="78" rx="7.7" className="vi-mg-edge" />
              <rect x="431.75" y="184.5" width="42.5" height="77.5" rx="7.5" className="vi-mg-phone" />
              <rect x="433.35" y="186.1" width="39.3" height="74.3" rx="6" className="vi-mg-glass" data-side={side} />
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
  const reduce = (useReducedMotion() ?? false) || useStill();
  const run = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const no = useRef<HTMLSpanElement>(null);
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
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
  // "No." is uncovered by the scroll itself, not by a timed transition
  // set off when a threshold is crossed (user, 2026-11-19: on a long,
  // fast scroll the transition could be left unplayed and "No." never
  // showed). Wherever the scroll stands, the word stands as far revealed
  // as that point says, and whole from 0.42 on.
  const reveal = useTransform(scrollYProgress, (p) => ease(span(p, 0.28, 0.42)));
  const noClip = useTransform(reveal, (r) => `inset(0 ${(1 - r) * 100}% 0 0)`);
  const barLeft = useTransform(reveal, (r) => `${r * 100}%`);
  const barShow = useTransform(reveal, (r) => (r > 0.001 && r < 0.999 ? 1 : 0));

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
  const answer = reduce ? (
    <span className="vi-no" data-said data-still>
      <span className="vi-no-word">{t("No.", "Não.")}</span>
      <span aria-hidden="true" className="vi-no-bar" />
    </span>
  ) : (
    <span className="vi-no" data-scroll>
      <motion.span className="vi-no-word" style={{ clipPath: noClip }}>
        {t("No.", "Não.")}
      </motion.span>
      <motion.span aria-hidden="true" className="vi-no-bar" style={{ left: barLeft, opacity: barShow }} />
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
    <section aria-labelledby="vi-fit-title" data-tone="light" className="vi-fit relative">
      <div data-tone-body>
        {reduce ? (
          <div className="shell vi-fit-still">
            <div className="vi-fit-head">
              <p className="mono-label text-ash-2">{t("Who it is for", "Para quem é")}</p>
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
                    <p className="mono-label text-ash-2">{t("Who it is for", "Para quem é")}</p>
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

/** What each beat of the clock shows for a business that has no
    before: the guides, the mark built on them, and standing - the
    last beat held twice, because there is no old mark to go back to. */
const NO_BEFORE = [1, 2, 3, 3] as const;

/** The mark the business had, taken apart over the guides a mark is
    built on, and the mark it ends up with put together on them. Four
    steps: it stands on the white of its old website, it comes apart, the
    guides draw and the new one is built on Pilar's Noite, it stands.

    References through Inspo: Geex (forms sculpted and resolved on an
    empty ground) and Portal One (the construction geometry left in
    view). The composition only - the colour and the type are ours. */
function Morph({ t, bare = false, whole = false, only }: { t: T; bare?: boolean; whole?: boolean; only?: Brand }) {
  const reduce = (useReducedMotion() ?? false) || useStill();
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const tick = window.setInterval(() => setN((v) => v + 1), MORPH_MS);
    return () => window.clearInterval(tick);
  }, [inView, reduce]);

  const beat = reduce ? 3 : n % 4;
  /* A card that is given a business keeps it; left to itself, the
     loop walks all of them. */
  const brand = only ?? BRANDS[Math.floor(n / 4) % BRANDS.length]!;
  const hadOne = Boolean(brand.before ?? (whole && brand.oldLogo));
  /* A business with no before has nothing to stand there and nothing
     to take apart, so it would spend half the loop on an empty card.
     It walks the three beats it does have instead - the guides, the
     building, and standing - and holds on the last one (user,
     2026-11-20). The clock is the same; only what each beat shows
     changes. */
  const step = hadOne ? beat : NO_BEFORE[beat]!;

  return (
    <div
      ref={ref}
      className="vi-morph"
      data-step={step}
      data-brand={brand.id}
      data-whole={whole || undefined}
      role="img"
      aria-label={
        hadOne
          ? t(
              `${brand.name}'s old mark taken apart and its new mark built on the guides.`,
              `A marca antiga da ${brand.name} desfeita e a nova construída sobre as guias.`,
            )
          : t(
              `${brand.name}'s mark built on the guides, shape by shape.`,
              `A marca da ${brand.name} construída sobre as guias, forma a forma.`,
            )
      }
    >
      <span className="vi-morph-stage" aria-hidden="true">
        <span className="vi-morph-grid">
          <Grid drawn={step === 1 || step === 2} />
        </span>
        {/* Whole in the header (user, 2026-11-19): the logo and the
            symbol together, the words leaving and arriving with the
            shapes. A business without a pair of signatures falls back
            to its two symbols. */}
        {/* A business with no before has no old face at all: the
            ground is empty, the guides draw, and the mark is built on
            them. Without this it would morph into itself, because
            Mark falls back to the after side (user, 2026-11-20:
            Briciola runs the same animation as the other two). */}
        {hadOne && (
          <span className="vi-morph-face vi-morph-old">
            {whole && brand.oldLogo ? brand.oldLogo(t) : <Mark brand={brand} side="before" />}
          </span>
        )}
        <span className="vi-morph-face vi-morph-new">
          {whole && brand.newLogo ? brand.newLogo(t) : <Mark brand={brand} side="after" />}
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
    <section aria-labelledby="vi-price-title" data-tone="light" className="relative vi-price-light">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("How the price works", "Como funcionam os preços")}</p>
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
      <Plates t={t} />
      <Fits t={t} />
      <Prices t={t} />
    </ToneRoom>
  );
}
