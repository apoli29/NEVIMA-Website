"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { ToneRoom } from "./tone-veil";
import { ProposalAsk } from "./about-faq";
import { Switch, useInView, useScramble, type T } from "./sbs-shared";
import { useSeen } from "./use-seen";
import { useLang, useT } from "@/lib/use-lang";
import type { SeoPrice } from "@/lib/proposal/seo-table";

/* ==================================================================
   SEO & GEO

   The service's own page (user, 2026-11-16), in place of the template
   every other service page is set from. Three sections, each built
   around one thing to watch rather than a block of text:

   1. What SEO is: a results page where three invented businesses, one
      after another, go from page 4 (a page called "Home" on someone
      else's domain) to the top. Then GEO: an AI assistant that, asked
      the same three questions, either sends the person to directories
      or names the business and cites its website. The definitions are
      wall labels; the rest of each is the caption of its demonstration.
   2. Basic SEO, the one-off service and the monthly service, as three
      curves on one chart: twelve months of visibility, with a cursor
      that reads off where the business sits in two searches.
   3. The price, as a calculator: the size of the website gives the
      one-off work and the monthly service, from the same shares the
      free-proposal form uses (PRICING.search).

   The references, found through Inspo: Aspen Search (the Swiss grid,
   and dithered texture standing in for what cannot be read), Linked by
   Air (a fine chart on a dark ground), Linear (the scramble the site
   already uses for names that settle). The business and both screens
   are inventions, and the page says so. Nothing imitates a real search
   engine or a real assistant.

   Decisions in docs/seo-geo-decisions.md.
   ================================================================== */

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------------------------------------------------------- */
/* The three examples, shared by the results page and the assistant  */
/* ---------------------------------------------------------------- */

/* Three invented businesses in three sectors, and three ways of
   searching (user, 2026-11-17): one near the person searching, one in
   a named city, and one with no place at all. Without SEO a business's
   result is what a website made with no thought for search engines
   really shows: a page called "Home", a description that says little,
   and an address on someone else's domain. Without GEO the assistant
   still answers, and still cites its sources (it always does): it just
   does not name the business. */

type Example = {
  key: string;
  label: string;
  query: string;
  name: string;
  bad: { title: string; url: string; desc: string };
  good: { title: string; url: string; desc: string; tags: string[] };
  ask: string;
  without: string;
  withGeo: string;
  elsewhere: [string, string];
};

