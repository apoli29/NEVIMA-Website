"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { Illuminated } from "./services";
import { useFontsReady, useSeen } from "./use-seen";

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

/** The light runs 2.5 times as fast as the service copy's (the user's
    ask): over each paragraph in this long, starting this long after the
    fonts are in, the second as the first finishes. */
const SPEED = 2.5;
const LIGHT_MS = 1500 / SPEED;
const LIGHT_AT_MS = [450 / SPEED, 1500 / SPEED];

/** A ground for the statement: one photograph at two widths. */
export type HeroPhoto = { small: string; large: string };

/* Two grounds, hung one after another for now so the studio can choose
   (both from Unsplash, both black and white): stone by Liz Grin, a
   swirl of light by Sudhanshu Singh. */
export const STONE: HeroPhoto = {
  small: "/about/stone-1280.jpg",
  large: "/about/stone-2400.jpg",
};
export const SWIRL: HeroPhoto = {
  small: "/about/swirl-1280.jpg",
  large: "/about/swirl-2400.jpg",
};

export function AboutHero({
  photo = STONE,
  first = true,
}: {
  photo?: HeroPhoto;
  /** The page's first screen, which carries its h1. The others (only
      while the photographs are being compared) are labelled, not titled. */
  first?: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const fonts = useFontsReady();
  const ref = useRef<HTMLElement>(null);
  // The first is lit on arrival; the others when they come into view.
  const seen = useSeen(ref, { threshold: 0.4, ready: !first });
  const lit = fonts && (first || seen);

  return (
    <section
      ref={ref}
      aria-labelledby={first ? "about-title" : undefined}
      aria-label={first ? undefined : "About Nevima, another photograph"}
      className="abt-hero relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink text-paper"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.large}
        srcSet={`${photo.small} 1280w, ${photo.large} 2400w`}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        draggable={false}
        fetchPriority={first ? "high" : "auto"}
        loading={first ? "eager" : "lazy"}
        className="abt-hero-photo absolute inset-0 -z-20 size-full object-cover select-none"
      />
      <span aria-hidden="true" className="abt-hero-scrim absolute inset-0 -z-10" />
      <span aria-hidden="true" className="abt-grain absolute inset-0 -z-10" />

      <div className="shell flex w-full justify-center pt-28 pb-20 md:pt-32 md:pb-24">
        {first && (
          <h1 id="about-title" className="sr-only">
            About Nevima
          </h1>
        )}
        <div className="abt-statement">
          {STATEMENT.map((text, i) =>
            lit && !reduce ? (
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
