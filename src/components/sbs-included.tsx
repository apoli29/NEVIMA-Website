"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { useInView, useScramble, type T } from "./sbs-shared";
import { useT } from "@/lib/use-lang";

/* ==================================================================
   Included in the service

   A gallery wall of ten small works, one for each thing the service
   includes, and one light that moves along the wall from work to work.

   The references, found through Inspo and Awwwards: Pace Gallery's home
   page for the time (a row of hairlines, one per work, the current one
   filling), Terakawa Photo Office for the gallery's manners in a
   studio's site (square keys, wall labels with a rule before them,
   numbers set between hairlines), and Linear's features page for the
   name that scrambles into place, which is what is left of the
   technology here.

   Each work is a print in a thin black frame on a white mat: the
   pictogram is drawn on its construction grid, the cells it uses filled
   and the ones it does not marked with a point, as an engraving would be
   proofed. Unlit, the frame is grey and the print faint; lit, the frame
   is ink, the print sharp, and the work hangs a little further off the
   wall under the light.

   The wall label beside it carries the number, the name, what is
   included and, where the site already says it, what is done elsewhere.
   Under both runs the time: ten hairlines, the passed ones in ink, the
   current one filling, with Previous, Pause and Next as square keys. The
   number turns over like a counter. The wall holds still while the
   pointer or the keyboard is on it, and for anyone who has asked for
   less motion it starts paused.
   ================================================================== */

/** Pixel pictograms, nine cells square, "#" lit. */
const ICONS: Record<string, string[]> = {
  hosting: [".........", "#########", "#.#.....#", "#########", ".........", "#########", "#.#.....#", "#########", "........."],
  domain: ["..#####..", ".#..#..#.", "#..#.#..#", "#########", "#..#.#..#", "#########", "#..#.#..#", ".#..#..#.", "..#####.."],
  calls: ["##.......", "###......", "###......", ".##......", "..##.....", "...##..##", "....#####", ".....####", "......##."],
  seo: [".####....", "#....#...", "#....#...", "#....#...", "#....#...", ".####....", ".....##..", "......##.", ".......##"],
  texts: [".........", "#########", ".........", "#######..", ".........", "#########", ".........", "#####....", "........."],
  legal: [".#####...", ".#...##..", ".#...###.", ".#.....#.", ".#.###.#.", ".#.....#.", ".#.###.#.", ".#.....#.", ".#######."],
  trademark: ["..#####..", ".#.....#.", "#.###...#", "#.#..#..#", "#.###...#", "#.#.#...#", "#.#..#..#", ".#.....#.", "..#####.."],
  direct: [".##...##.", "####.####", ".##...##.", ".........", "###...###", "####.####", "####.####", ".........", "........."],
  support: [".........", "........#", ".......##", "......##.", "#....##..", "##..##...", ".####....", "..##.....", "........."],
  proposal: ["#########", "#.......#", "#.#.###.#", "#.......#", "#.#.###.#", "#.......#", "#.#.###.#", "#.......#", "#########"],
};

type Feature = { id: string; name: string; text: string; aside?: { lead: string; text: string; elsewhere?: boolean } };

/** What the same thing usually is at a traditional agency. Only hosting,
    SEO and contact carry a claim the site already makes (the home page's
    comparison); for the rest it says no more than that it is not always
    included. */
function theirs(t: T, id: string) {
  if (id === "hosting" || id === "seo") return t("Charged extra", "Pago à parte");
  if (id === "direct") return t("Indirect contact", "Contacto indireto");
  return t("Not always included", "Nem sempre incluído");
}
/** Hung on their wall, at a price: the two the site says are charged extra. */
const HUNG_THERE = new Set(["hosting", "seo"]);

/** Everything here is said elsewhere on the site already (the about
    page's questions, the home page's comparison, the form), and only
    gathered in one place. Nothing new is promised. */
