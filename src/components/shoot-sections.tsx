"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useInView, type T } from "./sbs-shared";

/* ==================================================================
   The photo shoot, in full

   Three sections under the service's own plate, from the studio's
   brief of 2026-11-17: what the session includes, where it is done and
   what the travel costs, and how each one is shaped around the brand.
   Two more were asked for and are not here: the before and after needs
   photographs the studio does not have yet, and the packages need
   prices it has not set (user, 2026-11-17).

   References were taken through Inspo and turned into this site's own
   black, white, Satoshi and Geist Mono: UAL and Ferrari for a title
   laid straight on the dark with no card under it, and Modern
   Treasury's and Unkey's node diagrams for the map, which is drawn here
   rather than fetched from a map service.

   The map is true to scale. The country is plotted from real
   coordinates into kilometres (x = (lon + 9.6) x 85.6, y = (42.2 - lat)
   x 111), so the thirty kilometres around Vila Nova de Gaia are thirty
   kilometres against the rest of it, not a ring drawn to look right.
   ================================================================== */

/* ---- what the session includes ---------------------------------- */

function included(t: T) {
  return [
    {
      name: t("A briefing meeting, free", "Reunião de briefing, gratuita"),
      body: t(
        "Before a camera comes out we talk: what the business does, who it speaks to, what the photographs have to say and where they will be used. It costs nothing and commits the client to nothing.",
        "Antes de se pegar na câmara, falamos: o que o negócio faz, a quem se dirige, o que as fotografias têm de dizer e onde vão ser usadas. Não tem custo nem obriga a nada.",
      ),
    },
    {
      name: t("Art direction", "Direção de arte"),
      body: t(
        "The session is planned before it happens: what is photographed, in what order, with what light, in what frame and with what props. Nothing is left to the day itself.",
        "A sessão é planeada antes de acontecer: o que se fotografa, por que ordem, com que luz, em que enquadramento e com que adereços. Nada fica para o improviso do dia.",
      ),
    },
    {
      name: t("The session itself", "A sessão fotográfica"),
      body: t(
        "The day of photography, at the place agreed, with the lighting the place needs. How long it runs and how many places it covers are set in the proposal.",
        "O dia de fotografia, no local combinado, com a iluminação que o local exigir. A duração e o número de locais ficam definidos na proposta.",
      ),
    },
    {
      name: t("Editing and retouching", "Edição e retoque"),
      body: t(
        "Every photograph delivered is worked on: colour, light, contrast and whatever needs correcting. The retouching is done so that the photograph still looks true.",
        "Todas as fotografias entregues são tratadas: cor, luz, contraste e as correções necessárias. O retoque é feito para a fotografia continuar a parecer verdadeira.",
      ),
    },
    {
      name: t("Delivery in an online gallery", "Entrega em galeria online"),
      body: t(
        "The final photographs arrive in an online gallery, ready to download at full resolution and in sizes made for the web.",
        "As fotografias finais são entregues numa galeria online, prontas a descarregar em alta resolução e em tamanhos próprios para web.",
      ),
    },
    {
      name: t("The right to use them", "Direitos de utilização"),
      body: t(
        "Once paid for, the photographs are entirely the client’s, to use on the website, on social media, in print and in other projects.",
        "Depois de pagas, as fotografias ficam inteiramente do cliente, que as pode usar no website, nas redes sociais, em impressos e noutros projetos.",
      ),
    },
  ];
}

