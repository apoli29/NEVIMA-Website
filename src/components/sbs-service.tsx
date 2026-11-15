"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Funnel_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Switch, useInView, useScramble, type T } from "./sbs-shared";
import { useT } from "@/lib/use-lang";

export { SbsIncluded } from "./sbs-included";
export { SbsPersonal } from "./sbs-personal";

/* ==================================================================
   Side by side, after the comparison: the web design service itself.

   Three sections under the two looping websites (see
   docs/side-by-side-decisions.md): what the service includes
   (sbs-included.tsx), the two design levels (here), and personalization
   (sbs-personal.tsx). What they share is in sbs-shared.tsx.

   Two levels: the same insurance broker as above, in one plate with a
   switch, the Essential+ build and the Advanced build of the same
   section, so the difference is seen rather than described. The level's
   name scrambles as it changes, after Lisovskiy's studio site. The
   switch is set as the bar's links are, in square cells ruled by
   hairlines; only Pilar's own pages inside the plate keep their round
   buttons, being another brand's.
   ================================================================== */

/* Pilar's type, for the plate only (the same faces the comparison above
   loads from its own module). */
const lvlDisplay = Funnel_Display({ subsets: ["latin"], variable: "--f-lvl-display", display: "swap" });
const lvlSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--f-lvl-sans", display: "swap" });

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