function features(t: T): Feature[] {
  const elsewhere = t("Elsewhere:", "Noutros casos:");
  return [
    {
      id: "hosting",
      name: t("Free hosting", "Alojamento gratuito"),
      text: t(
        "We don’t charge for hosting: there’s no platform or subscription to pay for, and we handle all the logistics.",
        "Não cobramos o alojamento: não há plataformas nem subscrições para pagar, e tratamos de toda a logística.",
      ),
      aside: {
        lead: elsewhere,
        elsewhere: true,
        text: t(
          "platforms such as Wix, among others, can charge over €100 a year.",
          "plataformas como o Wix, entre outras, podem cobrar mais de 100 € por ano.",
        ),
      },
    },
    {
      id: "domain",
      name: t("Help with your domain", "Assistência no domínio"),
      text: t(
        "We guide you through registering your domain, step by step, in your business’s name, and connect it to the website. If you already have one, we connect it at no extra cost.",
        "Acompanhamos o registo do domínio, passo a passo, em nome do próprio negócio, e ligamo-lo ao website. Se já existe, ligamo-lo sem custos adicionais.",
      ),
      aside: {
        lead: t("Paid directly:", "Pago diretamente:"),
        text: t("the domain itself, usually €10 to €30 a year.", "o próprio domínio, normalmente entre 10 e 30 € por ano."),
      },
    },
    {
      id: "calls",
      name: t("Free calls", "Chamadas gratuitas"),
      text: t(
        "We reply to your form within a few hours and present the exact price on a short call. Once part of your website is built, and if you’d like, we book another free call to show you the direction it’s taking.",
        "Respondemos ao formulário em poucas horas e apresentamos o preço exato numa breve chamada. Quando parte do website estiver construída, e se o cliente o pretender, marcamos outra chamada gratuita para mostrar a direção que está a tomar.",
      ),
    },
    {
      id: "seo",
      name: t("Basic SEO", "SEO básico"),
      text: t(
        "Basic SEO practices are already included, so your website doesn’t disappear from search engine results.",
        "As práticas básicas de SEO já estão incluídas, para que o website não desapareça dos resultados dos motores de busca.",
      ),
      aside: {
        lead: elsewhere,
        elsewhere: true,
        text: t("many agencies charge for even the most basic SEO practices.", "muitas agências cobram até pelas práticas de SEO mais básicas."),
      },
    },
    {
      id: "texts",
      name: t("Your website’s texts", "Textos do website"),
      text: t(
        "We review your texts or, if you have none, write them, at no extra cost.",
        "Revemos os textos ou, se não existirem, escrevemo-los, sem custo adicional.",
      ),
    },
    {
      id: "legal",
      name: t("Legal pages", "Páginas legais"),
      text: t(
        "We put your legal pages on the website. Their content is your business’s own responsibility.",
        "Colocamos as páginas legais no website. O seu conteúdo é da responsabilidade do próprio negócio.",
      ),
    },
    {
      id: "trademark",
      name: t("Trademark registration", "Registo da marca"),
      text: t(
        "If applicable, we guide you through registering your trademark, which is filed in your business’s own name.",
        "Se se aplicar, acompanhamos o cliente no registo da marca, que é feito em nome do próprio negócio.",
      ),
    },
    {
      id: "direct",
      name: t("Direct contact", "Contacto direto"),
      text: t(
        "You always deal directly with the two people doing the work, and we adjust the project down to the detail based on your feedback.",
        "O cliente fala sempre diretamente com as duas pessoas que fazem o trabalho, e ajustamos o projeto ao pormenor com base no feedback recebido.",
      ),
      aside: {
        lead: elsewhere,
        elsewhere: true,
        text: t(
          "sometimes the client never gets in direct contact with those in charge of the project.",
          "por vezes, o cliente nem chega a falar diretamente com os responsáveis pelo projeto.",
        ),
      },
    },
    {
      id: "support",
      name: t("Support after launch", "Apoio depois do lançamento"),
      text: t(
        "Our support doesn’t end when the website goes live: we stay on hand for whatever you need.",
        "O apoio não acaba quando o website é colocado no ar: continuamos disponíveis para o que for necessário.",
      ),
    },
    {
      id: "proposal",
      name: t("Free proposal", "Proposta gratuita"),
      text: t(
        "A short form calculates an estimate for your project, breaking down the cost of each service.",
        "Um formulário curto calcula uma estimativa para o projeto, com o custo de cada serviço discriminado.",
      ),
    },
  ];
}


/** How long each work stays lit while the wall runs on its own. */
const INCLUDED_MS = 6000;
/** Works on a row of the wall. */
const COLS = 5;

/** The pictogram on its construction grid: used cells filled, the rest
    marked with a point. */
function Print({ name }: { name: string }) {
  const rows = ICONS[name] ?? [];
  let on = "";
  let off = "";
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "#") on += `M${x + 0.1} ${y + 0.1}h0.8v0.8h-0.8Z`;
      else off += `M${x + 0.42} ${y + 0.42}h0.16v0.16h-0.16Z`;
    }
  });
  return (
    <svg viewBox="-0.5 -0.5 10 10" className="sbi-print" aria-hidden="true" shapeRendering="crispEdges">
      <path d={off} className="sbi-print-grid" />
      <path d={on} className="sbi-print-ink" />
    </svg>
  );
}

