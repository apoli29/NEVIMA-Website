"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { ProposalAsk } from "./about-faq";
import { Switch, useScramble, type T } from "./sbs-shared";
import { useSeen } from "./use-seen";
import { useLang, useT } from "@/lib/use-lang";
import type { SeoPrice } from "@/lib/proposal/seo-table";

/* ==================================================================
   SEO & GEO

   The service's own page (user, 2026-11-16), in place of the template
   every other service page is set from. Three sections, each built
   around one thing to watch rather than a block of text:

   1. What SEO is: a results page where a business's result starts as
      noise on page 4 and, once it speaks the engine's language, is
      decoded and climbs to the top. Then GEO: an AI assistant that,
      asked the same question, either cannot name anyone or names the
      business and cites its website.
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

/** A line of noise as long as a text, the same on server and client. */
function noise(text: string, seed = 7) {
  const glyphs = "abcdefghijklmnopqrstuvwxyz0123456789*#%&+";
  let s = seed;
  let out = "";
  for (const c of text) {
    s = (s * 9301 + 49297) % 233280;
    out += /[\p{L}\p{N}]/u.test(c) ? glyphs[Math.floor((s / 233280) * glyphs.length)] : c;
  }
  return out;
}

/** Types a line out once `go` is set; all at once for less motion. */
function useTyped(text: string, go: boolean, reduce: boolean, step = 55) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go) return;
    if (reduce) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, step);
    return () => window.clearInterval(id);
  }, [text, go, reduce, step]);
  return text.slice(0, n);
}

/* ---------------------------------------------------------------- */
/* 1. SEO: the results page                                          */
/* ---------------------------------------------------------------- */

