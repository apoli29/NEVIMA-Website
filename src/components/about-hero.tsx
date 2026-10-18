"use client";

import { useReducedMotion } from "motion/react";
import type { Copy } from "@/lib/i18n";
import { useT } from "@/lib/use-lang";
import { Illuminated } from "./services";
import { useFontsReady } from "./use-seen";

/* ==================================================================
   About, the opening statement

   One screen with the statement set over it in the middle: justified,
   each paragraph's last line centred under the block, so the words
   stand as one slab.

   Behind them, one black-and-white photograph (the user's pick,
   2026-10-15: soft folds of light by Alexander X, on Unsplash). It is
   ground, not picture: half seen over the black and softened, so the
   white type is the only hard thing on the screen.

   The copy is lit as the service copy is, grey to white, one line after
   another, the second paragraph picking the light up as the first one
   finishes. It is only measured once the fonts are in, because the lines
   it lights are the lines the browser wrapped.

   The words are a stand-in: the studio has not written its statement
   yet. They follow the shape of the reference it found (what the
   business is, the gap, what the gap costs) in the studio's own terms.
   ================================================================== */

const STATEMENT: Copy<string[]> = {
  en: [
    "Good businesses are rarely short of quality. They are short of a presence that shows it. The clinics, agencies and independent professionals we work with have built something real, yet their website still introduces a smaller version of them.",
    "Closing that gap is our whole job: two people, the right tools, and nothing standing between your work and the people it is for.",
  ],
  pt: [
    "Aos bons negócios raramente falta qualidade. Falta-lhes uma presença que a mostre. As clínicas, agências e profissionais independentes com quem trabalhamos construíram algo sólido, mas o website continua a mostrar uma versão menor do que realmente são.",
    "O nosso trabalho é encurtar essa distância: duas pessoas, as ferramentas certas e nada entre o trabalho de cada negócio e as pessoas a quem se destina.",
  ],
};

/** The light runs 2.5 times as fast as the service copy's (the user's
    ask): over each paragraph in this long, starting this long after the
    fonts are in, the second as the first finishes. */
const SPEED = 2.5;
const LIGHT_MS = 1500 / SPEED;
const LIGHT_AT_MS = [450 / SPEED, 1500 / SPEED];

/** The statement's ground: one photograph at two widths. */
const PHOTO = {
  small: "/about/folds-1280.webp",
  large: "/about/folds-2400.webp",
};

export function AboutHero() {
  const reduce = useReducedMotion() ?? false;
  const fonts = useFontsReady();
  const t = useT();

  return (
    <section
      aria-labelledby="about-title"
      className="abt-hero relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink text-paper"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PHOTO.large}
        srcSet={`${PHOTO.small} 1280w, ${PHOTO.large} 2400w`}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        draggable={false}
        fetchPriority="high"
        className="abt-hero-photo absolute inset-0 -z-20 size-full object-cover select-none"
      />
      <span aria-hidden="true" className="abt-hero-scrim absolute inset-0 -z-10" />
      <span aria-hidden="true" className="abt-grain absolute inset-0 -z-10" />

      <div className="shell flex w-full justify-center pt-28 pb-20 md:pt-32 md:pb-24">
        <h1 id="about-title" className="sr-only">
          {t("About Nevima", "Sobre a Nevima")}
        </h1>
        <div className="abt-statement">
          {t(STATEMENT).map((text, i) =>
            fonts && !reduce ? (
              <Illuminated
                key={i}
                text={text}
                delayMs={LIGHT_AT_MS[i]}
                durationMs={LIGHT_MS}
                reduce={reduce}
                className="svc-copy abt-statement-p"
              />
            ) : (
              <p
                key={i}
                data-lit={reduce ? "true" : undefined}
                className="svc-copy abt-statement-p"
              >
                {text}
              </p>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
