"use client";

import { useRef, useState } from "react";
import { SlideIn } from "./enter";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Switch, useInView, useScramble } from "./sbs-shared";
import { Ours } from "./sbs-pilar";
import { ExploreBar, PlateScreen, SbsPreview, useTapToTakeOver } from "./sbs-explore";
import { usePlateScrub } from "./sbs-scrub";
import { Advanced } from "./sbs-advanced";
import { useT } from "@/lib/use-lang";

export { SbsIncluded } from "./sbs-included";
export { SbsPersonal } from "./sbs-personal";

/* ==================================================================
   Side by side, after the comparison: the web design service itself.

   Three sections under the two looping websites (see
   docs/side-by-side-decisions.md): what the service includes
   (sbs-included.tsx), the two design levels (here), and personalization
   (sbs-personal.tsx). What they share is in sbs-shared.tsx.

   Two levels: the same insurance broker as above, its whole page at
   each level, in one plate with a switch (user, 2026-11-17: the whole
   page, not one section). Essential+ is the very page of the comparison
   (Ours); Advanced is the same page, the same sections and words, with
   a finish of its own (sbs-advanced.tsx). Both go down the page on the
   comparison's own loop, so they reach their sections at the same
   moments. The level's name scrambles as it changes, after Lisovskiy's
   studio site. The switch is set as the bar's links are, in square
   cells ruled by hairlines; only Pilar's own pages inside the plate keep
   their round buttons, being another brand's.
   ================================================================== */

type Level = "essential" | "advanced";

export function SbsLevels() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const [level, setLevel] = useState<Level>("essential");
  const [taken, setTaken] = useState(false);
  const [plate, inView] = useInView<HTMLDivElement>(0.3);
  // By hand (user, 2026-11-17): the visitor scrolls the page in the plate,
  // from the call under it or a tap on it; or opens it larger.
  const [manual, setManual] = useState(false);
  const [open, setOpen] = useState(false);
  const running = (inView || manual) && !reduce;
  const scrub = useRef<HTMLDivElement>(null);
  usePlateScrub(scrub, manual && !open, level);
  const takeOver = () => {
    setTaken(true);
    setManual(true);
  };
  const tap = useTapToTakeOver(manual, takeOver);

  // On its own, the plate shows one whole visit of a page and then the
  // other, until the switch is touched.
  const lap = () => {
    if (!taken && !manual) setLevel((l) => (l === "essential" ? "advanced" : "essential"));
  };

  const levels = {
    essential: {
      name: t("Essential+", "Essencial+"),
      note: t("Clean design that works with simple, elegant motion and animation.", "Design limpo, que funciona com movimentos e animações simples e elegantes."),
      demo: t(
        "In the demo: the whole page of the comparison above; each section comes in once, gently, and holds still.",
        "Na demonstração: a página inteira da comparação de cima; cada secção entra uma vez, com suavidade, e fica quieta.",
      ),
    },
    advanced: {
      name: t("Advanced", "Avançado"),
      note: t("Richer layouts and animation, designed around your brand.", "Composições e animações mais ricas, desenhadas à volta da marca."),
      demo: t(
        "In the demo: the same page and the same words, more refined. Pilar’s symbol, in metal, opens the visit and the view flies through it; the symbol then follows the five kinds of insurance one by one; the table of quotes settles out of depth; the four steps pass as a carousel over moving bars; each section rises over the last like a sheet.",
        "Na demonstração: a mesma página e as mesmas palavras, mais requintadas. O símbolo da Pilar, em metal, abre a visita e a vista atravessa-o; depois acompanha os cinco seguros um a um; o quadro de propostas assenta vindo da profundidade; os quatro passos passam num carrossel sobre barras em movimento; cada secção sobe sobre a anterior como uma folha.",
      ),
    },
  } as const;
  const name = useScramble(levels[level].name, reduce);

  return (
    <section aria-labelledby="sbl-title" className="sbl relative isolate bg-ink py-(--section-gap) text-paper">
      <div className="shell sbl-grid">
        <div className="sbl-head">
          <SlideIn ready>
          <p className="mono-label text-paper/55">{t("Design levels", "Níveis de design")}</p>
          <h2 id="sbl-title" className="display mt-6 text-balance text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.02]">
            <span className="font-light sm:block">{t("Two levels,", "Dois níveis,")}</span>{" "}
            <span className="font-medium sm:block">{t("the same care.", "o mesmo cuidado.")}</span>
          </h2>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.08}>
          <p className="mt-7 max-w-[44ch] text-[1.0625rem] leading-[1.55] text-paper/70">
            {t(
              "An Essential+ website is designed with as much care as an Advanced one. Advanced adds complex design elements, which take longer to work on and give it a more premium look.",
              "Um website Essencial+ tem uma estética tão cuidada como um Avançado. O Avançado acrescenta elementos de design complexos, que levam mais tempo a trabalhar e lhe dão uma estética mais premium.",
            )}
          </p>
          </SlideIn>
        </div>

        <div className="sbl-ctrl">
          <SlideIn ready distance={0} delay={0.12}>
          <div>
            <Switch
              dark
              label={t("Design level", "Nível de design")}
              value={level}
              onChange={(id) => {
                setTaken(true);
                setLevel(id as Level);
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
          </SlideIn>
        </div>

        <figure className="sbl-figure">
          <SlideIn ready from="below" distance={24}>
          <div ref={plate} className="sbl-plate" {...tap}>
            <div ref={scrub} className="absolute inset-0">
              <AnimatePresence initial={false}>
                <motion.div
                  key={level}
                  aria-hidden="true"
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PlateScreen running={running} onLap={lap} className="sbl-screen">
                    {level === "essential" ? <Ours t={t} /> : <Advanced t={t} />}
                  </PlateScreen>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          </SlideIn>
          <figcaption className="sbl-caption mono-label">
            <SlideIn ready from="below" distance={10} delay={0.18}>
            {t(
              "The same invented insurance broker as above, its whole page at each level.",
              "A mesma mediadora inventada de cima, com a página inteira em cada nível.",
            )}
            </SlideIn>
          </figcaption>
          {!reduce && (
            <SlideIn ready from="below" distance={10} delay={0.18}>
            <ExploreBar
              t={t}
              manual={manual}
              setManual={(on) => {
                setTaken(true);
                setManual(on);
              }}
              onOpen={() => {
                setTaken(true);
                setOpen(true);
              }}
            />
            </SlideIn>
          )}
        </figure>

        <SbsPreview
          t={t}
          open={open}
          onClose={() => setOpen(false)}
          label={`${t("Design levels", "Níveis de design")} · ${levels[level].name}`}
        >
          <PlateScreen running className="sbx-prev-screen">
            {level === "essential" ? <Ours t={t} /> : <Advanced t={t} />}
          </PlateScreen>
        </SbsPreview>
      </div>
    </section>
  );
}