function SearchMachine({ t, on, setOn }: { t: T; on: boolean; setOn: (on: boolean) => void }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref, { threshold: 0.2 });
  const query = t("aesthetic clinic in Vila Nova de Gaia", "clínica de estética em Vila Nova de Gaia");
  const typed = useTyped(query, seen, reduce);
  const typedDone = typed.length === query.length;

  const title = t("Clínica Aurora · Aesthetics in Vila Nova de Gaia", "Clínica Aurora · Estética em Vila Nova de Gaia");
  const url = "clinicaaurora.pt";
  const desc = t(
    "Face and body treatments in the centre of Gaia. Book online, open Monday to Saturday.",
    "Tratamentos de rosto e corpo no centro de Gaia. Marcação online, de segunda a sábado.",
  );
  const shownTitle = useScramble(on ? title : noise(title, 3), reduce);
  const shownUrl = useScramble(on ? url : noise(url, 11), reduce);
  const shownDesc = useScramble(on ? desc : noise(desc, 5), reduce);

  // The first time the screen is seen, the query is typed and the
  // business is shown without SEO for a moment, then with it.
  const played = useRef(false);
  useEffect(() => {
    if (!typedDone || played.current) return;
    played.current = true;
    if (reduce) return;
    const id = window.setTimeout(() => setOn(true), 1300);
    return () => window.clearTimeout(id);
  }, [typedDone, reduce, setOn]);

  const tags = [
    t("Title", "Título"),
    t("Description", "Descrição"),
    t("Address", "Morada"),
    t("Opening hours", "Horário"),
    t("Reviews 4.9", "Avaliações 4,9"),
  ];

  // Six rows on both sides, so the sheet keeps its height: four other
  // results, the gap to a later page, and the business.
  const rows = on ? ["us", "a", "b", "c", "d", "gap"] : ["a", "b", "c", "d", "gap", "us"];
  const page = on ? 1 : 4;
  const whereShown = useScramble(`Clínica Aurora · ${t("page", "página")} ${page}`, reduce);

  return (
    <div ref={ref} className="sg-sheet">
      <div className="sg-query">
        <svg aria-hidden="true" viewBox="0 0 16 16" className="sg-query-icon">
          <circle cx="6.5" cy="6.5" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path d="M10 10l4.5 4.5" stroke="currentColor" strokeWidth="1.25" />
        </svg>
        <span className="sg-query-text">
          {typed}
          <span aria-hidden="true" className={`sg-caret ${typedDone ? "sg-caret-idle" : ""}`} />
        </span>
      </div>

      <div className="sg-results-head mono-label">
        <span>{t("Results · page 1", "Resultados · página 1")}</span>
        <span className={on ? "text-ink" : undefined}>{whereShown}</span>
      </div>

      <ol className="sg-results" aria-label={t("Search results (demonstration)", "Resultados de pesquisa (demonstração)")}>
        {rows.map((id, i) => {
          if (id === "gap") {
            return (
              <motion.li key="gap" layout layoutDependency={on} transition={{ duration: 0.9, ease: EASE }} className="sg-gap mono-label" aria-hidden="true">
                <span className="sg-gap-dots" />
                <span>{on ? t("Page 2", "Página 2") : t("Pages 2 to 4", "Páginas 2 a 4")}</span>
              </motion.li>
            );
          }
          const rank = id === "us" ? (on ? 1 : 37) : i + 1;
          if (id === "us") {
            return (
              <motion.li
                key="us"
                layout
                layoutDependency={on}
                transition={{ duration: 0.9, ease: EASE }}
                className="sg-row sg-row-us"
                data-on={on || undefined}
              >
                <span className="sg-rank mono-label">{String(rank).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <p className="sg-url mono-label">{shownUrl}</p>
                  <p className="sg-title">{shownTitle}</p>
                  <p className="sg-desc">{shownDesc}</p>
                  <ul className="sg-tags" aria-label={t("What the engine reads", "O que o motor lê")}>
                    {tags.map((tag, k) => (
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
            <motion.li key={id} layout layoutDependency={on} transition={{ duration: 0.9, ease: EASE }} className="sg-row" aria-hidden="true">
              <span className="sg-rank mono-label">{String(rank).padStart(2, "0")}</span>
              <div className="sg-dither-stack">
                <span className="sg-dither" style={{ width: `${[38, 30, 44, 34][i % 4]}%` }} />
                <span className="sg-dither sg-dither-big" style={{ width: `${[72, 64, 80, 58][i % 4]}%` }} />
                <span className="sg-dither" style={{ width: `${[90, 84, 76, 88][i % 4]}%` }} />
              </div>
            </motion.li>
          );
        })}
      </ol>

      <div className="sg-pager" style={{ ["--at" as string]: page - 1 }} aria-hidden="true">
        <span className="sg-pager-thumb" />
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="sg-pager-cell mono-label" data-on={n === page || undefined}>
            {n}
          </span>
        ))}
      </div>

      <div className="sg-sheet-switch">
        <Switch
          label={t("The business’s website", "O website do negócio")}
          value={on ? "on" : "off"}
          onChange={(id) => setOn(id === "on")}
          options={[
            { id: "off", label: t("Without SEO", "Sem SEO") },
            { id: "on", label: t("With SEO", "Com SEO") },
          ]}
        />
      </div>
    </div>
  );
}

function SeoHero({ t }: { t: T }) {
  const [on, setOn] = useState(false);
  return (
    <section aria-labelledby="sg-title" data-tone="dark" className="relative text-paper">
      <div className="shell sg-hero">
        <div className="sg-hero-copy">
          <SlideIn ready>
            <p className="mono-label text-paper/55">{t("SEO & GEO · Additional service", "SEO e GEO · Serviço adicional")}</p>
            <h1 id="sg-title" className="display mt-7 text-[clamp(2.4rem,5.4vw,4.5rem)] leading-[0.98]">
              <span className="block font-light">{t("A search engine only recommends", "O motor de busca só recomenda")}</span>
              <span className="block font-medium">{t("websites that speak its language.", "websites que comuniquem na sua língua.")}</span>
            </h1>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.08}>
            <p className="sg-lede mt-8 text-paper/70">
              {t(
                "SEO (Search Engine Optimization) is a set of practices that put a website in the best possible positions in the searches made by its target audiences. With poorly worked SEO, a website is lost in the last pages of results; with personalized SEO, it has a much better chance of reaching the first pages.",
                "O SEO (Search Engine Optimization) consiste num conjunto de práticas que colocam um website nas melhores posições possíveis das pesquisas efetuadas pelos públicos-alvo. Com um SEO mal trabalhado, um website fica perdido nas últimas páginas de resultados; com um SEO personalizado, tem muito mais hipóteses de alcançar as primeiras páginas.",
              )}
            </p>
          </SlideIn>
        </div>
        <div className="sg-hero-stage">
          <SearchMachine t={t} on={on} setOn={setOn} />
          <p className="mono-label mt-4 text-paper/45">
            {t("The clinic is invented; the results page is a demonstration.", "A clínica é inventada; a página de resultados é uma demonstração.")}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 1b. GEO: the assistant                                            */
/* ---------------------------------------------------------------- */

function useStreamed(text: string, key: string, go: boolean, reduce: boolean) {
  const words = useMemo(() => text.split(" "), [text]);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go) return;
    if (reduce) {
      setN(words.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= words.length) window.clearInterval(id);
    }, 70);
    return () => window.clearInterval(id);
    // key restarts the stream when the answer changes
  }, [words, key, go, reduce]);
  return { shown: words.slice(0, n), done: n >= words.length };
}