/** Two digits that turn over like a counter's. */
function Counter({ value }: { value: number }) {
  const digits = String(value).padStart(2, "0").split("");
  return (
    <span className="sbi-counter" aria-hidden="true">
      {digits.map((d, i) => (
        <span key={i} className="sbi-counter-col">
          <span className="sbi-counter-reel" style={{ ["--d" as string]: Number(d) }}>
            {"0123456789".split("").map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

function Label({ f, n, total, active, still, id, tabId }: { f: Feature; n: number; total: number; active: boolean; still: boolean; id: string; tabId: string }) {
  const name = useScramble(f.name, still, active);
  return (
    <div role="tabpanel" id={id} aria-labelledby={tabId} className="sbi-label" data-on={active || undefined}>
      <span className="sr-only">
        {n} / {total}
      </span>
      <h3 className="sbi-name">
        <span aria-hidden="true">{name}</span>
        <span className="sr-only">{f.name}</span>
      </h3>
      <p className="sbi-text">{f.text}</p>
      {f.aside && !f.aside.elsewhere && (
        <p className="sbi-aside">
          <span className="sbi-aside-lead mono-label">{f.aside.lead.replace(/:$/, "")}</span>
          <span>{f.aside.text.charAt(0).toUpperCase() + f.aside.text.slice(1)}</span>
        </p>
      )}
    </div>
  );
}

function Theirs({ f, active, t }: { f: Feature; active: boolean; t: T }) {
  return (
    <div className="sbi-label sbi-theirs" data-on={active || undefined}>
      <p className="sbi-theirs-status">{theirs(t, f.id)}</p>
      {f.aside?.elsewhere && <p className="sbi-theirs-text">{f.aside.text.charAt(0).toUpperCase() + f.aside.text.slice(1)}</p>}
    </div>
  );
}

/** Their wall: the same ten places, mostly empty, a nail where a work
    would hang; the two they charge extra for hung in grey. */
function TheirWall({ list, t, col, row }: { list: Feature[]; t: T; col: number; row: number }) {
  return (
    <div className="sbi-wall sbi-wall-theirs" style={{ ["--col" as string]: col, ["--row" as string]: row }} aria-hidden="true">
      <span className="sbi-beam" />
      <span className="sbi-light" />
      <div className="sbi-hang">
        {list.map((f) =>
          HUNG_THERE.has(f.id) ? (
            <span key={f.id} className="sbi-work sbi-work-there">
              <span className="sbi-frame">
                <span className="sbi-mat">
                  <Print name={f.id} />
                </span>
              </span>
              <span className="sbi-plate mono-label">{theirs(t, f.id)}</span>
            </span>
          ) : (
            <span key={f.id} className="sbi-work sbi-work-empty">
              <span className="sbi-gap">
                <span className="sbi-nail" />
              </span>
              <span className="sbi-plate mono-label">{theirs(t, f.id)}</span>
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function Key({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="sbi-key" aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  );
}

export function SbsIncluded() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const list = useMemo(() => features(t), [t]);
  const n = list.length;
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  const [wall, inView] = useInView<HTMLDivElement>(0.35);
  const works = useRef<(HTMLButtonElement | null)[]>([]);

  // Less motion asked for: the wall starts paused, and can still be played.
  useEffect(() => {
    if (reduce) setPlaying(false);
  }, [reduce]);
  const running = playing && !held && inView;

  // The time is the active hairline's own fill: when it ends, the light
  // moves on. Pausing holds the fill where it is.
  const next = () => setAt((i) => (i + 1) % n);
  const go = (i: number, focus = false) => {
    setAt(((i % n) + n) % n);
    if (focus) works.current[((i % n) + n) % n]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowDown: COLS, ArrowLeft: -1, ArrowUp: -COLS };
    if (e.key in moves) {
      e.preventDefault();
      go(at + moves[e.key]!, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      go(n - 1, true);
    }
  };

  const col = at % COLS;
  const row = Math.floor(at / COLS);

  return (
    <section aria-labelledby="sbi-title" className="sbi relative bg-paper py-(--section-gap)">
      <div className="shell">
        <div className="sbi-head">
          <SlideIn ready>
            <p className="mono-label text-ash-2">{t("Included in the service", "Incluído no serviço")}</p>
            <h2 id="sbi-title" className="display mt-6 text-balance text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.02]">
              <span className="font-light sm:block">{t("What many charge extra for", "O que muitos cobram à parte,")}</span>{" "}
              <span className="font-medium sm:block">{t("is included here.", "aqui está incluído.")}</span>
            </h2>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.08}>
            <p className="sbi-lede">
              {t(
                "Ten things that are part of the web design service.",
                "Dez coisas que fazem parte do serviço de web design.",
              )}
            </p>
          </SlideIn>
        </div>

        <div
          className="sbi-room"
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          <div className="sbi-walls">
          <figure className="sbi-wall-fig">
            <figcaption className="sbi-wall-cap">
              <span className="sbi-rule" />
              {t("Traditional agencies", "Agências tradicionais")}
            </figcaption>
            <TheirWall list={list} t={t} col={col} row={row} />
          </figure>
          <figure className="sbi-wall-fig">
            <figcaption className="sbi-wall-cap">
              <span className="sbi-rule" />
              nevima
            </figcaption>
          <div ref={wall} className="sbi-wall" style={{ ["--col" as string]: col, ["--row" as string]: row }}>
            <span aria-hidden="true" className="sbi-beam" />
            <span aria-hidden="true" className="sbi-light" />
            <div className="sbi-hang" role="tablist" aria-label={t("What the service includes", "O que o serviço inclui")}>
              {list.map((f, i) => {
                const on = i === at;
                return (
                  <button
                    key={f.id}
                    ref={(el) => {
                      works.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`sbi-tab-${f.id}`}
                    aria-selected={on}
                    aria-controls={`sbi-panel-${f.id}`}
                    aria-label={f.name}
                    tabIndex={on ? 0 : -1}
                    className="sbi-work"
                    data-on={on || undefined}
                    onClick={() => go(i)}
                    onKeyDown={onKey}
                  >
                    <span className="sbi-frame">
                      <span className="sbi-mat">
                        <Print name={f.id} />
                      </span>
                    </span>
                    <span aria-hidden="true" className="sbi-plate mono-label">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          </figure>
          </div>

          <div className="sbi-side">
            <div className="sbi-cartel-head mono-label" aria-hidden="true">
              <span className="sbi-rule" />
              <span>
                {t("No.", "N.º")} <Counter value={at + 1} />
              </span>
              <span className="text-ash-2">/ {String(n).padStart(2, "0")}</span>
            </div>
            <div className="sbi-labels" aria-live={held ? "polite" : "off"}>
              {list.map((f, i) => (
                <Label key={f.id} f={f} n={i + 1} total={n} active={i === at} still={reduce} id={`sbi-panel-${f.id}`} tabId={`sbi-tab-${f.id}`} />
              ))}
            </div>
          </div>

          <div className="sbi-them">
            <div className="sbi-cartel-head mono-label" aria-hidden="true">
              <span className="sbi-rule" />
              <span>{t("Traditional agencies", "Agências tradicionais")}</span>
            </div>
            <div className="sbi-labels" aria-live={held ? "polite" : "off"}>
              {list.map((f, i) => (
                <Theirs key={f.id} f={f} t={t} active={i === at} />
              ))}
            </div>
          </div>

          <div className="sbi-time">
            <div className="sbi-ticks" aria-hidden="true">
              {list.map((f, i) => (
                <span key={f.id} className="sbi-tick" data-past={i < at || undefined} data-now={i === at || undefined} onClick={() => go(i)}>
                  {i === at && (
                    <span
                      key={`${at}`}
                      className="sbi-tick-fill"
                      data-run={running || undefined}
                      style={{ ["--dur" as string]: `${INCLUDED_MS}ms` }}
                      onAnimationEnd={next}
                    />
                  )}
                </span>
              ))}
            </div>
            <div className="sbi-keys">
              <Key label={t("Previous", "Anterior")} onClick={() => go(at - 1)}>
                <svg className="sbi-key-back" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14.5 8h-13M5 4.5 1.5 8 5 11.5" />
                </svg>
              </Key>
              <Key label={playing ? t("Pause", "Pausar") : t("Play", "Reproduzir")} onClick={() => setPlaying((p) => !p)}>
                {playing ? (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 3.5v9M10 3.5v9" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5.5 3.5 12 8l-6.5 4.5z" />
                  </svg>
                )}
              </Key>
              <Key label={t("Next", "Seguinte")} onClick={() => go(at + 1)}>
                <svg className="sbi-key-fwd" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1.5 8h13M11 4.5 14.5 8 11 11.5" />
                </svg>
              </Key>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
