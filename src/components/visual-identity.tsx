"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { BeforeAfter } from "./project-report";
import { ToneRoom } from "./tone-veil";
import { ProposalAsk } from "./about-faq";
import { useInView, type T } from "./sbs-shared";
import { BRANDS, Mark } from "./vi-brands";
import { TO_FILL } from "@/lib/work";
import { useT } from "@/lib/use-lang";

/* ==================================================================
   Visual Identity

   The service's own page (user, 2026-11-17), set as the photo shoot's
   and SEO & GEO's are, so the three read as one system: the same
   header, one ToneRoom whose sections turn from light to dark under
   the tonal veil, the same SlideIn on every heading, the same
   free-proposal drop.

   Two sections, from the studio's brief:

   1. The proposal. Said in three things seen rather than described:
      the old mark against the new one on the slider the project
      reports already carry; the symbol drawn on its construction grid,
      which draws itself as the section is reached; and the two of them
      applied on the website they were made with.
   2. Whether it makes sense at all, which is answered "no" for a
      business that already has an identity worth the name, with the
      cases cycling in place rather than listed.

   PLACES FOR THE WORK. Every image is a named, empty place under
   public/visual-identity/ (see its README). While a file is missing,
   its place says what belongs there and holds its shape, so dropping
   the real work in is the whole of the work.

   The construction grid around the symbol is ours and generic — the
   guides a mark is built on — not any client's geometry. References
   through Inspo: Orpetron (the mark shown as a seal with its
   construction in view) and Feathericons (the mark as a specimen in a
   ruled cell). Their colour and type stay with them.
   ================================================================== */

/* ---- the three businesses, before and after ---------------------- */

/** One turn of the three, in milliseconds. */
const PAIR_MS = 3400;

/** Two cards, side by side: on one the mark the business had, on the
    other the mark it ends up with. Only Pilar is shown (user,
    2026-11-18), so nothing turns; were another business ever added to
    BRANDS, the two cards would turn off one clock, the before and the
    after on screen always belonging to each other. On a phone one card
    sits over the other. */
function Pair({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (!inView || reduce || BRANDS.length < 2) return;
    const tick = window.setInterval(() => setAt((n) => n + 1), PAIR_MS);
    return () => window.clearInterval(tick);
  }, [inView, reduce]);

  const i = at % BRANDS.length;
  const sides = [
    { key: "before" as const, head: t("The mark they had", "A marca que tinham") },
    { key: "after" as const, head: t("The mark they have", "A marca que passam a ter") },
  ];

  return (
    <div ref={ref} className="vi-pair">
      {sides.map((side) => (
        <figure key={side.key} className="vi-pair-card" data-side={side.key}>
          <figcaption className="mono-label vi-pair-head">{side.head}</figcaption>
          <div className="vi-pair-stage">
            {BRANDS.map((brand, n) => (
              <div key={brand.id} className="vi-pair-one" data-on={n === i || undefined}>
                <span className="vi-pair-mark">
                  <Mark brand={brand} side={side.key} />
                </span>
                <span className="vi-pair-name">{brand.name}</span>
                <span className="mono-label vi-pair-trade">{brand.trade(t)}</span>
              </div>
            ))}
          </div>
        </figure>
      ))}
    </div>
  );
}

/* ---- the header, as the other service pages carry it ------------- */

function Head({ t }: { t: T }) {
  const facts = [
    { v: t("The logo", "O logotipo"), l: t("Included", "Incluído") },
    { v: t("The symbol", "O símbolo"), l: t("Where it applies", "Se aplicável") },
    { v: t("The website's look", "A estética do website"), l: t("Thought out with them", "Pensada com eles") },
  ];
  return (
    <section data-tone="dark" className="relative isolate text-paper">
      {/* No drop of its own (user, 2026-11-17): the bar carries one all
          the way down and the page ends on "Let's work together". */}
      <header className="shell ps-head" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("Additional service", "Serviço adicional")}</p>
          <h1 className="display mt-7 max-w-[18ch] text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98] font-light">
            {t("Visual identity", "Identidade visual")}
          </h1>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.08}>
          <p className="ps-head-say">
            <span className="font-light sm:block">{t("An outdated logo", "Um logótipo antiquado")}</span>{" "}
            <span className="font-medium sm:block">{t("undoes a first-rate website.", "desfaz um website de topo.")}</span>
          </p>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.16}>
          <dl className="ps-head-facts">
            {facts.map((f) => (
              <div key={f.l}>
                <dt>{f.v}</dt>
                <dd className="mono-label">{f.l}</dd>
              </div>
            ))}
          </dl>
        </SlideIn>
        {/* The words first, and the cards after them (user,
            2026-11-18): the mark the business had against the mark it
            ends up with, side by side, one over the other on a phone. */}
        <SlideIn ready distance={0} delay={0.22}>
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
      </div>
    </section>
  );
}

