"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Funnel_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Glass } from "./cta-glass";
import { useOriginFade, useProposal } from "./proposal-flow";
import { useSeen } from "./use-seen";
import { useHref, useT } from "@/lib/use-lang";

/* ==================================================================
   Side by side, after the comparison: the web design service itself.

   Three sections under the two looping websites, each after one
   reference found through Inspo and taken into the site's black and
   white (see docs/side-by-side-decisions.md):

   - Included. Linear's features page: a field of raised square pieces
     that fades out at its edges, one of them lit, and a line of type that
     scrambles before it settles. Here each piece is one thing the
     service includes, drawn as a pixel pictogram; the lit one is black
     and its explanation stands beside the field.
   - Two levels. The same insurance broker as above, in one plate with a
     switch: the Essential+ build and the Advanced build of the same
     section, so the difference is seen rather than described. The level's
     name scrambles as it changes, after Lisovskiy's studio site.
   - Personalization. A website's map that the visitor builds from the
     same pages the proposal form offers, and that folds into one page
     (a landing page) at the switch, its addresses turning into anchors.
     Below it, Typeform's prompt over a mosaic glow: a client's doubts
     typing themselves and clearing, then the studio's answer.

   Every loop here holds still for anyone who has asked for less motion,
   and stops for good the moment the visitor takes over.
   ================================================================== */

type T = ReturnType<typeof useT>;

/* Pilar's type, for the plate in the second section only (the same
   faces the comparison above loads from its own module). */
const lvlDisplay = Funnel_Display({ subsets: ["latin"], variable: "--f-lvl-display", display: "swap" });
const lvlSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--f-lvl-sans", display: "swap" });

/** On screen now (not latched, unlike useSeen): the loops here run only
    while they can be seen. */
function useInView<E extends Element>(threshold = 0.35) {
  const ref = useRef<E>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const watch = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { threshold });
    watch.observe(el);
    return () => watch.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789*#%&+";

/** A line that scrambles into place when it changes (Linear's security
    card): every letter runs through glyphs and settles left to right, in
    under half a second. Spaces and punctuation stay put, so the line
    keeps its shape while it settles. */
function useScramble(text: string, still: boolean, live = true) {
  const [shown, setShown] = useState(text);
  const first = useRef(true);
  useEffect(() => {
    if (first.current || still || !live) {
      first.current = false;
      setShown(text);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const length = 420;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / length);
      const settled = Math.floor(p * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i]!;
        out += i < settled || !/[\p{L}\p{N}]/u.test(c) ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setShown(p < 1 ? out : text);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, still, live]);
  return shown;
}

