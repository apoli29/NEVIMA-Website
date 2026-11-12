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

   The words are the studio's own (user, 2026-11-12), written in
   Portuguese and adapted so they read naturally in English.
   ================================================================== */

const STATEMENT: Copy<string[]> = {
  en: [
    "Many local businesses and small and medium-sized companies can\u2019t grow, even with a product or service of enormous value. The reason? They have no website that shows that value and their essence and reaches the right audience, nor an internal digital infrastructure that makes the business more organized and more efficient.",
    "Our goal is to close that gap: to make sure small and medium-sized businesses can make the most of the boost digital can bring.",
  ],
  pt: [
    "Muitos negócios locais e pequenas e médias empresas não conseguem crescer, mesmo possuindo um produto ou serviço de enorme valor. O motivo? Não têm um website que demonstre o seu valor e a sua essência e que alcance o público certo, nem uma infraestrutura digital interna que torne o negócio mais organizado e mais eficiente.",
    "O nosso objetivo é fechar essa lacuna: garantir que os pequenos e médios negócios possam aproveitar o impulso que o digital pode trazer.",
  ],
};

/** The light runs 2.5 times as fast as the service copy's (the user's
    ask): over each paragraph in this long, starting this long after the
    fonts are in, the second as the first finishes. */
const SPEED = 2.5;
const LIGHT_MS = 1500 / SPEED;
const LIGHT_AT_MS = [450 / SPEED, 1500 / SPEED];

/** The statement's ground: one photograph at four widths, so a phone with a
    dense screen takes the 1600 or the 1920 rather than the 2400 (1.2 MB). */
const PHOTO = {
  small: "/about/folds-1280.webp",
  mid: "/about/folds-1600.webp",
  wide: "/about/folds-1920.webp",
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
        srcSet={`${PHOTO.small} 1280w, ${PHOTO.mid} 1600w, ${PHOTO.wide} 1920w, ${PHOTO.large} 2400w`}
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
