"use client";

import { useReducedMotion } from "motion/react";
import { Illuminated } from "./services";
import { useFontsReady } from "./use-seen";

/* ==================================================================
   About, the opening statement

   One screen of stone, in black and white, with the statement set over
   it in the middle: justified, each paragraph's last line centred under
   the block, so the words stand as one slab on the slab.

   The photograph (Liz Grin, on Unsplash) is ground, not picture: taken
   well down and looked at through a fine grain, so the white type is the
   brightest thing on it and the stone only shows where the words leave
   room.

   The copy is lit as the service copy is, grey to white, one line after
   another, the second paragraph picking the light up as the first one
   finishes. It is only measured once the fonts are in, because the lines
   it lights are the lines the browser wrapped.

   The words are a stand-in: the studio has not written its statement
   yet. They follow the shape of the reference it found (what the
   business is, the gap, what the gap costs) in the studio's own terms.
   ================================================================== */

const STATEMENT = [
  "Good businesses are rarely short of quality. They are short of a presence that shows it. The clinics, agencies and independent professionals we work with have built something real, yet their website still introduces a smaller version of them.",
  "Closing that gap is our whole job: two people, the right tools, and nothing standing between your work and the people it is for.",
];

/** When each paragraph starts to light, from the moment the fonts are in. */
const LIGHT_AT_MS = [450, 1500];

export function AboutHero() {
  const reduce = useReducedMotion() ?? false;
  const fonts = useFontsReady();

  return (
    <section
      aria-labelledby="about-title"
      className="abt-hero relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink text-paper"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/about/stone-2400.jpg"
        srcSet="/about/stone-1280.jpg 1280w, /about/stone-2400.jpg 2400w"
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
          About Nevima
        </h1>
        <div className="abt-statement">
          {STATEMENT.map((text, i) =>
            fonts && !reduce ? (
              <Illuminated
                key={i}
                text={text}
                delayMs={LIGHT_AT_MS[i]}
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
