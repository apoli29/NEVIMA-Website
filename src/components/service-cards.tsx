"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useInView, type T } from "./sbs-shared";
import { BRANDS, Mark } from "./vi-brands";
import { useT } from "@/lib/use-lang";

/* ==================================================================
   The services' cards (user, 2026-11-19)

   In "Our Services" each service used to be shown by a photograph. Each
   one is now a short loop on a dark card, drawn in the language of the
   service's own page and cut down to the showcase's 4:5 frame (and to
   5:4 inside the open drawer on a phone):

   - Web design (no page of its own, so drawn from scratch): the twelve
     columns draw, a page is laid on them as a wireframe, filled in, and
     then reflowed to a phone's width.
   - Visual identity: Pilar's old mark taken apart over the guides and
     its new one built on them (the identity page's Morph, in grey, so
     the card keeps the site's black and white).
   - Back-end features: a request walking down the four steps of the
     back end page's ProcessCard, stood upright.
   - SEO & GEO: the clinic of the SEO & GEO page climbs from fifth to
     first in the results, then an AI assistant names it and cites it.
   - Photo shoot (user, 2026-11-19: a figure photographing a product and
     filming a shop): the line figure of the identity page's film
     frames a product, the flash goes and the photo lands in a strip;
     then the scene is a shopfront and the camera records it.

   Each card runs only while it is on the screen (and, in a drawer, only
   while the drawer is open). With reduced motion asked for, it stands
   on its last frame.

   The ground is the side-by-side card's dark gradient, as on the back
   end page; styled .svk-* in globals.css.
   ================================================================== */

/** The loop's clock: the step it is on, held for its own time. */
function useBeat(holds: number[], run: boolean, still: boolean) {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (!run || still) return;
    const id = window.setTimeout(() => setAt((s) => (s + 1) % holds.length), holds[at]);
    return () => window.clearTimeout(id);
  }, [at, run, still, holds]);
  return still ? holds.length - 1 : at;
}

type Spec = {
  holds: number[];
  kicker: (t: T) => string;
  label: (t: T) => string;
  /** the step's name, under the stage; left out where the stage names it */
  phases?: (t: T) => string[];
  Stage: (props: { at: number; run: boolean; t: T }) => ReactNode;
};

const SPECS: Record<string, Spec> = {
  "web-design": {
    holds: [1700, 1900, 2500, 3000],
    kicker: (t) => t("A page, from the grid up", "Uma página, a partir da grelha"),
    label: (t) =>
      t(
        "A web page laid out on a twelve-column grid, filled in, then reflowed to fit a phone.",
        "Uma página web desenhada sobre uma grelha de doze colunas, preenchida e depois reorganizada para caber num telemóvel.",
      ),
    phases: (t) => [t("The grid", "A grelha"), t("The wireframe", "O esqueleto"), t("The page", "A página"), t("On a phone", "No telemóvel")],
    Stage: WebDesign,
  },
  "visual-identity": {
    holds: [1700, 1300, 1300, 2400],
    kicker: () => "Pilar",
    label: (t) =>
      t(
        "Pilar's old mark taken apart and its new mark built on the guides.",
        "A marca antiga da Pilar desfeita e a nova construída sobre as guias.",
      ),
    phases: (t) => [
      t("The mark it had", "A marca que tinha"),
      t("Taken apart", "Desfeita"),
      t("Built on the guides", "Construída sobre as guias"),
      t("The mark it has", "A marca que passa a ter"),
    ],
    Stage: Identity,
  },
  "back-end-features": {
    holds: [2100, 2100, 2100, 2700],
    kicker: (t) => t("A request, from end to end", "Um pedido, do início ao fim"),
    label: (t) =>
      t(
        "A request sent from the website's form is kept in the database, becomes a booking in the calendar, and the confirmation goes out on its own.",
        "Um pedido enviado pelo formulário do website fica guardado na base de dados, passa a marcação no calendário, e a confirmação sai sozinha.",
      ),
    Stage: BackEnd,
  },
  seo: {
    holds: [2300, 2300, 3400, 2600],
    kicker: (t) => t("Search, then AI", "Pesquisa, depois IA"),
    label: (t) =>
      t(
        "A clinic climbs from fifth to first in the search results, then an AI assistant recommends it and cites its website.",
        "Uma clínica sobe do quinto para o primeiro lugar nos resultados de pesquisa e depois um assistente de IA recomenda-a e cita o seu website.",
      ),
    phases: (t) => [
      t("The search", "A pesquisa"),
      t("SEO: the first result", "SEO: o primeiro resultado"),
      t("GEO: the AI recommends it", "GEO: a IA recomenda-a"),
      t("Cited as the source", "Citada como fonte"),
    ],
    Stage: SeoGeo,
  },
  "photo-shoot": {
    holds: [2200, 1900, 2000, 3200],
    kicker: (t) => t("Photo and video", "Fotografia e vídeo"),
    label: (t) =>
      t(
        "A photographer frames a product and takes its photo, then films the shopfront of a business.",
        "Um fotógrafo enquadra um produto e fotografa-o, e depois filma a fachada de uma loja.",
      ),
    phases: (t) => [
      t("Framing the product", "A enquadrar o produto"),
      t("The photo", "A fotografia"),
      t("At the shop", "Na loja"),
      t("Recording", "A gravar"),
    ],
    Stage: PhotoShoot,
  },
};

