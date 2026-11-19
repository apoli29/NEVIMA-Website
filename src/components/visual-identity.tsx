"use client";

import { useEffect, useRef, useState } from "react";
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

   Reshaped by the user on 2026-11-19:

   1. The header: the title and Pilar's two identities, each card on its
      own brand's ground - the template website's logo on its white, and
      ours on Pilar's Noite.
   2. Why it is worth it, and under the words a card in the call's metal:
      the client looks the business up on a phone, frowns at the old
      identity and is won over by the new one.
   3. Whether it makes sense at all, on the dark ground: the question
      held in the middle of the screen until the scroll turns it into
      "No.", then the two lists of cases and the grey card for whoever
      is not sure.
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

/** Two cards, side by side, each on its own brand's ground: the logo
    the template website carries, on that website's white, and the one
    ours carries, on Pilar's Noite (user, 2026-11-19). One over the
    other on a phone. */
function Pair({ t }: { t: T }) {
  const sides = [
    { key: "before" as const, head: t("The mark they had", "A marca que tinham"), logo: <PilarOldLogo t={t} /> },
    { key: "after" as const, head: t("The mark they have", "A marca que passam a ter"), logo: <PilarNewLogo t={t} /> },
  ];
  return (
    <div className="vi-pair">
      {sides.map((side) => (
        <figure key={side.key} className="vi-pair-card" data-side={side.key}>
          <figcaption className="mono-label vi-pair-head">{side.head}</figcaption>
          <div className="vi-pair-stage">{side.logo}</div>
        </figure>
      ))}
    </div>
  );
}

/** The title and the two cards, and nothing else (user, 2026-11-19). */
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
          <Pair t={t} />
        </SlideIn>
      </header>
    </section>
  );
}

/* ---- the opening ------------------------------------------------- */

function Opening({ t }: { t: T }) {
  return (
    <section data-tone="light" className="relative">
      <div className="shell ps-open" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("Why it is worth it", "Porque vale a pena")}</p>
          <h2 className="display ps-open-title">
            <span className="font-light sm:block">{t("A client's first impression", "A primeira impressão de um cliente")}</span>{" "}
            <span className="font-medium sm:block">{t("rests on a mark.", "assenta numa marca.")}</span>
          </h2>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.08} className="ps-open-say">
          <p>
            {t(
              "It rests on the core of an organisational identity: the logo, and the symbol beside it. When that core is out of date — or never matched what the company became — the best-built website in the world contradicts it.",
              "Assenta no núcleo de uma identidade organizacional: o logótipo e o símbolo ao lado dele. Quando esse núcleo está desatualizado — ou nunca correspondeu ao que a empresa veio a ser —, o website mais bem feito do mundo entra em contradição com ele.",
            )}
          </p>
          <p>
            {t(
              "That is why this service is sold inside the web design: a compact visual identity, drawn at the same time as the look and the feel of the website, so that everything speaks the same language.",
              "É por isso que este serviço se vende dentro do web design: uma identidade visual mais compacta, desenhada ao mesmo tempo que a estética e a aparência do website, para que tudo fale a mesma linguagem.",
            )}
          </p>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.12}>
          <Glance t={t} />
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- the client, looking it up ----------------------------------- */

/** How long each beat of the look holds, in milliseconds: the phone
    shows the old identity, the client frowns and says so, the phone
    turns to the new one, the client smiles and says so. */
const GLANCE_MS = [1900, 3600, 1900, 4200];

/** The words typed in as they are said, as the call types them. */
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
    }, 38);
    return () => window.clearInterval(id);
  }, [text, on, still]);
  return text.slice(0, n);
}

/** One of the two screens the phone shows: Pilar's website header with
    the identity it had, or with the one it has. */