function examples(t: T): Example[] {
  return [
    {
      key: "nearby",
      label: t("Nearby", "Perto de mim"),
      query: t("dentist near me", "dentista perto de mim"),
      name: "Clínica Dentária Sorriso",
      bad: {
        title: t("Home", "Início"),
        url: "clinica-sorriso.site-gratis.com/inicio",
        desc: t(
          "Welcome. A clinic with years of experience and a team dedicated to every smile.",
          "Bem-vindos. Uma clínica com anos de experiência e uma equipa dedicada a cada sorriso.",
        ),
      },
      good: {
        title: t("Clínica Dentária Sorriso · Dentist in Alvalade, Lisbon", "Clínica Dentária Sorriso · Dentista em Alvalade, Lisboa"),
        url: "clinicasorriso.pt",
        desc: t(
          "Implants, orthodontics and oral hygiene in Alvalade, 300 m from the metro. Online booking and same-day emergencies.",
          "Implantes, ortodontia e higiene oral em Alvalade, a 300 m do metro. Marcação online e urgências no próprio dia.",
        ),
        tags: [t("Title", "Título"), t("Description", "Descrição"), t("Location", "Localização"), t("Hours", "Horário"), t("Reviews 4.8", "Avaliações 4,8")],
      },
      ask: t("I need a dentist near me, in Alvalade. Which would you recommend?", "Preciso de um dentista perto de mim, em Alvalade. Qual recomendas?"),
      without: t(
        "There are several dental clinics in Alvalade. The area’s health directories list the options with the best reviews.",
        "Em Alvalade há várias clínicas dentárias. Os diretórios de saúde da zona listam as opções com melhores avaliações.",
      ),
      withGeo: t(
        "I’d recommend Clínica Dentária Sorriso, in Alvalade, 300 m from the metro. It does implants and orthodontics, has an average rating of 4.8 and takes bookings online, with same-day emergencies.",
        "Recomendo a Clínica Dentária Sorriso, em Alvalade, a 300 m do metro. Faz implantes e ortodontia, tem uma avaliação média de 4,8 e aceita marcações online, com urgências no próprio dia.",
      ),
      elsewhere: [t("Health directory", "Diretório de saúde"), t("Neighbourhood forum", "Fórum do bairro")],
    },
    {
      key: "lisbon",
      label: t("Lisbon", "Lisboa"),
      query: t("real estate agency in Lisbon", "imobiliária em Lisboa"),
      name: "Casa Alfama Imobiliária",
      bad: {
        title: t("Home page", "Página inicial"),
        url: "casa-alfama.site-gratis.com/home",
        desc: t(
          "Buying, selling and renting property. More information by phone.",
          "Compra, venda e arrendamento de imóveis. Mais informações por telefone.",
        ),
      },
      good: {
        title: t("Casa Alfama Imobiliária · Buy and sell a home in Lisbon", "Casa Alfama Imobiliária · Comprar e vender casa em Lisboa"),
        url: "casaalfama.pt",
        desc: t(
          "Flats in Alfama, Graça and Baixa. A free valuation of the property and support all the way to the deed.",
          "Apartamentos em Alfama, Graça e Baixa. Avaliação gratuita do imóvel e acompanhamento até à escritura.",
        ),
        tags: [t("Title", "Título"), t("Description", "Descrição"), t("Areas", "Zonas"), t("Listings", "Imóveis"), t("Reviews 4.9", "Avaliações 4,9")],
      },
      ask: t("Which estate agency would you recommend for selling a flat in Lisbon?", "Que imobiliária recomendas para vender um apartamento em Lisboa?"),
      without: t(
        "To sell in Lisbon, most people go to the large national networks; property portals let you compare several agencies.",
        "Para vender em Lisboa, a escolha habitual são as grandes redes nacionais; os portais imobiliários permitem comparar várias agências.",
      ),
      withGeo: t(
        "I’d recommend Casa Alfama Imobiliária, which specialises in Alfama, Graça and Baixa. It values the property for free and sees the sale through to the deed.",
        "Recomendo a Casa Alfama Imobiliária, especializada em Alfama, Graça e Baixa. Faz a avaliação do imóvel gratuitamente e acompanha a venda até à escritura.",
      ),
      elsewhere: [t("Property portal", "Portal imobiliário"), t("Press article", "Artigo de imprensa")],
    },
    {
      key: "anywhere",
      label: t("No location", "Sem localização"),
      query: t("handmade ceramics", "cerâmica artesanal"),
      name: "Barro & Forno",
      bad: {
        title: t("Shop", "Loja"),
        url: "barroforno.site-gratis.com/loja",
        desc: t("One-of-a-kind handmade pieces, shipped nationwide.", "Peças únicas feitas à mão, com envio para todo o país."),
      },
      good: {
        title: t("Barro & Forno · Portuguese handmade ceramics", "Barro & Forno · Cerâmica artesanal portuguesa, feita à mão"),
        url: "barroforno.pt",
        desc: t(
          "Plates, bowls and jugs in stoneware, glazed by hand in small runs. Shipped in 48 hours, packed without plastic.",
          "Pratos, taças e jarras em grés, vidradas à mão em pequenas séries. Envio em 48 horas, embalagem sem plástico.",
        ),
        tags: [t("Title", "Título"), t("Description", "Descrição"), t("Products", "Produtos"), t("Prices", "Preços"), t("Reviews 4.9", "Avaliações 4,9")],
      },
      ask: t("Where can I buy Portuguese handmade ceramics online?", "Onde comprar cerâmica artesanal portuguesa online?"),
      without: t(
        "There are many handmade ceramics shops; craft marketplaces bring hundreds of makers together and are a good place to start.",
        "Há muitas lojas de cerâmica artesanal; os marketplaces de artesanato reúnem centenas de artesãos e são um bom ponto de partida.",
      ),
      withGeo: t(
        "I’d recommend Barro & Forno: stoneware glazed by hand in small runs, shipped in 48 hours and packed without plastic.",
        "Recomendo a Barro & Forno: grés vidrado à mão em pequenas séries, com envio em 48 horas e embalagem sem plástico.",
      ),
      elsewhere: [t("Craft marketplace", "Marketplace de artesanato"), t("Decor blog", "Blogue de decoração")],
    },
  ];
}

/** The examples' clock: one example after another, each `length(i)`
    long, kept still while it is off the screen, held under the
    pointer, or once the visitor has taken over. Ticks every 50 ms, which
    is as fine as typing and streaming need. */