/** One service's card. `play` is false while it cannot be seen for
    another reason than the screen (a closed drawer). */
export function ServiceCard({ slug, play = true }: { slug: string; play?: boolean }) {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLElement>(0.3);
  const spec = SPECS[slug];
  const run = play && inView;
  const at = useBeat(spec?.holds ?? [1], run, reduce);
  if (!spec) return null;
  const { Stage } = spec;
  const phase = spec.phases?.(t)[at];

  return (
    <figure ref={ref} className="svk" data-kind={slug} data-still={reduce || undefined} role="img" aria-label={spec.label(t)}>
      <p className="mono-label svk-kicker">{spec.kicker(t)}</p>
      <div className="svk-stage" aria-hidden="true">
        <Stage at={at} run={run && !reduce} t={t} />
      </div>
      <p className="mono-label svk-foot" aria-hidden="true">
        <span className="svk-phase" key={phase}>
          {phase}
        </span>
        <span className="tabular-nums">
          {String(at + 1).padStart(2, "0")} / {String(spec.holds.length).padStart(2, "0")}
        </span>
      </p>
    </figure>
  );
}

/* ---- web design --------------------------------------------------- */

function WebDesign({ at }: { at: number; run: boolean; t: T }) {
  return (
    <div className="svk-wd" data-at={at}>
      <div className="svk-wd-page">
        <span className="svk-wd-dots">
          <i /> <i /> <i />
        </span>
        <span className="svk-wd-guides">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ ["--i" as string]: i }} />
          ))}
        </span>
        {["nav", "h1", "h2", "p1", "p2", "btn", "img"].map((b, i) => (
          <span key={b} className={`svk-wd-b svk-wd-${b}`} style={{ ["--i" as string]: i }} />
        ))}
      </div>
    </div>
  );
}

/* ---- visual identity ---------------------------------------------- */

