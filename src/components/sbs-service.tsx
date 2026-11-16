"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Switch, useInView, useScramble } from "./sbs-shared";
import { Ours, useFit } from "./sbs-pilar";
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

/** One level's page in the plate, scaled to it and taken down the page by
    the comparison's loop; `onLap` is told each time it is back at the top. */
function LevelScreen({ running, onLap, children }: { running: boolean; onLap: () => void; children: React.ReactNode }) {
  const screen = useFit();
  return (
    <div ref={screen} className="sbs-screen sbl-screen">
      <div
        className={running ? "sbs-run" : undefined}
        onAnimationIteration={(e) => {
          if (e.animationName === "sbs-scroll") onLap();
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SbsLevels() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const [level, setLevel] = useState<Level>("essential");
  const [taken, setTaken] = useState(false);
  const [plate, inView] = useInView<HTMLDivElement>(0.3);
  const [paused, setPaused] = useState(false); // TEMPORARY, see seek below
  const [at, setAt] = useState(0); // TEMPORARY
  // TEMPORARY: once the pause has been used, the loop no longer waits on
  // the plate being 30% in view, so Play always sets it going again (the
  // site's off-screen pause still holds it when it is far off the screen).
  const [handled, setHandled] = useState(false);
  const running = (inView || paused || handled) && !reduce;

  // On its own, the plate shows one whole visit of a page and then the
  // other, until the switch is touched.
  const lap = () => {
    if (!taken && !paused) setLevel((l) => (l === "essential" ? "advanced" : "essential"));
  };

  /* TEMPORARY (user, 2026-11-17: to look at the pages calmly and point
     out what to change): a pause and a bar that moves the plate's loop
     by hand. Every animation on the loop's clock is held and set to the
     same moment, so the page and its effects stay in step. Remove both
     before this goes live. */
  const LOOP_MS = 18000;
  const loopAnims = () =>
    (plate.current?.getAnimations({ subtree: true }) ?? []).filter(
      (a) => a.effect?.getComputedTiming().duration === LOOP_MS,
    );
  const seek = (p: number) => {
    for (const a of loopAnims()) {
      a.pause();
      a.currentTime = p * LOOP_MS + (a.effect?.getTiming().delay as number ?? 0);
    }
  };
  useEffect(() => {
    if (!paused) {
      for (const a of loopAnims()) a.play();
      return;
    }
    // a page that has just come in (the switch) is set to the same moment
    const id = window.setTimeout(() => seek(at), 60);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, level, at]);
  const pause = () => {
    if (paused) {
      setPaused(false);
      return;
    }
    const first = loopAnims()[0];
    const now = first ? ((Number(first.currentTime) - (first.effect?.getTiming().delay as number ?? 0)) % LOOP_MS) / LOOP_MS : 0;
    setAt(Math.max(0, now));
    setTaken(true);
    setHandled(true);
    setPaused(true);
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
        "In the demo: the same page and the same words, more refined. The photograph opens through slats and contour lines rise from the pillar; the ground turns dark under the five kinds of insurance; the table of quotes settles out of depth and Pilar’s pick lifts; the symbol, in depth, turns at each step.",
        "Na demonstração: a mesma página e as mesmas palavras, mais requintadas. A fotografia abre-se em lâminas e sobem linhas de contorno do pilar; o fundo escurece sob os cinco seguros; o quadro de propostas assenta vindo da profundidade e a escolha da Pilar destaca-se; o símbolo, em volume, roda a cada passo.",
      ),
    },
  } as const;
  const name = useScramble(levels[level].name, reduce);

  return (
    <section aria-labelledby="sbl-title" className="sbl relative isolate bg-ink py-(--section-gap) text-paper">
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
        </div>

        <figure className="sbl-figure">
          <div ref={plate} className="sbl-plate">
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
                <LevelScreen running={running} onLap={lap}>
                  {level === "essential" ? <Ours t={t} /> : <Advanced t={t} />}
                </LevelScreen>
              </motion.div>
            </AnimatePresence>
          </div>
          <figcaption className="sbl-caption mono-label">
            {t(
              "The same invented insurance broker as above, its whole page at each level.",
              "A mesma mediadora inventada de cima, com a página inteira em cada nível.",
            )}
          </figcaption>
          {/* TEMPORARY: the pause and the bar (see seek above). */}
          {!reduce && (
            <div className="sbl-temp">
              <button type="button" onClick={pause}>
                {paused ? t("Play", "Retomar") : t("Pause", "Pausar")}
              </button>
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round(at * 1000)}
                disabled={!paused}
                aria-label={t("Moment in the visit", "Momento da visita")}
                onChange={(e) => setAt(Number(e.target.value) / 1000)}
              />
              <span>{paused ? `${Math.round(at * 100)}%` : ""}</span>
            </div>
          )}
        </figure>
      </div>
    </section>
  );
}