function useCycle(count: number, length: (i: number) => number, running: boolean) {
  const [state, setState] = useState({ at: 0, ms: 0 });
  const lengthRef = useRef(length);
  lengthRef.current = length;
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(now - last, 200);
      last = now;
      setState((s) => {
        const ms = s.ms + dt;
        return ms >= lengthRef.current(s.at) ? { at: (s.at + 1) % count, ms: 0 } : { at: s.at, ms };
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [running, count]);
  const pick = (at: number) => setState({ at, ms: 0 });
  return { ...state, pick };
}

/** The three examples as keys, each over a hairline that fills with its
    time (the side-by-side gallery's time, sbs-included.tsx). */
function ExampleKeys({
  list,
  at,
  progress,
  onPick,
  dark,
  label,
}: {
  list: Example[];
  at: number;
  progress: number;
  onPick: (i: number) => void;
  dark?: boolean;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={`sg-keys ${dark ? "sg-keys-dark" : ""}`}>
      {list.map((ex, i) => (
        <button
          key={ex.key}
          type="button"
          role="tab"
          aria-selected={i === at}
          className="sg-key"
          onClick={() => onPick(i)}
        >
          <span className="sg-key-line" aria-hidden="true">
            <span className="sg-key-fill" style={{ transform: `scaleX(${i < at ? 1 : i === at ? progress : 0})` }} />
          </span>
          <span className="mono-label sg-key-n">{String(i + 1).padStart(2, "0")}</span>
          <span className="sg-key-label">{ex.label}</span>
        </button>
      ))}
    </div>
  );
}

/** The caption under a demonstration: the part of the definition the
    picture is proving at that moment, swapped with it. */
function LiveCaption({ on, onText, offText, labels, dark }: { on: boolean; onText: string; offText: string; labels: [string, string]; dark?: boolean }) {
  return (
    <div className={`sg-caption ${dark ? "sg-caption-dark" : ""}`} aria-live="polite">
      {[false, true].map((state) => (
        <p key={String(state)} className="sg-caption-line" data-on={state === on || undefined} aria-hidden={state !== on}>
          <span className="mono-label sg-caption-tag">
            <span aria-hidden="true" className="sg-caption-dot" />
            {state ? labels[1] : labels[0]}
          </span>
          <span className="sg-caption-text">{state ? onText : offText}</span>
        </p>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* 1. SEO: the results page                                          */
/* ---------------------------------------------------------------- */

const TYPE_MS = 55;
const SEO_OFF_MS = 2400;
const SEO_ON_MS = 4600;
const seoTypeEnd = (ex: Example) => ex.query.length * TYPE_MS + 450;

function SeoDemo({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const list = useMemo(() => examples(t), [t]);
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  const [held, setHeld] = useState(false);
  const [manual, setManual] = useState<boolean | null>(reduce ? true : null);
  const running = inView && !held && manual === null && !reduce;
  const length = (i: number) => seoTypeEnd(list[i]!) + SEO_OFF_MS + SEO_ON_MS;
  const { at, ms, pick } = useCycle(list.length, length, running);
  const ex = list[at]!;
  const typeEnd = seoTypeEnd(ex);

  const typed = manual !== null ? ex.query : ex.query.slice(0, Math.floor(ms / TYPE_MS));
  const typing = manual === null && ms < typeEnd;
  const on = manual ?? ms >= typeEnd + SEO_OFF_MS;
  const progress = manual !== null ? 1 : Math.min(ms / length(at), 1);

  const shown = on ? ex.good : ex.bad;
  const title = useScramble(shown.title, reduce);
  const url = useScramble(shown.url, reduce);
  const desc = useScramble(shown.desc, reduce);
  const page = on ? 1 : 4;
  const pageShown = useScramble(`${t("Page", "Página")} ${page}`, reduce);

  // Page 4 holds results 31 to 40: the business is the 38th. With SEO it
  // is the first, and the others move down.
  const rows = on ? ["us", "a", "b", "c", "d"] : ["a", "b", "us", "c", "d"];
  const first = on ? 1 : 36;

  return (
    <div ref={ref} onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <ExampleKeys
        dark
        list={list}
        at={at}
        progress={progress}
        label={t("Examples", "Exemplos")}
        onPick={(i) => {
          pick(i);
          setManual((m) => m ?? true);
        }}
      />
      <div className="sg-sheet mt-4">
        <div className="sg-query">
          <svg aria-hidden="true" viewBox="0 0 16 16" className="sg-query-icon">
            <circle cx="6.5" cy="6.5" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <path d="M10 10l4.5 4.5" stroke="currentColor" strokeWidth="1.25" />
          </svg>
          <span className="sg-query-text">
            {typed}
            <span aria-hidden="true" className={`sg-caret ${typing ? "" : "sg-caret-idle"}`} />
          </span>
        </div>

        <div className="sg-results-head mono-label">
          <span>{t("Results", "Resultados")}</span>
          <span className="text-ink">{pageShown}</span>
        </div>

        <ol className="sg-results" aria-label={t("Search results (demonstration)", "Resultados de pesquisa (demonstração)")}>
          {rows.map((id, i) => {
            const rank = first + i;
            if (id === "us") {
              return (
                <motion.li
                  key="us"
                  layout
                  layoutDependency={`${on}-${at}`}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="sg-row sg-row-us"
                  data-on={on || undefined}
                >
                  <span className="sg-rank mono-label">{String(rank).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <p className="sg-url">{url}</p>
                    <p className="sg-title">{title}</p>
                    <p className="sg-desc">{desc}</p>
                    <ul className="sg-tags" aria-label={t("What the engine reads", "O que o motor lê")}>
                      {ex.good.tags.map((tag, k) => (
                        <li key={tag} className="sg-tag mono-label" style={{ transitionDelay: on ? `${0.55 + k * 0.08}s` : "0s" }}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.li>
              );
            }
            return (
              <motion.li key={id} layout layoutDependency={`${on}-${at}`} transition={{ duration: 0.9, ease: EASE }} className="sg-row" aria-hidden="true">
                <span className="sg-rank mono-label">{String(rank).padStart(2, "0")}</span>
                <div className="sg-dither-stack">
                  <span className="sg-dither" style={{ width: `${[38, 30, 44, 34][(i + at) % 4]}%` }} />
                  <span className="sg-dither sg-dither-big" style={{ width: `${[72, 64, 80, 58][(i + at) % 4]}%` }} />
                  <span className="sg-dither" style={{ width: `${[90, 84, 76, 88][(i + at) % 4]}%` }} />
                </div>
              </motion.li>
            );
          })}
        </ol>

        <div className="sg-sheet-foot">
          <div className="sg-pager" style={{ ["--at" as string]: page - 1 }} aria-hidden="true">
            <span className="sg-pager-thumb" />
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="sg-pager-cell mono-label" data-on={n === page || undefined}>
                {n}
              </span>
            ))}
          </div>
          <Switch
            label={t("The business’s website", "O website do negócio")}
            value={on ? "on" : "off"}
            onChange={(id) => setManual(id === "on")}
            options={[
              { id: "off", label: t("Without SEO", "Sem SEO") },
              { id: "on", label: t("With SEO", "Com SEO") },
            ]}
          />
        </div>
      </div>

      <LiveCaption
        dark
        on={on}
        labels={[t("Without SEO", "Sem SEO"), t("With SEO", "Com SEO")]}
        offText={t(
          "With poorly worked SEO, a website is lost in the last pages of results.",
          "Com um SEO mal trabalhado, um website fica perdido nas últimas páginas de resultados.",
        )}
        onText={t(
          "With personalized SEO, it has a much better chance of reaching the first pages.",
          "Com um SEO personalizado, tem muito mais hipóteses de alcançar as primeiras páginas.",
        )}
      />
    </div>
  );
}

function SeoHero({ t }: { t: T }) {
  return (
    <section aria-labelledby="sg-title" data-tone="dark" className="relative text-paper">
      <div className="shell sg-hero" data-tone-body>
        <div className="sg-hero-copy">
          <SlideIn ready>
            <p className="mono-label text-paper/55">{t("SEO & GEO · Additional service", "SEO e GEO · Serviço adicional")}</p>
            <h1 id="sg-title" className="display mt-7 text-[clamp(2.4rem,5.4vw,4.5rem)] leading-[0.98]">
              <span className="block font-light">{t("A search engine only recommends", "O motor de busca só recomenda")}</span>
              <span className="block font-medium">{t("websites that speak its language.", "websites que comuniquem na sua língua.")}</span>
            </h1>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.08}>
            <dl className="sg-def sg-def-dark">
              <dt>
                <span className="sg-def-term">SEO</span>
                <span className="mono-label">Search Engine Optimization</span>
              </dt>
              <dd>
                {t(
                  "A set of practices that put a website in the best possible positions in the searches made by its target audiences.",
                  "Um conjunto de práticas que colocam um website nas melhores posições possíveis das pesquisas efetuadas pelos públicos-alvo.",
                )}
              </dd>
            </dl>
          </SlideIn>
        </div>
        <div className="sg-hero-stage">
          <SeoDemo t={t} />
          <p className="mono-label mt-5 text-paper/40">
            {t("The businesses are invented; the results page is a demonstration.", "Os negócios são inventados; a página de resultados é uma demonstração.")}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 1b. GEO: the assistant                                            */
/* ---------------------------------------------------------------- */

const ASK_MS = 700;
const WORD_MS = 65;
const GEO_HOLD_OFF = 2600;
const GEO_HOLD_ON = 4800;
const words = (s: string) => s.split(" ");
const geoOffEnd = (ex: Example) => ASK_MS + words(ex.without).length * WORD_MS + GEO_HOLD_OFF;
const geoLength = (ex: Example) => geoOffEnd(ex) + words(ex.withGeo).length * WORD_MS + GEO_HOLD_ON;

function Assistant({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const list = useMemo(() => examples(t), [t]);
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [held, setHeld] = useState(false);
  const [manual, setManual] = useState<boolean | null>(reduce ? true : null);
  const running = inView && !held && manual === null && !reduce;
  const { at, ms, pick } = useCycle(list.length, (i) => geoLength(list[i]!), running);
  const ex = list[at]!;
  const offEnd = geoOffEnd(ex);

  const on = manual ?? ms >= offEnd;
  const answer = on ? ex.withGeo : ex.without;
  const all = words(answer);
  const since = manual !== null ? Infinity : on ? ms - offEnd : ms - ASK_MS;
  const count = Math.max(0, Math.min(all.length, Math.floor(since / WORD_MS)));
  const done = count >= all.length;
  const asked = manual !== null || ms >= 120;
  const progress = manual !== null ? 1 : Math.min(ms / geoLength(ex), 1);
  const nameWords = new Set(ex.name.split(" ").filter((w) => w.length > 1 && w !== "&"));

  return (
    <div ref={ref} onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <ExampleKeys
        list={list}
        at={at}
        progress={progress}
        label={t("Examples", "Exemplos")}
        onPick={(i) => {
          pick(i);
          setManual((m) => m ?? true);
        }}
      />
      <div className="sg-ai mt-4">
        <div className="sg-ai-top">
          <span className="mono-label text-paper/55">{t("AI assistant", "Assistente de IA")}</span>
          <Switch
            dark
            label={t("The business’s website", "O website do negócio")}
            value={on ? "on" : "off"}
            onChange={(id) => setManual(id === "on")}
            options={[
              { id: "off", label: t("Without GEO", "Sem GEO") },
              { id: "on", label: t("With GEO", "Com GEO") },
            ]}
          />
        </div>

        <div className="sg-ai-body">
          <p key={ex.key} className="sg-ai-ask" data-on={asked || undefined}>
            {ex.ask}
          </p>
          <div className="sg-ai-answer">
            <span aria-hidden="true" className="sg-ai-mark" data-busy={(!done && manual === null) || undefined} />
            <p aria-live="polite">
              {all.slice(0, count).map((w, i) => (
                <span key={`${ex.key}-${on}-${i}`} className={`sg-word ${on && nameWords.has(w.replace(/[.,:]/g, "")) ? "font-medium text-paper" : ""}`}>
                  {w}{" "}
                </span>
              ))}
            </p>
          </div>
          <div className="sg-ai-sources mono-label" data-on={done || undefined}>
            <span className="text-paper/45">{t("Sources", "Fontes")}</span>
            {(on ? [ex.good.url] : ex.elsewhere).map((src) => (
              <span key={src} className="sg-source" data-own={on || undefined}>
                <span aria-hidden="true" className="sg-source-dot" />
                {src}
              </span>
            ))}
          </div>
        </div>
      </div>

      <LiveCaption
        on={on}
        labels={[t("Without GEO", "Sem GEO"), t("With GEO", "Com GEO")]}
        offText={t(
          "More and more of us turn to Artificial Intelligence for suggestions and recommendations.",
          "Todos nós usamos cada vez mais a Inteligência Artificial para obter sugestões e recomendações.",
        )}
        onText={t(
          "These practices raise the chances of AI tools recommending a business to their users.",
          "Estas práticas aumentam a probabilidade de as ferramentas de IA recomendarem um negócio aos seus utilizadores.",
        )}
      />
    </div>
  );
}

function GeoSection({ t }: { t: T }) {
  return (
    <section aria-labelledby="sg-geo" data-tone="light" className="sg-geo relative">
      <div className="shell sg-geo-grid" data-tone-body>
        <div>
          <SlideIn ready>
            <p className="mono-label text-ash-2">GEO · Generative Engine Optimization</p>
            <h2 id="sg-geo" className="display mt-6 text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02]">
              <span className="block font-light">{t("And now, with Artificial Intelligence,", "E agora, com a Inteligência Artificial,")}</span>
              <span className="block font-medium">{t("the reasoning is the same.", "o raciocínio é o mesmo.")}</span>
            </h2>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.08}>
            <p className="sg-geo-claim mt-8">
              {t(
                "AI only recommends businesses that make a point of making sure AI understands them.",
                "A IA só recomenda negócios quando eles próprios fazem questão de garantir que a IA os percebe.",
              )}
            </p>
            <dl className="sg-def">
              <dt>
                <span className="sg-def-term">GEO</span>
                <span className="mono-label">Generative Engine Optimization</span>
              </dt>
              <dd>
                {t(
                  "A different set of practices with a similar purpose, aimed at Artificial Intelligence instead.",
                  "Um conjunto de práticas diferentes, com um propósito semelhante, mas direcionado para a Inteligência Artificial.",
                )}
              </dd>
            </dl>
          </SlideIn>
        </div>
        <div>
          <Assistant t={t} />
          <p className="mono-label mt-5 text-ash-2">
            {t("A demonstration: the businesses and the assistant are invented.", "Uma demonstração: os negócios e o assistente são inventados.")}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 2. Three levels, three curves                                     */
/* ---------------------------------------------------------------- */

type Level = "basic" | "once" | "monthly";

/** Visibility in a related search, 0 to 1, month m after launch. Illustrative. */
const CURVES: Record<Level, (m: number) => number> = {
  basic: (m) => 0.05 + 0.17 * (1 - Math.exp(-m * 2.2)),
  once: (m) => {
    const rise = 0.05 + 0.67 * (1 - Math.exp(-m * 1.4));
    return m <= 2 ? rise : rise - 0.34 * (1 - Math.exp(-(m - 2) / 4.2));
  },
  monthly: (m) => {
    const rise = 0.05 + 0.67 * (1 - Math.exp(-m * 1.4));
    return m <= 2 ? rise : rise + 0.2 * (1 - Math.exp(-(m - 2) / 3.6));
  },
};

/** Where that visibility puts the business in the related search. */
const rankAt = (v: number) => Math.max(1, Math.round(1 + Math.pow(1 - v, 1.6) * 45));

/** The chart's frame: wide on a desktop, taller on a phone so its
    lines and labels keep a readable size. */
function geometry(narrow: boolean) {
  const W = narrow ? 520 : 1000;
  const H = narrow ? 440 : 420;
  const PAD = narrow ? { l: 4, r: 86, t: 20, b: 40 } : { l: 8, r: 118, t: 24, b: 40 };
  const xOf = (m: number) => PAD.l + (m / 12) * (W - PAD.l - PAD.r);
  const yOf = (v: number) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);
  const pathOf = (level: Level) => {
    let d = "";
    for (let i = 0; i <= 96; i++) {
      const m = (i / 96) * 12;
      d += `${i ? "L" : "M"}${xOf(m).toFixed(1)},${yOf(CURVES[level](m)).toFixed(1)}`;
    }
    return d;
  };
  return { W, H, PAD, xOf, yOf, paths: { basic: pathOf("basic"), once: pathOf("once"), monthly: pathOf("monthly") } };
}

/** The visibility at which page p of the related search ends. */
const bandAt = (p: number) => 1 - Math.pow((p * 10 - 1) / 45, 1 / 1.6);

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 639.98px)");
    const on = () => setNarrow(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return narrow;
}

function Levels({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref, { threshold: 0.12 });
  const [level, setLevel] = useState<Level>("basic");
  const [month, setMonth] = useState(12);
  const narrow = useNarrow();
  const { W, H, PAD, xOf, yOf, paths } = useMemo(() => geometry(narrow), [narrow]);

  const info: Record<Level, { name: string; when: string; body: string }> = {
    basic: {
      name: t("Basic SEO practices", "Práticas básicas de SEO"),
      when: t("Included in every website", "Incluídas em todos os websites"),
      body: t(
        "They make sure the website comes up at the top of very specific searches that lead to the business, such as its own name, and on later pages of related searches, such as “dentists in Lisbon”.",
        "Garantem que o website aparece no topo das pesquisas muito específicas que remetem para o negócio, como o nome do próprio negócio, e em páginas mais distantes nas pesquisas relacionadas, como “dentistas em Lisboa”.",
      ),
    },
    once: {
      name: t("One-off SEO service", "Serviço único de SEO"),
      when: t("Applied before launch", "Aplicado antes do lançamento"),
      body: t(
        "Good for a short-term boost: the impact is almost immediate once the practices are applied. Search engines, however, need constant updates, because searches and the way people behave keep changing, and SEO has to adjust to them.",
        "Bom para dar um impulso a curto prazo: o impacto é quase imediato quando as práticas são aplicadas. No entanto, os motores de busca precisam de atualizações constantes, porque as pesquisas e os comportamentos dos utilizadores vão mudando, e o SEO deve ajustar-se a eles.",
      ),
    },
    monthly: {
      name: t("Monthly SEO maintenance", "Manutenção mensal de SEO"),
      when: t("Optional, after the one-off service", "Opcional, depois do serviço único"),
      body: t(
        "Every month, we follow the changes in searches and in how people behave, and adjust the website’s SEO and GEO to keep the results of the one-off work and make them grow.",
        "Todos os meses, acompanhamos as mudanças nas pesquisas e no comportamento dos utilizadores e ajustamos o SEO e o GEO do website, para manter e fazer crescer os resultados do trabalho pontual.",
      ),
    },
  };

  const v = CURVES[level](month);
  const rank = rankAt(v);
  const pageNo = Math.ceil(rank / 10);
  const related =
    rank <= 10
      ? t(`No. ${rank} · page 1`, `${rank}.º lugar · página 1`)
      : t(`Page ${pageNo}`, `Página ${pageNo}`);
  const relatedShown = useScramble(related, reduce);
  const monthLabel = month < 0.5 ? t("Launch", "Lançamento") : t(`Month ${Math.round(month)}`, `Mês ${Math.round(month)}`);

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W;
    setMonth(Math.min(12, Math.max(0, ((x - PAD.l) / (W - PAD.l - PAD.r)) * 12)));
  };

  const order: Level[] = ["basic", "once", "monthly"];

  return (
    <section aria-labelledby="sg-levels" data-tone="light" className="relative">
      <div className="shell sg-levels" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("The impact of each level", "O impacto de cada nível")}</p>
          <h2 id="sg-levels" className="display mt-6 text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02]">
            <span className="block font-light">{t("Basic, one-off or monthly:", "Básico, único ou mensal:")}</span>
            <span className="block font-medium">{t("twelve months of each.", "doze meses de cada um.")}</span>
          </h2>
        </SlideIn>

        <div ref={ref} className="sg-levels-grid">
          <div className="sg-levels-side">
            <Switch
              label={t("Level of SEO", "Nível de SEO")}
              value={level}
              onChange={(id) => setLevel(id as Level)}
              options={[
                { id: "basic", label: t("Basic", "Básico") },
                { id: "once", label: t("One-off", "Único") },
                { id: "monthly", label: t("Monthly", "Mensal") },
              ]}
            />
            <motion.div key={level} initial={reduce ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mt-9">
              <p className="mono-label text-ash-2">{info[level].when}</p>
              <h3 className="display mt-3 text-[1.625rem] font-medium leading-[1.1]">{info[level].name}</h3>
              <p className="mt-4 max-w-[44ch] text-[1rem] leading-[1.6] text-ash">{info[level].body}</p>
            </motion.div>

            <dl className="sg-readout">
              <div className="sg-readout-row">
                <dt>
                  <span className="mono-label text-ash-2">{t("Search by name", "Pesquisa pelo nome")}</span>
                  <span className="sg-readout-q">“Clínica Dentária Sorriso”</span>
                </dt>
                <dd className="mono-label">{t("No. 1", "1.º lugar")}</dd>
              </div>
              <div className="sg-readout-row">
                <dt>
                  <span className="mono-label text-ash-2">{t("Related search", "Pesquisa relacionada")}</span>
                  <span className="sg-readout-q">{t("“dentists in Lisbon”", "“dentistas em Lisboa”")}</span>
                </dt>
                <dd className="mono-label" data-top={rank <= 10 || undefined}>
                  {relatedShown}
                </dd>
              </div>
            </dl>
          </div>

          <figure className="sg-chart sg-card-dark">
            <div aria-hidden="true" className="sg-card-grain" />
            <div className="sg-chart-top mono-label">
              <span className="text-paper/55">{t("Visibility in related searches", "Visibilidade nas pesquisas relacionadas")}</span>
              <span className="text-paper/40">{t("Illustrative", "Ilustrativo")}</span>
            </div>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="sg-chart-svg"
              role="img"
              aria-label={t(
                "Illustrative chart: basic SEO stays low, the one-off service rises fast and then fades, the monthly service rises and keeps climbing.",
                "Gráfico ilustrativo: o SEO básico mantém-se baixo, o serviço único sobe depressa e depois desce, o serviço mensal sobe e continua a crescer.",
              )}
              onPointerMove={onMove}
              onPointerDown={onMove}
            >
              <defs>
                <linearGradient id="sg-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* The pages of the related search: page 1 shaded, and
                  where page 2 ends. */}
              <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={yOf(bandAt(1)) - PAD.t} className="sg-page1" />
              <line x1={PAD.l} x2={W - PAD.r} y1={yOf(bandAt(1))} y2={yOf(bandAt(1))} className="sg-band" />
              <line x1={PAD.l} x2={W - PAD.r} y1={yOf(bandAt(2))} y2={yOf(bandAt(2))} className="sg-band" />
              {[
                { v: 1, label: t("Page 1", "Página 1") },
                { v: bandAt(1), label: t("Page 2", "Página 2") },
                { v: bandAt(2), label: t("Page 3 onwards", "Página 3 em diante") },
              ].map((band) => (
                <text key={band.label} x={xOf(6.2)} y={yOf(band.v) + 18} className="sg-axis">
                  {band.label}
                </text>
              ))}
              {[0, 3, 6, 9, 12].map((m) => (
                <text key={m} x={xOf(m)} y={H - 12} textAnchor={m === 0 ? "start" : m === 12 ? "end" : "middle"} className="sg-axis">
                  {m === 0 ? t("Launch", "Lançamento") : t(`M${m}`, `M${m}`)}
                </text>
              ))}
              <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} className="sg-base" />

              <motion.path
                key={`fill-${level}`}
                d={`${paths[level]}L${xOf(12)},${H - PAD.b}L${xOf(0)},${H - PAD.b}Z`}
                fill="url(#sg-fill)"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: seen ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
              {order.map((l) => (
                <motion.path
                  key={l}
                  d={paths[l]}
                  fill="none"
                  className="sg-curve"
                  data-on={l === level || undefined}
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: seen ? 1 : 0 }}
                  transition={{ duration: 1.6, ease: EASE, delay: order.indexOf(l) * 0.12 }}
                />
              ))}
              {order.map((l) => (
                <text key={`label-${l}`} x={xOf(12) + 12} y={yOf(CURVES[l](12)) + 4} className="sg-curve-label" data-on={l === level || undefined}>
                  {l === "basic" ? t("Basic", "Básico") : l === "once" ? t("One-off", "Único") : t("Monthly", "Mensal")}
                </text>
              ))}

              <g style={{ opacity: seen ? 1 : 0, transition: "opacity .6s ease .9s" }}>
                <line x1={xOf(month)} x2={xOf(month)} y1={PAD.t} y2={H - PAD.b} className="sg-cursor" />
                <rect x={xOf(month) - 5} y={yOf(v) - 5} width="10" height="10" className="sg-dot" />
              </g>
            </svg>
            <figcaption className="sg-chart-foot mono-label">
              <span className="text-paper">{monthLabel}</span>
              <span className="text-paper/40">{t("Move along the chart to read each month", "Percorrer o gráfico para ler cada mês")}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 3. The price                                                      */
/* ---------------------------------------------------------------- */

/** The calculator with the figures, taken off the page on 2026-11-19
    (user: the price should not show at once). Kept whole, out of use;
    putting it back is one line in SeoGeo below. */
export function PriceCalculator({ t, table }: { t: T; table: SeoPrice[] }) {
  const lang = useLang();
  const reduce = useReducedMotion() ?? false;
  const [at, setAt] = useState(Math.max(0, table.findIndex((row) => row.pages === 8)));
  const { pages, once, monthly } = table[at]!;
  const money = (r: [number, number]) =>
    lang === "pt" ? `${r[0]}–${r[1]} €` : `€${r[0]}–€${r[1]}`;
  const onceShown = useScramble(money(once), reduce);
  const monthShown = useScramble(money(monthly), reduce);
  const size = pages === 1 ? t("A landing page", "Uma landing page") : t(`${pages} pages`, `${pages} páginas`);
  const sizeShown = useScramble(size, reduce);

  return (
    <section aria-labelledby="sg-price" data-tone="light" className="sg-price relative">
      <div className="shell" data-tone-body>
       <div className="sg-price-card sg-card-dark">
        <div aria-hidden="true" className="sg-card-grain" />
        <div className="sg-price-grid">
        <div className="sg-price-copy">
          <SlideIn ready>
            <p className="mono-label text-paper/55">{t("Price", "Preço")}</p>
            <h2 id="sg-price" className="display mt-6 text-paper text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02]">
              <span className="block font-light">{t("What it costs,", "Quanto custa,")}</span>
              <span className="block font-medium">{t("measured by the website.", "à medida do website.")}</span>
            </h2>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.08}>
            <p className="sg-lede mt-8 text-paper/70">
              {t(
                "Basic SEO comes with every website. The one-off work is worked out from the website’s price, and the monthly service from the one-off work.",
                "O SEO básico vem com todos os websites. O trabalho pontual é calculado a partir do valor do website, e o serviço mensal a partir do trabalho pontual.",
              )}
            </p>
          </SlideIn>
        </div>

        <div className="sg-calc">
          <div className="sg-calc-size">
            <label htmlFor="sg-size" className="mono-label text-ash-2">
              {t("Size of the website", "Tamanho do website")}
            </label>
            <p className="display sg-calc-size-value" aria-hidden="true">
              {sizeShown}
            </p>
            <input
              id="sg-size"
              type="range"
              min={0}
              max={table.length - 1}
              step={1}
              value={at}
              onChange={(e) => setAt(Number(e.target.value))}
              aria-valuetext={size}
              className="sg-range"
              style={{ ["--p" as string]: at / (table.length - 1) }}
            />
            <div className="sg-range-ticks mono-label" aria-hidden="true">
              {table.map((row, i) => (
                <span key={row.pages} data-on={i === at || undefined}>
                  {row.pages === 1 ? "L" : row.pages}
                </span>
              ))}
            </div>
          </div>

          <dl className="sg-ledger">
            <div className="sg-ledger-row">
              <dt>
                <span className="sg-ledger-name">{t("Basic SEO", "SEO básico")}</span>
                <span className="mono-label text-ash-2">{t("In every website", "Em todos os websites")}</span>
              </dt>
              <dd className="sg-ledger-fig">{t("Included", "Incluído")}</dd>
            </div>
            <div className="sg-ledger-row">
              <dt>
                <span className="sg-ledger-name">{t("SEO & GEO, one-off", "SEO e GEO, serviço único")}</span>
                <span className="mono-label text-ash-2">{t("Before launch", "Antes do lançamento")}</span>
              </dt>
              <dd className="sg-ledger-fig" aria-live="polite">
                {onceShown}
              </dd>
            </div>
            <div className="sg-ledger-row">
              <dt>
                <span className="sg-ledger-name">{t("Monthly maintenance", "Manutenção mensal")}</span>
                <span className="mono-label text-ash-2">{t("Optional", "Opcional")}</span>
              </dt>
              <dd className="sg-ledger-fig">
                {monthShown}
                <span className="sg-ledger-per">{t("/mo", "/mês")}</span>
              </dd>
            </div>
          </dl>

          <div className="sg-calc-foot">
            <p className="max-w-[40ch] text-[0.875rem] leading-[1.55] text-ash">
              {t(
                "An estimate for Portugal, with the Essential+ design. The final figure is set in the free proposal.",
                "Estimativa para Portugal, com o design Essencial+. O valor final fica definido na proposta gratuita.",
              )}
            </p>
            <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
          </div>
        </div>
      </div>
        </div>
       </div>
    </section>
  );
}

/** The price section without figures (user, 2026-11-19): what each
    level includes and how it is priced, the figures left for the free
    proposal. Same card and ledger as the calculator it replaces. */
function Price({ t }: { t: T }) {
  const rows = [
    {
      id: "basic",
      name: t("Basic SEO", "SEO básico"),
      when: t("In every website", "Em todos os websites"),
      body: t(
        "The website comes up at the top of searches for the business’s own name.",
        "O website aparece no topo das pesquisas pelo nome do próprio negócio.",
      ),
      fig: t("Included", "Incluído"),
    },
    {
      id: "once",
      name: t("SEO & GEO, one-off", "SEO e GEO, serviço único"),
      when: t("Before launch", "Antes do lançamento"),
      body: t(
        "A short-term boost, almost immediate once the practices are applied.",
        "Um impulso a curto prazo, quase imediato quando as práticas são aplicadas.",
      ),
      fig: t("In the proposal", "Na proposta"),
    },
    {
      id: "monthly",
      name: t("Monthly maintenance", "Manutenção mensal"),
      when: t("Optional", "Opcional"),
      body: t(
        "Every month, the changes in searches are followed, to keep the results and make them grow.",
        "Todos os meses, as mudanças nas pesquisas são acompanhadas, para manter e fazer crescer os resultados.",
      ),
      fig: t("In the proposal", "Na proposta"),
    },
  ];

  return (
    <section aria-labelledby="sg-price" data-tone="light" className="sg-price relative">
      <div className="shell" data-tone-body>
        <div className="sg-price-card sg-card-dark">
          <div aria-hidden="true" className="sg-card-grain" />
          <div className="sg-price-grid">
            <div className="sg-price-copy">
              <SlideIn ready>
                <p className="mono-label text-paper/55">{t("Price", "Preço")}</p>
                <h2 id="sg-price" className="display mt-6 text-paper text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02]">
                  <span className="block font-light">{t("What it costs,", "Quanto custa,")}</span>
                  <span className="block font-medium">{t("measured by the website.", "à medida do website.")}</span>
                </h2>
              </SlideIn>
              <SlideIn ready distance={0} delay={0.08}>
                <p className="sg-lede mt-8 text-paper/70">
                  {t(
                    "Basic SEO comes with every website. The one-off work is worked out from the website’s price, and the monthly service from the one-off work.",
                    "O SEO básico vem com todos os websites. O trabalho pontual é calculado a partir do valor do website, e o serviço mensal a partir do trabalho pontual.",
                  )}
                </p>
              </SlideIn>
            </div>

            <div className="sg-calc">
              <p className="mono-label text-ash-2">{t("What each level includes", "O que inclui cada nível")}</p>
              <dl className="sg-ledger sg-ledger-plain">
                {rows.map((row) => (
                  <div key={row.id} className="sg-ledger-row">
                    <dt>
                      <span className="sg-ledger-name">{row.name}</span>
                      <span className="mono-label text-ash-2">{row.when}</span>
                      <span className="sg-ledger-says">{row.body}</span>
                    </dt>
                    <dd className="sg-ledger-tag mono-label" data-in={row.id === "basic" || undefined}>
                      {row.fig}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="sg-calc-foot">
                <p className="max-w-[40ch] text-[0.875rem] leading-[1.55] text-ash">
                  {t(
                    "The figures are set in the free proposal, from the size of the website.",
                    "Os valores ficam definidos na proposta gratuita, a partir do tamanho do website.",
                  )}
                </p>
                <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The page's three sections, between the bar and Let's work together. */
export function SeoGeo({ prices: _prices }: { prices: SeoPrice[] }) {
  const t = useT();
  // Between the sections, the tonal veil (tone-veil.tsx).
  return (
    <ToneRoom>
      <SeoHero t={t} />
      <GeoSection t={t} />
      <Levels t={t} />
      {/* The figures went to the proposal (2026-11-19); the calculator
          is <PriceCalculator t={t} table={_prices} />, kept above. */}
      <Price t={t} />
    </ToneRoom>
  );
}