/** Two choices on one track, the thumb sliding under the chosen one. */
function Switch({
  options,
  value,
  onChange,
  label,
  dark = false,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  dark?: boolean;
}) {
  const at = Math.max(0, options.findIndex((o) => o.id === value));
  return (
    <div role="radiogroup" aria-label={label} className={`sbx-switch ${dark ? "sbx-switch-dark" : ""}`} style={{ ["--at" as string]: at }}>
      <span aria-hidden="true" className="sbx-switch-thumb" />
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          className="sbx-switch-opt"
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ================================================================== */
/* Included                                                           */
/* ================================================================== */

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

function PixelIcon({ name }: { name: string }) {
  const rows = ICONS[name] ?? [];
  let d = "";
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === "#") d += `M${x} ${y}h1v1h-1Z`;
  });
  return (
    <svg viewBox="-0.5 -0.5 10 10" className="sbi-icon" aria-hidden="true" shapeRendering="crispEdges">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

type Feature = { id: string; name: string; text: string; aside?: { lead: string; text: string } };

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

/** How long each piece stays lit while the field runs on its own. */
const INCLUDED_MS = 5200;
const FIELD_COLS = 7;
const FIELD_ROWS = 4;

function FeaturePanel({ f, active, still, id, tabId }: { f: Feature; active: boolean; still: boolean; id: string; tabId: string }) {
  const name = useScramble(f.name, still, active);
  return (
    <div role="tabpanel" id={id} aria-labelledby={tabId} className="sbi-panel" data-on={active || undefined}>
      <h3 className="sbi-name">
        <span aria-hidden="true">{name}</span>
        <span className="sr-only">{f.name}</span>
      </h3>
      <p className="sbi-text">{f.text}</p>
      {f.aside && (
        <p className="sbi-aside">
          <span className="font-medium text-ink">{f.aside.lead}</span> {f.aside.text}
        </p>
      )}
    </div>
  );
}

export function SbsIncluded() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const list = useMemo(() => features(t), [t]);
  const [at, setAt] = useState(0);
  const [taken, setTaken] = useState(false);
  const [held, setHeld] = useState(false);
  const [field, inView] = useInView<HTMLDivElement>(0.4);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const running = inView && !taken && !held && !reduce;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setAt((i) => (i + 1) % list.length), INCLUDED_MS);
    return () => window.clearTimeout(id);
  }, [running, at, list.length]);

  const choose = (i: number, focus = false) => {
    setTaken(true);
    setAt(i);
    if (focus) tabs.current[i]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const n = list.length;
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 5,
      ArrowLeft: -1,
      ArrowUp: -5,
    };
    if (e.key in moves) {
      e.preventDefault();
      choose((at + moves[e.key]! + n) % n, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      choose(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      choose(n - 1, true);
    }
  };

  // The ten pieces sit in the middle of a wider field whose outer ring
  // is blank pieces fading into the page, as Linear's does.
  const cells: ReactNode[] = [];
  for (let r = 0; r < FIELD_ROWS; r++) {
    for (let c = 0; c < FIELD_COLS; c++) {
      const inner = r >= 1 && r <= 2 && c >= 1 && c <= 5;
      if (!inner) {
        cells.push(<span key={`b${r}-${c}`} aria-hidden="true" className="sbi-tile sbi-blank" />);
        continue;
      }
      const i = (r - 1) * 5 + (c - 1);
      const f = list[i]!;
      const on = i === at;
      cells.push(
        <button
          key={f.id}
          ref={(el) => {
            tabs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`sbi-tab-${f.id}`}
          aria-selected={on}
          aria-controls={`sbi-panel-${f.id}`}
          aria-label={f.name}
          tabIndex={on ? 0 : -1}
          className="sbi-tile"
          data-on={on || undefined}
          onClick={() => choose(i)}
          onKeyDown={onKey}
        >
          <PixelIcon name={f.id} />
        </button>,
      );
    }
  }

  return (
    <section aria-labelledby="sbi-title" className="sbi relative bg-paper py-(--section-gap)">
      <div className="shell">
        <p className="mono-label text-ash-2">{t("Included in the service", "Incluído no serviço")}</p>
        <h2 id="sbi-title" className="display mt-6 text-balance text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.02]">
          <span className="font-light sm:block">{t("What many charge extra for", "O que muitos cobram à parte,")}</span>{" "}
          <span className="font-medium sm:block">{t("is included here.", "aqui está incluído.")}</span>
        </h2>

        <div
          className="sbi-body"
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          <div ref={field} className="sbi-field" role="tablist" aria-label={t("What the service includes", "O que o serviço inclui")}>
            {cells}
          </div>

          <div className="sbi-side">
            <div className="sbi-panels" aria-live={taken ? "polite" : "off"}>
              {list.map((f, i) => (
                <FeaturePanel key={f.id} f={f} active={i === at} still={reduce} id={`sbi-panel-${f.id}`} tabId={`sbi-tab-${f.id}`} />
              ))}
            </div>
            <div className="sbi-count mono-label" aria-hidden="true">
              <span>
                {String(at + 1).padStart(2, "0")}/{String(list.length).padStart(2, "0")}
              </span>
              <span className="sbi-track">
                <span
                  key={`${at}-${running}`}
                  className="sbi-fill"
                  data-run={running || undefined}
                  style={{ ["--dur" as string]: `${INCLUDED_MS}ms` }}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Two levels                                                         */
/* ================================================================== */

/** The plate's own width and height, in its own pixels. */
const PLATE_W = 880;
const PLATE_H = 540;
/** How long each level is shown while the plate runs on its own. */
const LEVEL_MS = 7000;

/** Pilar's symbol, as the comparison above draws it. */
function Symbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <rect width="30" height="100" rx="8" />
      <path fillRule="evenodd" d="M44 0H76A24 24 0 0 1 100 24V42A24 24 0 0 1 76 66H44A6 6 0 0 1 38 60V6A6 6 0 0 1 44 0Z M59 23H79V43H59Z" />
    </svg>
  );
}

/** The symbol on a grid of ten by ten cells, for the Advanced build to
    put together one piece at a time. */
const SYMBOL_CELLS = (() => {
  const inside = (x: number, y: number) => {
    if (x >= 0 && x <= 30 && y >= 0 && y <= 100) return true;
    if (x < 38 || x > 100 || y < 0 || y > 66) return false;
    if (x >= 59 && x <= 79 && y >= 23 && y <= 43) return false;
    if (x > 76 && y < 24 && Math.hypot(x - 76, y - 24) > 24) return false;
    if (x > 76 && y > 42 && Math.hypot(x - 76, y - 42) > 24) return false;
    return true;
  };
  const out: { x: number; y: number }[] = [];
  for (let j = 0; j < 10; j++) for (let i = 0; i < 10; i++) if (inside(i * 10 + 5, j * 10 + 5)) out.push({ x: i, y: j });
  return out;
})();

function PlateNav({ t, light }: { t: T; light?: boolean }) {
  return (
    <div className={`sbl-nav ${light ? "sbl-nav-light" : ""}`}>
      <span className="sbl-logo">
        <Symbol />
        <span>{t("Pilar Insurance", "Pilar Seguros")}</span>
      </span>
      <span className="sbl-links">
        <span>{t("Insurance", "Seguros")}</span>
        <span>{t("Claims", "Sinistros")}</span>
        <span>{t("Contact", "Contacto")}</span>
        <span className="sbl-pill">{t("Get a quote", "Pedir simulação")}</span>
      </span>
    </div>
  );
}

function Essential({ t }: { t: T }) {
  return (
    <div className="sbl-build sbl-ess">
      <PlateNav t={t} />
      <div className="sbl-ess-body">
        <div className="sbl-ess-copy">
          <h3>
            {t("Insurance chosen by someone", "Seguros escolhidos por")} {t("who doesn’t sell it.", "quem não os vende.")}
          </h3>
          <p>
            {t(
              "Insurance brokerage. We compare the insurers; you decide with everything in front of you.",
              "Mediação de seguros. Comparamos as seguradoras; o cliente decide com tudo à frente.",
            )}
          </p>
          <span className="sbl-pill sbl-pill-ghost">{t("Get a quote", "Pedir simulação")}</span>
        </div>
        <div className="sbl-ess-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/side-by-side/pilar-hero.webp" alt="" />
        </div>
      </div>
    </div>
  );
}

function Advanced({ t }: { t: T }) {
  const lines = [t("Insurance chosen", "Seguros escolhidos"), t("by someone who", "por quem não"), t("doesn’t sell it.", "os vende.")];
  return (
    <div className="sbl-build sbl-adv">
      <div className="sbl-adv-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/side-by-side/pilar-hero.webp" alt="" className="sbl-kb" />
      </div>
      <div aria-hidden="true" className="sbl-adv-wash" />
      <div aria-hidden="true" className="sbl-adv-light" />
      <PlateNav t={t} light />
      <svg viewBox="0 0 10 10" className="sbl-adv-symbol" aria-hidden="true">
        {SYMBOL_CELLS.map((c, i) => (
          <rect key={i} x={c.x + 0.08} y={c.y + 0.08} width="0.84" height="0.84" style={{ ["--i" as string]: i }} />
        ))}
      </svg>
      <div className="sbl-adv-copy">
        <h3>
          {lines.map((l, i) => (
            <span key={i} className="sbl-line">
              <span style={{ ["--i" as string]: i }}>{l}</span>
            </span>
          ))}
        </h3>
        <p>
          {t(
            "Insurance brokerage. We compare the insurers; you decide with everything in front of you.",
            "Mediação de seguros. Comparamos as seguradoras; o cliente decide com tudo à frente.",
          )}
        </p>
      </div>
    </div>
  );
}

export function SbsLevels() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const [level, setLevel] = useState<"essential" | "advanced">("essential");
  const [taken, setTaken] = useState(false);
  const [plate, inView] = useInView<HTMLDivElement>(0.45);
  const running = inView && !taken && !reduce;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setLevel((l) => (l === "essential" ? "advanced" : "essential")), LEVEL_MS);
    return () => window.clearTimeout(id);
  }, [running, level]);

  // The plate is laid out at its own size and scaled into its frame.
  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    const fit = () => el.style.setProperty("--k", String(el.clientWidth / PLATE_W));
    fit();
    const size = new ResizeObserver(fit);
    size.observe(el);
    return () => size.disconnect();
  }, [plate]);

  // The light that follows the pointer, in the plate's own pixels.
  const follow = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = plate.current;
    if (!el || reduce) return;
    const box = el.getBoundingClientRect();
    const k = box.width / PLATE_W;
    el.style.setProperty("--mx", `${(e.clientX - box.left) / k}px`);
    el.style.setProperty("--my", `${(e.clientY - box.top) / k}px`);
  };

  const levels = {
    essential: {
      name: t("Essential+", "Essencial+"),
      note: t("Clean design that works with simple, elegant motion and animation.", "Design limpo, que funciona com movimentos e animações simples e elegantes."),
      demo: t(
        "In the demo: the layout comes in once, gently, and holds still.",
        "Na demonstração: a composição entra uma vez, com suavidade, e fica quieta.",
      ),
    },
    advanced: {
      name: t("Advanced", "Avançado"),
      note: t("Richer layouts and animation, designed around your brand.", "Composições e animações mais ricas, desenhadas à volta da marca."),
      demo: t(
        "In the demo: the photograph fills the page and moves slowly, the headline is revealed line by line, the symbol builds itself piece by piece and a light follows the cursor.",
        "Na demonstração: a fotografia ocupa a página e move-se devagar, o título é revelado linha a linha, o símbolo monta-se peça a peça e uma luz segue o cursor.",
      ),
    },
  } as const;
  const name = useScramble(levels[level].name, reduce);

  return (
    <section aria-labelledby="sbl-title" className={`sbl relative isolate bg-ink py-(--section-gap) text-paper ${lvlDisplay.variable} ${lvlSans.variable}`}>
      <div className="shell sbl-grid">
        <div className="sbl-head">
          <p className="mono-label text-paper/55">{t("Design levels", "Níveis de design")}</p>
          <h2 id="sbl-title" className="display mt-6 text-balance text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.02]">
            <span className="font-light sm:block">{t("Two levels,", "Dois níveis,")}</span>{" "}
            <span className="font-medium sm:block">{t("the same care.", "o mesmo cuidado.")}</span>
          </h2>
          <p className="mt-7 max-w-[44ch] text-[1.0625rem] leading-[1.55] text-paper/70">
            {t(
              "An Essential+ website is designed with as much care as an Advanced one. Advanced adds complex design elements, which take longer to work on and give it a more premium look.",
              "Um website Essencial+ tem uma estética tão cuidada como um Avançado. O Avançado acrescenta elementos de design complexos, que levam mais tempo a trabalhar e lhe dão uma estética mais premium.",
            )}
          </p>
        </div>

        <div className="sbl-ctrl">
          <div>
            <Switch
              dark
              label={t("Design level", "Nível de design")}
              value={level}
              onChange={(id) => {
                setTaken(true);
                setLevel(id as "essential" | "advanced");
              }}
              options={[
                { id: "essential", label: levels.essential.name },
                { id: "advanced", label: levels.advanced.name },
              ]}
            />
          </div>

          <div className="sbl-says" aria-live={taken ? "polite" : "off"}>
            <p className="sbl-says-name" aria-hidden="true">
              {name}
            </p>
            <div className="sbl-says-stack">
              {(["essential", "advanced"] as const).map((id) => (
                <div key={id} className="sbl-says-one" data-on={id === level || undefined}>
                  <p className="text-paper">{levels[id].note}</p>
                  <p className="mt-2 text-paper/55">{levels[id].demo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <figure className="sbl-figure">
          <div ref={plate} className="sbl-plate" onPointerMove={follow} data-still={reduce || undefined}>
            <div className="sbl-page" style={{ width: PLATE_W, height: PLATE_H }} aria-hidden="true">
              <AnimatePresence initial={false}>
                <motion.div
                  key={level}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  {level === "essential" ? <Essential t={t} /> : <Advanced t={t} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <figcaption className="sbl-caption mono-label">
            {t("The same invented insurance broker as above, at each level.", "A mesma mediadora inventada de cima, em cada nível.")}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Personalization                                                    */
/* ================================================================== */

type PageId = "services" | "team" | "portfolio" | "gallery" | "prices" | "testimonials" | "faq" | "events" | "process" | "contact";

/** The pages the proposal form offers (questions.ts), with contact. */
function pages(t: T): { id: PageId; label: string; slug: string }[] {
  return [
    { id: "services", label: t("Services", "Serviços"), slug: t("services", "servicos") },
    { id: "team", label: t("Team", "Equipa"), slug: t("team", "equipa") },
    { id: "portfolio", label: t("Portfolio", "Portefólio"), slug: t("portfolio", "portefolio") },
    { id: "gallery", label: t("Gallery", "Galeria"), slug: t("gallery", "galeria") },
    { id: "prices", label: t("Prices", "Preços"), slug: t("prices", "precos") },
    { id: "testimonials", label: t("Testimonials", "Testemunhos"), slug: t("testimonials", "testemunhos") },
    { id: "faq", label: t("FAQ", "Perguntas frequentes"), slug: t("faq", "perguntas") },
    { id: "events", label: t("Events", "Eventos"), slug: t("events", "eventos") },
    { id: "process", label: t("How it works", "Como funciona"), slug: t("how-it-works", "como-funciona") },
    { id: "contact", label: t("Contact", "Contactos"), slug: t("contact", "contactos") },
  ];
}

/** What the map does on its own until the visitor takes over: a small
    website, a larger one, and the larger one folded into one page. */
const PRESETS: { mode: "website" | "landing"; pick: PageId[] }[] = [
  { mode: "website", pick: ["services", "team", "contact"] },
  { mode: "website", pick: ["services", "team", "gallery", "prices", "faq", "contact"] },
  { mode: "landing", pick: ["services", "team", "gallery", "prices", "faq", "contact"] },
];
const PRESET_MS = 3400;

const WORDS_PT = ["uma", "duas", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze"];
const WORDS_EN = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A client's doubts, in the client's own voice (as the about page's
    questions are), typed and cleared one after another. */
function doubts(t: T) {
  return [
    t("A landing page or a website?", "Landing page ou website?"),
    t("How many pages do I need?", "Quantas páginas são precisas?"),
    t("A page for each service?", "Uma página para cada serviço?"),
    t("Do I need a gallery?", "Preciso de uma galeria?"),
  ];
}

function useTyping(lines: string[], run: boolean, still: boolean) {
  const [text, setText] = useState(still ? lines[0]! : "");
  const state = useRef({ line: 0, len: 0, back: false });
  useEffect(() => {
    if (still) {
      setText(lines[0]!);
      return;
    }
    if (!run) return;
    let id = 0;
    const step = () => {
      const s = state.current;
      const full = lines[s.line % lines.length]!;
      if (!s.back) {
        s.len += 1;
        setText(full.slice(0, s.len));
        if (s.len >= full.length) {
          s.back = true;
          id = window.setTimeout(step, 1600);
          return;
        }
        id = window.setTimeout(step, 48 + Math.random() * 40);
      } else {
        s.len -= 1;
        setText(full.slice(0, Math.max(0, s.len)));
        if (s.len <= 0) {
          s.back = false;
          s.line += 1;
          id = window.setTimeout(step, 420);
          return;
        }
        id = window.setTimeout(step, 22);
      }
    };
    id = window.setTimeout(step, 500);
    return () => window.clearTimeout(id);
  }, [lines, run, still]);
  return text;
}

/** The mosaic glow behind the prompt (Typeform's), in white on black:
    square cells, brighter towards the middle, a few of them breathing. */
const GLOW_COLS = 28;
const GLOW_ROWS = 11;
const GLOW = (() => {
  const out: { o: number; d: number; b: boolean }[] = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let r = 0; r < GLOW_ROWS; r++) {
    for (let c = 0; c < GLOW_COLS; c++) {
      const dx = (c - (GLOW_COLS - 1) / 2) / (GLOW_COLS / 2);
      const dy = (r - (GLOW_ROWS - 1) / 2) / (GLOW_ROWS / 2);
      const fall = Math.max(0, 1 - Math.hypot(dx * 0.95, dy * 1.25));
      const o = Math.round(fall * fall * (0.55 + rand() * 0.45) * 100) / 100 * 0.22;
      out.push({ o, d: Math.round(rand() * 6000), b: rand() < 0.22 && fall > 0.2 });
    }
  }
  return out;
})();

function ProposalAsk({ label }: { label: string }) {
  const proposal = useProposal();
  const button = useRef<HTMLButtonElement>(null);
  const [launched, setLaunched] = useState(false);
  const present = proposal?.present ?? false;
  const href = useHref();
  useEffect(() => {
    if (!present) setLaunched(false);
  }, [present]);
  useOriginFade(button, proposal?.progress, launched && present);
  const look = "cta-drop cta-drop-light relative isolate inline-flex items-center justify-center text-[0.9375rem] leading-none whitespace-nowrap";
  const face = (
    <span className="btn-neu-face">
      <span>
        {label}
        <span aria-hidden="true" className="ml-2.5 inline-block">
          &rarr;
        </span>
      </span>
    </span>
  );
  if (!proposal) {
    return (
      <a href={href("/#proposal")} className={look}>
        <Glass />
        {face}
      </a>
    );
  }
  return (
    <button
      ref={button}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={launched && proposal.open}
      onClick={() => {
        if (!button.current) return;
        setLaunched(true);
        proposal.show(button.current, button.current, false);
      }}
      className={look}
    >
      <Glass />
      {face}
    </button>
  );
}

export function SbsPersonal() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const all = useMemo(() => pages(t), [t]);
  const [preset, setPreset] = useState(0);
  const [taken, setTaken] = useState(false);
  const [mode, setMode] = useState<"website" | "landing">(PRESETS[0]!.mode);
  const [pick, setPick] = useState<PageId[]>(PRESETS[0]!.pick);
  const [map, inView] = useInView<HTMLDivElement>(0.4);
  const running = inView && !taken && !reduce;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      const next = (preset + 1) % PRESETS.length;
      setPreset(next);
      setMode(PRESETS[next]!.mode);
      setPick(PRESETS[next]!.pick);
    }, PRESET_MS);
    return () => window.clearTimeout(id);
  }, [running, preset]);

  const toggle = (id: PageId) => {
    setTaken(true);
    setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  const shown = all.filter((p) => pick.includes(p.id));
  const count = shown.length + 1;
  const statement =
    mode === "landing"
      ? t("One page, with everything on it.", "Uma só página, com tudo.")
      : count === 1
        ? t("One page.", "Uma página.")
        : t(`${cap(WORDS_EN[count - 1] ?? String(count))} pages.`, `${cap(WORDS_PT[count - 1] ?? String(count))} páginas.`);

  const [prompt, promptInView] = useInView<HTMLDivElement>(0.5);
  const lines = useMemo(() => doubts(t), [t]);
  const typed = useTyping(lines, promptInView, reduce);
  const askSeen = useSeen(prompt, { threshold: 0.5 });

  const home = t("Home", "Início");
  const path = (slug: string) => (mode === "landing" ? `#${slug}` : `/${slug}`);

  return (
    <section aria-labelledby="sbp-title" className="sbp relative bg-paper pt-(--section-gap) pb-[clamp(1rem,2vw,1.5rem)]">
      <div className="shell">
        <p className="mono-label text-ash-2">{t("Personalization", "Personalização")}</p>
        <h2 id="sbp-title" className="display mt-6 text-balance text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.02]">
          <span className="font-light sm:block">{t("This service is built, above all,", "Este serviço tem foco máximo")}</span>{" "}
          <span className="font-medium sm:block">{t("around personalization.", "na personalização.")}</span>
        </h2>
      </div>
      <div className="shell sbp-grid mt-[clamp(2.5rem,5vw,4rem)]">
        <div className="sbp-copy">
          <p className="max-w-[42ch] text-[1.0625rem] leading-[1.55] text-ash">
            {t(
              "You choose your website’s pages, or just one page (a landing page) with everything on it.",
              "O cliente escolhe as páginas do website, ou apenas uma página (landing page) com tudo.",
            )}
          </p>

          <p className="sbp-statement" aria-live={taken ? "polite" : "off"}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={statement}
                className="inline-block"
                initial={reduce ? false : { opacity: 0, y: "0.45em", filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-0.45em", filter: "blur(6px)" }}
                transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {statement}
              </motion.span>
            </AnimatePresence>
          </p>
        </div>

        <div className="sbp-ctrl">
          <div>
            <Switch
              label={t("Kind of website", "Tipo de website")}
              value={mode}
              onChange={(id) => {
                setTaken(true);
                setMode(id as "website" | "landing");
              }}
              options={[
                { id: "website", label: t("Website", "Website") },
                { id: "landing", label: t("Landing page", "Landing page") },
              ]}
            />
          </div>

          <div className="sbp-chips" role="group" aria-label={t("Pages", "Páginas")}>
            {all.map((p) => (
              <button key={p.id} type="button" aria-pressed={pick.includes(p.id)} className="sbp-chip" onClick={() => toggle(p.id)}>
                <span aria-hidden="true" className="sbp-chip-mark" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={map} className="sbp-map" data-mode={mode} aria-hidden="true">
          <div className="sbp-tree">
            <div className="sbp-node sbp-root">
              <span className="sbp-node-name">{home}</span>
              <span className="sbp-node-path">/</span>
            </div>
            <AnimatePresence initial={false}>
              {shown.map((p) => (
                <motion.div
                  key={p.id}
                  className="sbp-branch"
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduce ? { opacity: 0, height: 0, transition: { duration: 0 } } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="sbp-node">
                    <span className="sbp-node-name">{p.label}</span>
                    <span className="sbp-node-path">{path(p.slug)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="shell mt-[clamp(4rem,9vw,7.5rem)]">
        <div ref={prompt} className="sbp-ask relative isolate overflow-hidden bg-ink text-paper">
          <div aria-hidden="true" className="sbp-glow" style={{ gridTemplateColumns: `repeat(${GLOW_COLS}, 1fr)` }}>
            {GLOW.map((g, i) => (
              <span key={i} data-b={g.b || undefined} style={{ opacity: g.o, animationDelay: `${g.d}ms` }} />
            ))}
          </div>

          <div className="sbp-ask-inner">
            <div className="sbp-prompt" aria-hidden="true">
              <span className="sbp-prompt-text">
                {typed}
                <span className="sbp-caret" />
              </span>
              <span className="sbp-prompt-foot">
                <span className="mono-label text-paper/45">{t("A client’s doubt", "Dúvida do cliente")}</span>
                <span className="sbp-send">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
                  </svg>
                </span>
              </span>
            </div>
            <ul className="sr-only">
              {lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>

            <h3 className="sbp-answer display" data-seen={askSeen || reduce || undefined}>
              <span className="font-light sm:block">{t("Not sure what to choose? Don’t worry.", "Sem saber o que escolher? Não há problema.")}</span>{" "}
              <span className="font-medium sm:block">{t("When we meet, we’ll help you choose.", "Na reunião que marcamos, ajudamos a escolher.")}</span>
            </h3>
            <div className="sbp-cta" data-seen={askSeen || reduce || undefined}>
              <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