function Assistant({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref, { threshold: 0.3 });
  const [on, setOn] = useState(reduce);
  const touched = useRef(false);

  const ask = t("Which aesthetic clinic would you recommend in Vila Nova de Gaia?", "Que clínica de estética recomendas em Vila Nova de Gaia?");
  const without = t(
    "There are several aesthetic clinics in Vila Nova de Gaia. I don’t have enough reliable information to recommend a specific one.",
    "Há várias clínicas de estética em Vila Nova de Gaia. Não tenho informação fiável suficiente para recomendar uma em concreto.",
  );
  const withGeo = t(
    "I’d recommend Clínica Aurora, in the centre of Vila Nova de Gaia. It specialises in face and body treatments, has an average rating of 4.9 and takes bookings online.",
    "Recomendo a Clínica Aurora, no centro de Vila Nova de Gaia. É especializada em tratamentos de rosto e corpo, tem uma avaliação média de 4,9 e aceita marcações online.",
  );
  const answer = on ? withGeo : without;
  const { shown, done } = useStreamed(answer, on ? "on" : "off", seen, reduce);

  // Seen for the first time: the answer without GEO, then the same
  // question once the business has made sure the AI understands it.
  useEffect(() => {
    if (!seen || reduce || on || touched.current || !done) return;
    const id = window.setTimeout(() => {
      if (!touched.current) setOn(true);
    }, 1600);
    return () => window.clearTimeout(id);
  }, [seen, reduce, on, done]);

  const name = "Clínica Aurora";

  return (
    <div ref={ref} className="sg-ai">
      <div className="sg-ai-top">
        <span className="mono-label text-paper/55">{t("AI assistant", "Assistente de IA")}</span>
        <Switch
          dark
          label={t("The business’s website", "O website do negócio")}
          value={on ? "on" : "off"}
          onChange={(id) => {
            touched.current = true;
            setOn(id === "on");
          }}
          options={[
            { id: "off", label: t("Without GEO", "Sem GEO") },
            { id: "on", label: t("With GEO", "Com GEO") },
          ]}
        />
      </div>

      <div className="sg-ai-body">
        <p className="sg-ai-ask">{ask}</p>
        <div className="sg-ai-answer">
          <span aria-hidden="true" className="sg-ai-mark" data-busy={(seen && !done) || undefined} />
          <p aria-live="polite">
            {shown.map((w, i) => {
              const strong = on && name.includes(w.replace(/[.,]/g, "")) && w.length > 2;
              return (
                <span key={`${on}-${i}`} className={`sg-word ${strong ? "font-medium text-paper" : ""}`}>
                  {w}{" "}
                </span>
              );
            })}
          </p>
        </div>
        <div className="sg-ai-sources mono-label" data-on={(done && seen) || undefined}>
          {on ? (
            <>
              <span className="text-paper/45">{t("Source", "Fonte")}</span>
              <span className="sg-source">
                <span aria-hidden="true" className="sg-source-dot" />
                clinicaaurora.pt
              </span>
            </>
          ) : (
            <span className="text-paper/45">{t("No sources", "Sem fontes")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function GeoSection({ t }: { t: T }) {
  return (
    <section aria-labelledby="sg-geo" data-tone="light" className="sg-geo relative">
      <div className="shell sg-geo-grid">
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
            <p className="sg-lede mt-6 text-ash">
              {t(
                "GEO (Generative Engine Optimization) is a different set of practices with a similar purpose, aimed at Artificial Intelligence instead. More and more of us turn to it for suggestions and recommendations, and these practices raise the chances of AI tools recommending a business to their users.",
                "O GEO (Generative Engine Optimization) consiste num conjunto de práticas diferentes, com um propósito semelhante, mas direcionado para a Inteligência Artificial. Todos nós a usamos cada vez mais para obter sugestões e recomendações, e estas práticas aumentam a probabilidade de as ferramentas de IA recomendarem um negócio aos seus utilizadores.",
              )}
            </p>
          </SlideIn>
        </div>
        <div>
          <Assistant t={t} />
          <p className="mono-label mt-4 text-ash-2">
            {t("A demonstration: the clinic and the assistant are invented.", "Uma demonstração: a clínica e o assistente são inventados.")}
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
  const seen = useSeen(ref, { threshold: 0.35 });
  const [level, setLevel] = useState<Level>("basic");
  const [month, setMonth] = useState(12);
  const narrow = useNarrow();
  const { W, H, PAD, xOf, yOf, paths } = useMemo(() => geometry(narrow), [narrow]);

  const info: Record<Level, { name: string; when: string; body: string }> = {
    basic: {
      name: t("Basic SEO practices", "Práticas básicas de SEO"),
      when: t("Included in every website", "Incluídas em todos os websites"),
      body: t(
        "They make sure the website comes up at the top of very specific searches that lead to the business, such as its own name, and on later pages of related searches, such as “aesthetic clinics in Vila Nova de Gaia”.",
        "Garantem que o website aparece no topo das pesquisas muito específicas que remetem para o negócio, como o nome do próprio negócio, e em páginas mais distantes nas pesquisas relacionadas, como “clínicas de estética em Vila Nova de Gaia”.",
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
    <section aria-labelledby="sg-levels" data-tone="dark" className="relative text-paper">
      <div className="shell sg-levels">
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("The impact of each level", "O impacto de cada nível")}</p>
          <h2 id="sg-levels" className="display mt-6 text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02]">
            <span className="block font-light">{t("Basic, one-off or monthly:", "Básico, único ou mensal:")}</span>
            <span className="block font-medium">{t("twelve months of each.", "doze meses de cada um.")}</span>
          </h2>
        </SlideIn>

        <div ref={ref} className="sg-levels-grid">
          <div className="sg-levels-side">
            <Switch
              dark
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
              <p className="mono-label text-paper/45">{info[level].when}</p>
              <h3 className="display mt-3 text-[1.625rem] font-medium leading-[1.1]">{info[level].name}</h3>
              <p className="mt-4 max-w-[44ch] text-[1rem] leading-[1.6] text-paper/70">{info[level].body}</p>
            </motion.div>

            <dl className="sg-readout">
              <div className="sg-readout-row">
                <dt>
                  <span className="mono-label text-paper/45">{t("Search by name", "Pesquisa pelo nome")}</span>
                  <span className="sg-readout-q">“Clínica Aurora”</span>
                </dt>
                <dd className="mono-label">{t("No. 1", "1.º lugar")}</dd>
              </div>
              <div className="sg-readout-row">
                <dt>
                  <span className="mono-label text-paper/45">{t("Related search", "Pesquisa relacionada")}</span>
                  <span className="sg-readout-q">{t("“aesthetic clinics in Gaia”", "“clínicas de estética em Gaia”")}</span>
                </dt>
                <dd className="mono-label" data-top={rank <= 10 || undefined}>
                  {relatedShown}
                </dd>
              </div>
            </dl>
          </div>

          <figure className="sg-chart">
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

function Price({ t, table }: { t: T; table: SeoPrice[] }) {
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
      <div className="shell sg-price-grid">
        <div>
          <SlideIn ready>
            <p className="mono-label text-ash-2">{t("Price", "Preço")}</p>
            <h2 id="sg-price" className="display mt-6 text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02]">
              <span className="block font-light">{t("What it costs,", "Quanto custa,")}</span>
              <span className="block font-medium">{t("measured by the website.", "à medida do website.")}</span>
            </h2>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.08}>
            <p className="sg-lede mt-8 text-ash">
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
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Between the sections: a tonal veil                                */
/* ---------------------------------------------------------------- */

/* The sections have no ground of their own. One ground lies behind the
   whole page, held to the screen, and its tone follows the scroll: as a
   section's head comes up the screen, the ground passes from black to
   white (or back) over half a screen of scroll, with no line anywhere,
   and the section going out dims and settles back a little while the
   one coming in takes its place. It runs both ways and nothing moves
   while the page is still. The same idea as the about page's water,
   which turns the screen from white to water on the scroll (the
   references, through Inspo: Audo and Chloé's veils).

   The last turn is to the black of Let's work together, under the
   page: the ground goes dark as that section comes up, so the white
   ends in it rather than against it. */

const INK = 11; // #0b0b0b, the dark sections' ground
/** Where a turn starts and how long it lasts, as shares of the screen:
    it starts when the next section's top is 75% down the screen and is
    done when it is 33% down: short enough that the grey between the two
    is passed through, not dwelt in. */
const TURN_FROM = 0.75;
const TURN_SPAN = 0.42;
const smooth = (x: number) => x * x * (3 - 2 * x);

function useToneVeil(room: RefObject<HTMLDivElement | null>, ground: RefObject<HTMLDivElement | null>, grain: RefObject<HTMLDivElement | null>) {
  const reduce = useReducedMotion() ?? false;
  useEffect(() => {
    const r = room.current;
    const g = ground.current;
    if (!r || !g) return;
    const stops = Array.from(r.querySelectorAll<HTMLElement>(":scope > [data-tone]")).map((el) => ({
      el,
      tone: el.dataset.tone === "light" ? 1 : 0,
      body: el.querySelector<HTMLElement>(":scope > .shell"),
      last: "",
    }));
    const after = r.closest("main")?.nextElementSibling;
    // Let's work together turns the ground only: the prices above it keep
    // their full strength while they can still be read.
    const sections = stops.length;
    if (after instanceof HTMLElement) stops.push({ el: after, tone: 0, body: null, last: "" });
    if (!stops.length) return;

    let lastTone = -1;
    let queued = 0;
    const update = () => {
      queued = 0;
      const vh = window.innerHeight || 1;
      let tone = stops[0]!.tone;
      let own = tone;
      for (let k = 1; k < stops.length; k++) {
        const top = stops[k]!.el.getBoundingClientRect().top;
        const p = Math.min(Math.max((vh * TURN_FROM - top) / (vh * TURN_SPAN), 0), 1);
        tone += (stops[k]!.tone - tone) * smooth(p);
        if (k < sections) own = tone;
      }
      const key = Math.round(tone * 1000);
      if (key !== lastTone) {
        lastTone = key;
        const c = Math.round(INK + (255 - INK) * tone);
        g.style.backgroundColor = `rgb(${c} ${c} ${c})`;
        // The corner light and the grain belong to the dark: they go with it.
        if (grain.current) grain.current.style.opacity = (1 - tone).toFixed(3);
      }
      for (const stop of stops) {
        if (!stop.body) continue;
        // How much the ground is this section's own: 1 on its tone, 0 on
        // the other. Below 1 it dims and settles back.
        const v = smooth(1 - Math.abs(own - stop.tone));
        const opacity = v > 0.999 ? "" : (0.42 + 0.58 * v).toFixed(3);
        const scale = reduce || v > 0.999 ? "" : `scale(${(0.97 + 0.03 * v).toFixed(4)})`;
        const next = opacity + "|" + scale;
        if (next === stop.last) continue;
        stop.last = next;
        stop.body.style.opacity = opacity;
        stop.body.style.transform = scale;
        stop.body.style.transformOrigin = scale ? "50% 40%" : "";
      }
    };
    const queue = () => {
      if (!queued) queued = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    // The page settling (fonts, the results page) moves the sections
    // without a scroll.
    const settle = new ResizeObserver(queue);
    settle.observe(document.body);
    return () => {
      cancelAnimationFrame(queued);
      settle.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [room, ground, grain, reduce]);
}

/** The page's three sections, between the bar and Let's work together. */
export function SeoGeo({ prices }: { prices: SeoPrice[] }) {
  const t = useT();
  const room = useRef<HTMLDivElement>(null);
  const ground = useRef<HTMLDivElement>(null);
  const grain = useRef<HTMLDivElement>(null);
  useToneVeil(room, ground, grain);
  return (
    <div ref={room} className="sg-room">
      <div ref={ground} aria-hidden="true" className="sg-ground">
        <div ref={grain} className="sg-ground-dusk">
          <div className="sg-ground-grain" />
        </div>
      </div>
      <SeoHero t={t} />
      <GeoSection t={t} />
      <Levels t={t} />
      <Price t={t} table={prices} />
    </div>
  );
}