/* ---- 1. the proposal, in three things seen ----------------------- */

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

function Proposal({ t }: { t: T }) {
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
          {/* One: the mark that was, and the mark that is. */}
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

          {/* Two: the symbol, on the guides it was built on. */}
          <SlideIn ready distance={0} delay={0.18}>
            <figure className="vi-piece">
              <span className="vi-mark">
                <Grid drawn={drawn} />
                <span className="vi-mark-slot">
                  <Slot
                    src="/visual-identity/simbolo/simbolo.webp"
                    label={t("Image: the symbol", "Imagem: o símbolo")}
                    ratio="1 / 1"
                    dark
                  />
                </span>
              </span>
              <figcaption className="vi-cap">
                <span className="vi-cap-name">{t("The symbol, on its grid", "O símbolo, na sua grelha")}</span>
                <span className="mono-label vi-cap-shape">1:1</span>
              </figcaption>
            </figure>
          </SlideIn>

          {/* Three: the two of them, where they end up. */}
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

/* ---- 2. does it make sense for every business? ------------------- */

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

function Fits({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [answer, answerIn] = useInView<HTMLDivElement>(0.6);
  const [said, setSaid] = useState(false);
  const [at, setAt] = useState(0);

  /* The answer waits to be reached and is then uncovered once, by a
     black bar running across it: the marker of How we work, which
     fills its rail from the left as the row goes by. */
  useEffect(() => {
    if (answerIn) setSaid(true);
  }, [answerIn]);

  const fits = [
    t("no symbol at all", "nenhum s\u00edmbolo"),
    t("a logo that looks dated", "um log\u00f3tipo com ar antiquado"),
    t("a mark that says nothing about the business", "uma marca que n\u00e3o diz nada sobre o neg\u00f3cio"),
    t("a logo that does not match what the company is today", "um log\u00f3tipo que n\u00e3o corresponde ao que a empresa \u00e9 hoje"),
  ];
  const doesNot = [
    t("a professional visual identity already in place", "uma identidade visual profissional j\u00e1 feita"),
    t("a logo consistent with its corporate identity", "um log\u00f3tipo coerente com a identidade corporativa"),
    t("a mark drawn for the website it already has", "uma marca desenhada para o website que j\u00e1 tem"),
    t("a symbol that still says what it was made to say", "um s\u00edmbolo que ainda diz o que foi feito para dizer"),
  ];

  useEffect(() => {
    if (!inView || reduce) return;
    const tick = window.setInterval(() => setAt((n) => n + 1), CASE_MS);
    return () => window.clearInterval(tick);
  }, [inView, reduce]);

  return (
    <section aria-labelledby="vi-fit-title" data-tone="light" className="relative">
      <div ref={ref} className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("Who it is for", "Para quem \u00e9")}</p>
          <h2 id="vi-fit-title" className="display ps-title">
            {t("Does it make sense for every business?", "Faz sentido para todos os neg\u00f3cios?")}
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <div ref={answer} className="vi-answer">
            <p className="vi-no" data-said={said || reduce || undefined} data-still={reduce || undefined}>
              <span className="vi-no-word">{t("No.", "N\u00e3o.")}</span>
              <span aria-hidden="true" className="vi-no-bar" />
            </p>
            <p className="vi-no-say">
              {t(
                "A business that already presents a professional visual identity, coherent with the corporate identity of the company itself, does not need this service.",
                "Um neg\u00f3cio que j\u00e1 apresente uma identidade visual profissional e coesa com a identidade corporativa da pr\u00f3pria empresa n\u00e3o precisa deste servi\u00e7o.",
              )}
            </p>
          </div>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.14}>
          <div className="vi-cases">
            <Cases at={at} lead={t("It makes sense for a business with:", "Faz sentido para um neg\u00f3cio com:")} items={fits} />
            <Cases at={at} muted lead={t("It doesn\u2019t make sense for a business with:", "N\u00e3o faz sentido para um neg\u00f3cio com:")} items={doesNot} />
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- 3. not sure? ------------------------------------------------ */

/** How long each step of the change holds, in milliseconds. */
const MORPH_MS = 1250;

/** The mark a business had, taken apart over the guides a mark is
    built on, and the mark it ends up with put together on them - then
    the next business. Four steps: it stands, it comes apart, the
    guides draw and it is built again, it stands.

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
  const brand = BRANDS[Math.floor(n / 4) % BRANDS.length];

  return (
    <div
      ref={ref}
      className="vi-morph"
      data-step={step}
      role="img"
      aria-label={t(
        "Three invented businesses, each one's old mark taken apart and its new mark built on the guides.",
        "Tr\u00eas neg\u00f3cios inventados, cada marca antiga desfeita e a nova constru\u00edda sobre as guias.",
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

function NotSure({ t }: { t: T }) {
  return (
    <section aria-labelledby="vi-sure-title" data-tone="light" className="relative">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("Not sure?", "Com d\u00favidas?")}</p>
          <h2 id="vi-sure-title" className="display vi-sure-title">
            {t(
              "Not sure whether you need a new visual identity or not?",
              "Com d\u00favidas sobre se \u00e9 precisa uma nova identidade visual?",
            )}
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.1}>
          <div className="vi-sure">
            <div className="vi-sure-words">
              <p className="vi-sure-say">
                {t(
                  "Don\u2019t worry. We\u2019ll help you make the best decision on our first call. Fill in our form so we can help you.",
                  "N\u00e3o h\u00e1 problema. Ajudamos a tomar a melhor decis\u00e3o logo na primeira reuni\u00e3o. Basta preencher o formul\u00e1rio para podermos ajudar.",
                )}
              </p>
              <div className="vi-sure-foot">
                <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
              </div>
            </div>
            <Morph t={t} />
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- how the price works ----------------------------------------- */

function Prices({ t }: { t: T }) {
  const rows = [
    {
      n: "01",
      head: t("What the service is", "O que inclui o servi\u00e7o"),
      body: t(
        "The logo and the symbol, drawn at the same time as the look of the website, so the two are thought out together rather than one after the other.",
        "O log\u00f3tipo e o s\u00edmbolo, desenhados ao mesmo tempo que a est\u00e9tica do website, para os dois serem pensados em conjunto e n\u00e3o um depois do outro.",
      ),
    },
    {
      n: "02",
      head: t("What it costs", "Quanto custa"),
      body: t(
        `${TO_FILL}. Whether it is charged on its own or inside a package with the website: ${TO_FILL}.`,
        `${TO_FILL}. Se \u00e9 cobrado \u00e0 parte ou inclu\u00eddo num pacote com o website: ${TO_FILL}.`,
      ),
    },
    {
      n: "03",
      head: t("Proposals and revisions", "Propostas e revis\u00f5es"),
      body: t(
        `${TO_FILL} proposals and ${TO_FILL} rounds of revisions are included.`,
        `Est\u00e3o inclu\u00eddas ${TO_FILL} propostas e ${TO_FILL} rondas de revis\u00f5es.`,
      ),
    },
    {
      n: "04",
      head: t("The first meeting, free", "A reuni\u00e3o inicial, gratuita"),
      body: t(
        "Before any of that, we sit down and work out whether a new identity makes sense at all. It costs nothing and it commits to nothing.",
        "Antes disso, reunimos para perceber se uma nova identidade faz sequer sentido. N\u00e3o custa nada e n\u00e3o compromete a nada.",
      ),
    },
  ];

  return (
    <section aria-labelledby="vi-price-title" data-tone="dark" className="relative text-paper">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("How the price works", "Como funcionam os pre\u00e7os")}</p>
          <h2 id="vi-price-title" className="display ps-title">
            <span className="font-light sm:block">{t("The mark and the website", "A marca e o website")}</span>{" "}
            <span className="font-medium sm:block">{t("are priced as one piece of work.", "s\u00e3o or\u00e7amentados como um s\u00f3 trabalho.")}</span>
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
                "Os valores s\u00e3o definidos pelo est\u00fadio; entretanto, o formul\u00e1rio calcula uma estimativa.",
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
      <Proposal t={t} />
      <Fits t={t} />
      <NotSure t={t} />
      <Prices t={t} />
    </ToneRoom>
  );
}