/** The guides a mark is built on, as the identity page draws them. */
function Guides({ drawn }: { drawn: boolean }) {
  const rule = (d: number, o: number) => ({ ["--d" as string]: d, ["--o" as string]: `${o}s` });
  return (
    <svg viewBox="0 0 200 200" className="vi-grid" data-in={drawn || undefined}>
      <rect x="20" y="20" width="160" height="160" className="vi-g-rule" style={rule(640, 0)} />
      <line x1="100" y1="20" x2="100" y2="180" className="vi-g-rule" style={rule(160, 0.18)} />
      <line x1="20" y1="100" x2="180" y2="100" className="vi-g-rule" style={rule(160, 0.26)} />
      <line x1="20" y1="20" x2="180" y2="180" className="vi-g-rule vi-g-faint" style={rule(227, 0.34)} />
      <line x1="180" y1="20" x2="20" y2="180" className="vi-g-rule vi-g-faint" style={rule(227, 0.42)} />
      <circle cx="100" cy="100" r="80" className="vi-g-rule" style={rule(503, 0.5)} />
      <circle cx="100" cy="100" r="50" className="vi-g-rule vi-g-faint" style={rule(314, 0.58)} />
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

function Identity({ at }: { at: number; run: boolean; t: T }) {
  const brand = BRANDS[0]!;
  return (
    <div className="vi-morph svk-vi" data-step={at}>
      <span className="vi-morph-stage">
        <span className="vi-morph-grid">
          <Guides drawn={at === 1 || at === 2} />
        </span>
        <span className="vi-morph-face vi-morph-old">
          <Mark brand={brand} side="before" />
        </span>
        <span className="vi-morph-face vi-morph-new">
          <Mark brand={brand} side="after" />
        </span>
      </span>
    </div>
  );
}

/* ---- back-end features -------------------------------------------- */

function BackEnd({ at, run, t }: { at: number; run: boolean; t: T }) {
  const steps = [
    t("The form is sent", "O formulário é enviado"),
    t("The request is kept", "O pedido fica guardado"),
    t("The booking is made", "A marcação é criada"),
    t("The client is answered", "O cliente é respondido"),
  ];
  return (
    <ol className="svk-be" data-at={at}>
      <span className="svk-be-wire">
        <span className="svk-be-bead" data-run={run || undefined} style={{ ["--at" as string]: at }} />
      </span>
      {steps.map((name, i) => (
        <li key={name} className="svk-be-row" data-on={at === i || undefined} data-done={at > i || undefined}>
          <span className="mono-label svk-be-n">0{i + 1}</span>
          <span className="svk-be-name">{name}</span>
          <span className={`svk-be-sheet svk-be-${["form", "table", "cal", "mail"][i]}`}>
            {i === 0 && (
              <>
                <i /> <i /> <i />
              </>
            )}
            {i === 1 && (
              <>
                <b /> <i /> <i /> <i />
              </>
            )}
            {i === 2 && Array.from({ length: 14 }, (_, c) => <i key={c} data-take={c === 9 || undefined} />)}
            {i === 3 && (
              <>
                <i /> <i />
                <svg viewBox="0 0 20 20">
                  <path d="M4 10.5 L8.5 15 L16 5.5" />
                </svg>
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ---- SEO & GEO ---------------------------------------------------- */

function Words({ text, on }: { text: string; on: boolean }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={`${on}-${i}`} className="svk-word" data-on={on || undefined} style={{ ["--w" as string]: i }}>
          {w}{" "}
        </span>
      ))}
    </>
  );
}

function SeoGeo({ at, t }: { at: number; run: boolean; t: T }) {
  const name = "Clínica Dentária Sorriso";
  // The clinic is fifth on the search, first from the second step on.
  const ours = at >= 1 ? 0 : 4;
  const others = [0, 1, 2, 3].map((n) => (at >= 1 ? n + 1 : n));
  const widths = ["78%", "64%", "72%", "58%"];
  return (
    <div className="svk-sg" data-at={at}>
      <p className="svk-sg-bar">
        <svg viewBox="0 0 16 16" className="svk-sg-lens">
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5 L14 14" />
        </svg>
        <span>
          <Words text={t("dentist near me", "dentista perto de mim")} on />
        </span>
      </p>
      <ol className="svk-sg-list">
        {others.map((r, i) => (
          <li key={i} className="svk-sg-res" style={{ ["--r" as string]: r }}>
            <i style={{ width: widths[i] }} />
            <i />
          </li>
        ))}
        <li className="svk-sg-res svk-sg-ours" style={{ ["--r" as string]: ours }}>
          <span className="svk-sg-title">{name}</span>
          <span className="mono-label svk-sg-url">clinicasorriso.pt</span>
        </li>
      </ol>
      <div className="svk-sg-ai" data-on={at >= 2 || undefined}>
        <p className="mono-label svk-sg-ai-top">
          <span className="svk-sg-mark" />
          {t("AI assistant", "Assistente de IA")}
        </p>
        <p className="svk-sg-answer">
          <Words
            text={t(
              "I’d recommend Clínica Dentária Sorriso, in Alvalade, 300 m from the metro.",
              "Recomendo a Clínica Dentária Sorriso, em Alvalade, a 300 m do metro.",
            )}
            on={at >= 2}
          />
        </p>
        <p className="mono-label svk-sg-source" data-on={at >= 3 || undefined}>
          <span className="svk-sg-dot" />
          clinicasorriso.pt
        </p>
      </div>
    </div>
  );
}

/* ---- photo shoot -------------------------------------------------- */

function PhotoShoot({ at, run }: { at: number; run: boolean; t: T }) {
  const shop = at >= 2;
  const rec = at === 3;
  // The recording's time, counted while it records.
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!rec || !run) return;
    setSecs(0);
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [rec, run]);

  return (
    <svg viewBox="0 0 240 200" className="svk-ps" data-at={at} preserveAspectRatio="xMidYMid meet">
      <line x1="8" y1="182" x2="232" y2="182" className="svk-ps-floor" />

      {/* the product, on its plinth, in the frame */}
      <g className="svk-ps-scene" data-on={!shop || undefined}>
        <rect x="148" y="150" width="58" height="32" className="svk-ps-line" />
        <rect x="166" y="106" width="22" height="44" rx="5" className="svk-ps-line" />
        <rect x="172" y="94" width="10" height="12" className="svk-ps-line" />
        <rect x="170" y="122" width="14" height="14" className="svk-ps-fill" />
        <path d="M140 92h10M140 92v10M214 92h-10M214 92v10M140 162h10M140 162v-10M214 162h-10M214 162v-10" className="svk-ps-frame" />
        {/* the strip the photos land in */}
        <g className="svk-ps-strip">
          {[0, 1, 2].map((n) => (
            <rect key={n} x={150 + n * 20} y="30" width="16" height="13" className="svk-ps-thumb" data-taken={(n === 1 && at >= 1) || undefined} />
          ))}
          <rect x="174" y="34" width="4" height="7" rx="1" className="svk-ps-mini" data-on={at >= 1 || undefined} />
        </g>
      </g>

      {/* the shopfront */}
      <g className="svk-ps-scene" data-on={shop || undefined}>
        <rect x="138" y="70" width="94" height="112" className="svk-ps-line" />
        <rect x="138" y="70" width="94" height="14" className="svk-ps-fill" />
        <path d="M138 84 q7.8 10 15.7 0 q7.8 10 15.7 0 q7.8 10 15.7 0 q7.8 10 15.7 0 q7.8 10 15.7 0 q7.8 10 15.7 0" className="svk-ps-line" />
        <rect x="146" y="104" width="44" height="44" className="svk-ps-line" />
        <rect x="152" y="132" width="10" height="16" className="svk-ps-fill" />
        <circle cx="176" cy="138" r="6" className="svk-ps-line" />
        <rect x="200" y="104" width="24" height="78" className="svk-ps-line" />
        <circle cx="219" cy="145" r="1.6" className="svk-ps-dotfill" />
        <path d="M130 58h10M130 58v10M240 58h-10M240 58v10M130 190h10M130 190v-10M240 190h-10M240 190v-10" className="svk-ps-frame svk-ps-pan" data-on={rec || undefined} />
        <g className="svk-ps-rec" data-on={rec || undefined}>
          <circle cx="136" cy="46" r="3" className="svk-ps-recdot" />
          <text x="143" y="49" className="svk-ps-time">
            REC 00:00:{String(Math.min(secs, 59)).padStart(2, "0")}
          </text>
        </g>
      </g>

      {/* the figure */}
      <path d="M44 182 C46 132 56 102 66 102 C76 102 86 132 88 182" className="svk-ps-line" />
      <circle cx="66" cy="82" r="15" className="svk-ps-line" />
      {/* photographing: the camera to the eye */}
      <g className="svk-ps-pose" data-on={!shop || undefined}>
        <path d="M76 112 Q92 106 96 92" className="svk-ps-line" />
        <rect x="88" y="76" width="20" height="14" rx="2" className="svk-ps-cam" />
        <rect x="108" y="79" width="5" height="8" className="svk-ps-cam" />
        <rect x="92" y="73" width="6" height="3" className="svk-ps-cam" />
      </g>
      {/* filming: the camera held out, its light on while it records */}
      <g className="svk-ps-pose" data-on={shop || undefined}>
        <path d="M78 116 Q96 126 104 116" className="svk-ps-line" />
        <rect x="100" y="104" width="22" height="14" rx="2" className="svk-ps-cam" />
        <path d="M122 107 L130 103 V119 L122 115 Z" className="svk-ps-cam" />
        <circle cx="105" cy="101" r="2" className="svk-ps-recdot" data-on={rec || undefined} />
      </g>

      <rect x="0" y="0" width="240" height="200" className="svk-ps-flash" />
    </svg>
  );
}