function Screen({ t, side, on }: { t: T; side: "old" | "new"; on: boolean }) {
  return (
    <span className="vi-phone-screen" data-side={side} data-on={on || undefined}>
      <span className="vi-phone-bar">
        <span className="vi-phone-logo">{side === "old" ? <PilarOldLogo t={t} /> : <PilarNewLogo t={t} />}</span>
        <span className="vi-phone-burger">
          <i />
          <i />
          {side === "old" && <i />}
        </span>
      </span>
      <span className="vi-phone-pic" />
      <span className="vi-phone-lines">
        <i />
        <i />
        <i />
      </span>
      <span className="vi-phone-cards">
        <i />
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

/** The side-by-side page's call card, its client alone with a phone
    (user, 2026-11-19): the same metal, the same tile, the same line with
    its point of light running from the phone to the one looking at it,
    the same panel the words are typed in. What is its own is the face,
    which has a mouth here, and the phone, which shows Pilar's website
    with the identity it had and then with the one it has. */
function Glance({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = reduce || !mounted;
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [beat, setBeat] = useState(-1);

  useEffect(() => {
    if (still || !inView) return;
    const id = window.setTimeout(() => setBeat((b) => (b + 1) % 4), beat < 0 ? 700 : GLANCE_MS[beat]!);
    return () => window.clearTimeout(id);
  }, [beat, inView, still]);

  // Before it starts, the phone already shows the old identity.
  const at = still ? 3 : beat;
  const screen = at >= 2 ? "new" : "old";
  const mood = at === 1 ? "bad" : at === 3 ? "good" : "none";
  const words =
    at === 1 ? t("Are they even still around?", "Será que ainda existem?") : at === 3 ? t("These I’d trust.", "Nestes confiava.") : "";
  const typed = useTyped(words, mood !== "none", still);
  const looking = !still && (at === 0 || at === 2);

  return (
    <div
      ref={ref}
      className="vi-glance sbx-metal"
      role="img"
      aria-label={t(
        "A client looks Pilar up on a phone: the old identity puts them off, the new one wins them over.",
        "Um cliente procura a Pilar no telemóvel: a identidade antiga afasta-o, a nova convence-o.",
      )}
    >
      <div className="sbc vi-glance-call" aria-hidden="true">
        <div className="sbc-row">
          <div className="sbc-side">
            <span className="sbc-seat">
              <span className="sbc-panel" data-who="antonio" data-on={mood !== "none" || undefined}>
                <span className="sbc-panel-text">
                  {typed}
                  {!still && typed.length < words.length && <span className="sbc-caret" />}
                </span>
              </span>
              <span className="sbc-tile" data-speaking={mood !== "none" || undefined}>
                <span className="sbc-ring" />
                <span className="sbc-face vi-face" data-mood={mood}>
                  {/* The call's figure, its head drawn larger so it can
                      carry a face: two eyes, and a mouth that turns down
                      (brows knitted) at the old mark and up at the new. */}
                  <svg viewBox="0 0 40 40" className="vi-face-feel">
                    <circle cx="20" cy="14" r="9" className="vi-face-head" />
                    <path d="M6 39c1.5-7 6.5-11 14-11s12.5 4 14 11" className="vi-face-body" />
                    <circle cx="16.8" cy="12.6" r="1.1" className="vi-face-eye" />
                    <circle cx="23.2" cy="12.6" r="1.1" className="vi-face-eye" />
                    <path d="M14.8 9.6l3.2 1.1M25.2 9.6l-3.2 1.1" className="vi-face-brow" />
                    <path d="M16.6 18.9q3.4-2.6 6.8 0" className="vi-face-mouth" data-for="bad" />
                    <path d="M16.6 16.6q3.4 2.8 6.8 0" className="vi-face-mouth" data-for="good" />
                    <path d="M17.2 17.6h5.6" className="vi-face-mouth" data-for="none" />
                  </svg>
                </span>
                <span className="sbc-name mono-label">{t("Client", "Cliente")}</span>
              </span>
            </span>
          </div>

          <div className="sbc-line" data-dir={looking ? "rtl" : "none"} key={`look-${at}`}>
            <span className="sbc-line-fill" />
            <span className="sbc-line-head" />
          </div>

          <div className="sbc-side">
            <span className="vi-phone-seat">
              <span className="vi-phone">
                <span className="vi-phone-notch" />
                <Screen t={t} side="old" on={screen === "old"} />
                <Screen t={t} side="new" on={screen === "new"} />
              </span>
              <span className="sbc-name mono-label vi-phone-name">
                {screen === "old"
                  ? t("The identity they had", "A identidade que tinham")
                  : t("The identity they have", "A identidade que passam a ter")}
              </span>
            </span>
          </div>
        </div>
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

/** Does it make sense for every business? (user, 2026-11-19) On the
    dark ground, the question held in the middle of the screen; the
    scroll fades it and brings "No." in where it stood, uncovered by the
    bar of How we work, then lets the section go on to the two lists of
    cases and the grey card for whoever is not sure. With less motion,
    the question and the answer simply stand one over the other. */
function Fits({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const run = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [said, setSaid] = useState(false);
  const [at, setAt] = useState(0);

  const { scrollYProgress } = useScroll({ target: run, offset: ["start start", "end end"] });
  // Written as functions, not ranges: Motion hands a ranged opacity to
  // the browser's own scroll timeline, which measured this held section
  // wrongly (the words moved and stayed lit).
  const span = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  const askOpacity = useTransform(scrollYProgress, (p) => 1 - span(p, 0.16, 0.4));
  const askY = useTransform(scrollYProgress, (p) => -36 * span(p, 0.16, 0.4));
  const noOpacity = useTransform(scrollYProgress, (p) => span(p, 0.42, 0.6));
  const noY = useTransform(scrollYProgress, (p) => 28 * (1 - span(p, 0.42, 0.6)));
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p > 0.46) setSaid(true);
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

  const ask = (
    <h2 id="vi-fit-title" className="display vi-ask-q">
      {t("Does it make sense for every business?", "Faz sentido para todos os negócios?")}
    </h2>
  );
  const answer = (
    <div className="vi-answer">
      <p className="vi-no" data-said={said || reduce || undefined} data-still={reduce || undefined}>
        <span className="vi-no-word">{t("No.", "Não.")}</span>
        <span aria-hidden="true" className="vi-no-bar" />
      </p>
      <p className="vi-no-say">
        {t(
          "A business that already presents a professional visual identity, coherent with the corporate identity of the company itself, does not need this service.",
          "Um negócio que já apresente uma identidade visual profissional e coesa com a identidade corporativa da própria empresa não precisa deste serviço.",
        )}
      </p>
    </div>
  );

  return (
    <section aria-labelledby="vi-fit-title" data-tone="dark" className="vi-fit relative text-paper">
      <div data-tone-body>
        {reduce ? (
          <div className="shell vi-ask-still">
            {ask}
            {answer}
          </div>
        ) : (
          <div ref={run} className="vi-ask-run">
            <div className="shell vi-ask-pin">
              <motion.div className="vi-ask-face" style={{ opacity: askOpacity, y: askY }}>
                {ask}
              </motion.div>
              <motion.div className="vi-ask-face" style={{ opacity: noOpacity, y: noY }}>
                {answer}
              </motion.div>
            </div>
          </div>
        )}

        <div ref={ref} className="shell vi-fit-rest">
          <SlideIn ready distance={0}>
            <div className="vi-cases">
              <Cases at={at} lead={t("It makes sense for a business with:", "Faz sentido para um negócio com:")} items={fits} />
              <Cases at={at} muted lead={t("It doesn’t make sense for a business with:", "Não faz sentido para um negócio com:")} items={doesNot} />
            </div>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.08}>
            <NotSure t={t} />
          </SlideIn>
        </div>
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
function Morph({ t }: { t: T }) {
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
      <p className="vi-morph-say">
        <span className="vi-morph-name">{brand.name}</span>
        <span className="mono-label vi-morph-trade">{brand.trade(t)}</span>
      </p>
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
