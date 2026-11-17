"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { BeforeAfter } from "./project-report";
import { ToneRoom } from "./tone-veil";
import { ProposalAsk } from "./about-faq";
import { useInView, type T } from "./sbs-shared";
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

/* ---- the header, as the other service pages carry it ------------- */

function Head({ t }: { t: T }) {
  const facts = [
    { v: t("The logo", "O logotipo"), l: t("Included", "Incluído") },
    { v: t("The symbol", "O símbolo"), l: t("Where it applies", "Se aplicável") },
    { v: t("The website's look", "A estética do website"), l: t("Thought out with them", "Pensada com eles") },
  ];
  return (
    <section data-tone="dark" className="relative isolate text-paper">
      <header className="shell ps-head" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("Additional service", "Serviço adicional")}</p>
          <h1 className="display mt-7 max-w-[18ch] text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98] font-light">
            {t("Visual Identity", "Identidade Visual")}
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
        <SlideIn ready distance={0} delay={0.22} className="ps-head-ask">
          <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
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

function Fits({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [at, setAt] = useState(0);

  const cases = [
    t("a logo drawn fifteen years ago", "um logótipo desenhado há quinze anos"),
    t("a mark that says nothing about the business", "uma marca que não diz nada sobre o negócio"),
    t("a logo that does not go with its own website", "um logótipo que não combina com o próprio website"),
    t("no symbol at all", "nenhum símbolo"),
  ];

  useEffect(() => {
    if (!inView || reduce) return;
    const tick = window.setInterval(() => setAt((n) => n + 1), CASE_MS);
    return () => window.clearInterval(tick);
  }, [inView, reduce]);

  const i = at % cases.length;

  return (
    <section aria-labelledby="vi-fit-title" data-tone="light" className="relative">
      <div ref={ref} className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("Who it is for", "Para quem é")}</p>
          <h2 id="vi-fit-title" className="display ps-title">
            {t("Does it make sense for every business?", "Faz sentido para todos os negócios?")}
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <div className="vi-answer">
            <p className="vi-no">{t("No.", "Não.")}</p>
            <p className="vi-no-say">
              {t(
                "A business that already presents a professional visual identity, coherent with the corporate identity of the company itself, does not need this service.",
                "Um negócio que já apresente uma identidade visual profissional e coesa com a identidade corporativa da própria empresa não precisa deste serviço.",
              )}
            </p>
          </div>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.14}>
          <p className="vi-case">
            <span className="vi-case-lead">{t("It makes sense for a business with", "Faz sentido para um negócio com")}</span>
            <span className="vi-case-slot">
              {cases.map((c, n) => (
                <span key={c} className="vi-case-word" data-on={n === i || undefined} data-gone={n < i || (i === 0 && n === cases.length - 1) || undefined}>
                  {c}
                </span>
              ))}
              {/* The longest holds the line open, so nothing under it moves. */}
              <span aria-hidden="true" className="vi-case-ghost">
                {cases.reduce((a, b) => (b.length > a.length ? b : a))}
              </span>
            </span>
          </p>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.2}>
          <div className="vi-doubt">
            <p className="vi-doubt-say">
              <span className="font-light sm:block">{t("Not sure whether it is needed?", "Com dúvidas sobre se é preciso?")}</span>{" "}
              <span className="font-medium sm:block">
                {t("We help pick the best options for the project.", "Ajudamos a escolher as melhores opções para o projeto.")}
              </span>
            </p>
            <p className="vi-doubt-more">
              {t(
                "Whether a new logo and a new symbol make sense in that case is part of what we work out together, before anything is charged for.",
                "Se faz sentido, nesse caso, um logótipo e um símbolo novos é parte do que definimos em conjunto, antes de se cobrar o que quer que seja.",
              )}
            </p>
            <div className="vi-doubt-ask">
              <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
            </div>
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
    </ToneRoom>
  );
}