export function Included({ t }: { t: T }) {
  const rows = included(t);
  return (
    <section aria-labelledby="sht-in-title" data-tone="light" className="sht sht-in relative">
      <div className="shell sht-head" data-tone-body>
        <div className="sht-stick">
          <p className="mono-label text-ash-2">{t("What the session includes", "O que a sessão inclui")}</p>
          <h2 id="sht-in-title" className="display sht-title">
            <span className="font-light sm:block">{t("Six things,", "Seis coisas,")}</span>{" "}
            <span className="font-medium sm:block">{t("none of them extra.", "nenhuma delas à parte.")}</span>
          </h2>
          <p className="ps-lede sht-lede">
            {t(
              "A session is not only the day of photography. This is everything inside it, and none of it is charged apart.",
              "A sessão não é só o dia de fotografia. Isto é tudo o que vai dentro dela, e nada se cobra à parte.",
            )}
          </p>
        </div>

        <dl className="sht-rows">
          {rows.map((row) => (
            <div key={row.name} className="sht-row">
              <dt className="sht-row-name">{row.name}</dt>
              <dd className="sht-row-body">{row.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---- where it is done ------------------------------------------- */

/** Mainland Portugal, plotted from real coordinates into kilometres,
    so the ring around Gaia is thirty real kilometres wide. */
const KM_X = (lon: number) => (lon + 9.62) * 85.6;
const KM_Y = (lat: number) => (42.25 - lat) * 111;

/** The coast, then the border, back to the Minho. */
const COAST: [number, number][] = [
  [41.87, -8.87], [41.69, -8.85], [41.37, -8.78], [41.15, -8.68], [40.9, -8.65],
  [40.64, -8.75], [40.15, -8.86], [39.85, -8.95], [39.6, -9.07], [39.36, -9.38],
  [39.08, -9.38], [38.78, -9.5], [38.68, -9.33], [38.48, -8.89], [38.25, -8.78],
  [37.95, -8.87], [37.5, -8.81], [37.17, -8.9], [37.02, -8.99], [37.05, -8.5],
  [37.01, -7.93], [37.17, -7.4], [37.6, -7.45], [38.0, -7.3], [38.2, -7.0],
  [38.5, -7.1], [39.0, -7.1], [39.4, -7.15], [39.7, -7.0], [40.0, -6.9],
  [40.4, -7.1], [41.0, -6.8], [41.4, -6.55], [41.8, -6.6], [41.9, -7.2],
  [41.85, -8.0], [41.87, -8.87],
];

const GAIA: [number, number] = [41.12, -8.62];

export function Coverage({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  const [lit, setLit] = useState<"near" | "far" | null>(null);
  const shown = inView || reduce;

  const path = COAST.map(([lat, lon], i) => `${i ? "L" : "M"}${KM_X(lon).toFixed(1)} ${KM_Y(lat).toFixed(1)}`).join(" ") + " Z";
  const gx = KM_X(GAIA[1]);
  const gy = KM_Y(GAIA[0]);

  return (
    <section aria-labelledby="sht-map-title" data-tone="light" className="sht sht-map relative">
      <div className="shell sht-map-grid" data-tone-body>
        <div>
          <p className="mono-label text-ash-2">{t("Where we work", "Área de cobertura")}</p>
          <h2 id="sht-map-title" className="display sht-title">
            <span className="font-light sm:block">{t("Mainland Portugal,", "Portugal continental,")}</span>{" "}
            <span className="font-medium sm:block">{t("and nowhere else.", "e mais nenhum lado.")}</span>
          </h2>

          <p className="ps-lede sht-lede">
            {t(
              "Where we go, and what getting there costs.",
              "Onde vamos, e o que custa lá chegar.",
            )}
          </p>

          <ul className="sht-legend">
            <li
              data-on={lit === "near" || undefined}
              onPointerEnter={() => setLit("near")}
              onPointerLeave={() => setLit(null)}
            >
              <span aria-hidden="true" className="sht-key sht-key-near" />
              <span>
                <strong>{t("Within 30 km of Vila Nova de Gaia", "Até 30 km de Vila Nova de Gaia")}</strong>
                <em>{t("Travel included", "Deslocação incluída")}</em>
              </span>
            </li>
            <li
              data-on={lit === "far" || undefined}
              onPointerEnter={() => setLit("far")}
              onPointerLeave={() => setLit(null)}
            >
              <span aria-hidden="true" className="sht-key sht-key-far" />
              <span>
                <strong>{t("The rest of mainland Portugal", "O resto de Portugal continental")}</strong>
                <em>{t("Travel charged per km, as set in the proposal", "Deslocação cobrada ao km, como fica definido na proposta")}</em>
              </span>
            </li>
          </ul>
        </div>

        <div ref={ref} className="sht-map-plate" data-in={shown || undefined} data-lit={lit ?? undefined}>
          <svg viewBox="-10 -10 420 600" className="sht-map-svg" role="img" aria-label={t("Mainland Portugal, with the thirty kilometres around Vila Nova de Gaia marked", "Portugal continental, com os trinta quilómetros à volta de Vila Nova de Gaia assinalados")}>
            <defs>
              <clipPath id="sht-land">
                <path d={path} />
              </clipPath>
            </defs>
            {/* The country: the far zone, the one that is charged. */}
            <path d={path} className="sht-land" />
            {/* The thirty kilometres, cut to the land so the ring never
                swims out into the sea. */}
            <g clipPath="url(#sht-land)">
              <circle cx={gx} cy={gy} r={30} className="sht-near" />
            </g>
            <circle cx={gx} cy={gy} r={30} className="sht-ring" />
            <circle cx={gx} cy={gy} r={2.4} className="sht-dot" />
            {/* A hairline out of the ring to the name, so the label
                never sits on the country. */}
            <line x1={gx + 30} y1={gy} x2={gx + 62} y2={gy} className="sht-leader" />
            <text x={gx + 68} y={gy - 3} className="sht-pin">
              Vila Nova de Gaia
            </text>
            <text x={gx + 68} y={gy + 17} className="sht-pin sht-pin-small">
              {t("30 km around it", "30 km à volta")}
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ---- shaped around the brand ------------------------------------ */

/** One run of the whole line, in milliseconds per word. */
const SWAP_MS = 2600;

function dials(t: T) {
  return [
    {
      label: t("What is photographed", "O que se fotografa"),
      words: [t("a product", "o produto"), t("the team", "a equipa"), t("the place", "o espaço"), t("the work itself", "o trabalho a acontecer")],
    },
    {
      label: t("Where", "Onde"),
      words: [t("in the shop", "na loja"), t("at the office", "no escritório"), t("in a studio", "em estúdio"), t("outdoors", "no exterior")],
    },
    {
      label: t("In what style", "Que estilo"),
      words: [t("natural", "natural"), t("studio-lit", "de estúdio"), t("editorial", "editorial"), t("plain", "cru")],
    },
    {
      label: t("How many", "Quantas"),
      words: [t("a few, well chosen", "poucas e certeiras"), t("a series", "uma série"), t("a whole catalogue", "um catálogo inteiro")],
    },
  ];
}

export function Tailored({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const list = dials(t);
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const tick = window.setInterval(() => setAt((n) => n + 1), SWAP_MS);
    return () => window.clearInterval(tick);
  }, [inView, reduce]);

  return (
    <section aria-labelledby="sht-fit-title" data-tone="light" className="sht sht-fit relative">
      <div ref={ref} className="shell" data-tone-body>
        <p className="mono-label text-ash-2">{t("Personalisation", "Personalização")}</p>
        <h2 id="sht-fit-title" className="display sht-title">
          <span className="font-light sm:block">{t("Every session is shaped", "Cada sessão é pensada")}</span>{" "}
          <span className="font-medium sm:block">{t("around the brand.", "à medida de cada marca.")}</span>
        </h2>

        <p className="ps-lede sht-lede">
          {t(
            "Nothing here is a closed package: the session is drawn around what the brand has to show.",
            "Nada aqui é um pacote fechado: a sessão é desenhada à volta do que a marca tem para mostrar.",
          )}
        </p>

        <div className="sht-dials">
          {list.map((d) => {
            const i = at % d.words.length;
            return (
              <div key={d.label} className="sht-dial">
                <p className="mono-label sht-dial-label">{d.label}</p>
                <p className="sht-dial-slot" aria-live="off">
                  {d.words.map((w, n) => (
                    <span key={w} className="sht-dial-word" data-on={n === i || undefined} data-gone={n < i || (i === 0 && n === d.words.length - 1) || undefined}>
                      {w}
                    </span>
                  ))}
                  {/* The longest word holds the slot open, so nothing
                      below it moves as the words change. */}
                  <span aria-hidden="true" className="sht-dial-ghost">
                    {d.words.reduce((a, b) => (b.length > a.length ? b : a))}
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        <p className="sht-ask">
          <span className="font-light">{t("Not sure what to choose?", "Sem saber o que escolher?")}</span>{" "}
          <span className="font-medium">{t("At the meeting, we work the session out together.", "Na reunião, ajudamos a definir a sessão ideal.")}</span>
        </p>
      </div>
    </section>
  );
}

