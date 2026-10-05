"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Illuminated } from "./services";
import { useFontsReady } from "./use-seen";

/* ==================================================================
   About, the opening statement

   One screen with the statement set over it in the middle: justified,
   each paragraph's last line centred under the block, so the words
   stand as one slab.

   Behind them, two black-and-white photographs take turns, each held
   for four seconds and crossing slowly into the other (the user's ask,
   for now: stone by Liz Grin and a swirl of light by Sudhanshu Singh,
   both on Unsplash). They are ground, not picture: half seen over the
   black and softened, so the white type is the only hard thing on the
   screen. For anyone who has asked for less motion the first one simply
   stays.

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

const STONE: HeroPhoto = {
  small: "/about/stone-1280.jpg",
  large: "/about/stone-2400.jpg",
};
const SWIRL: HeroPhoto = {
  small: "/about/swirl-1280.jpg",
  large: "/about/swirl-2400.jpg",
};
const PHOTOS = [STONE, SWIRL];

/** How long each photograph is held, in ms (the crossing is in CSS, see
    .abt-hero-slide). */
const HOLD_MS = 4000;

export function AboutHero() {
  const reduce = useReducedMotion() ?? false;
  const fonts = useFontsReady();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setShown((i) => (i + 1) % PHOTOS.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <section
      aria-labelledby="about-title"
      className="abt-hero relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink text-paper"
    >
      {PHOTOS.map((photo, i) => (
        <span
          key={photo.large}
          aria-hidden="true"
          data-shown={i === shown ? "" : undefined}
          className="abt-hero-slide absolute inset-0 -z-20"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.large}
            srcSet={`${photo.small} 1280w, ${photo.large} 2400w`}
            sizes="100vw"
            alt=""
            draggable={false}
            fetchPriority={i === 0 ? "high" : "auto"}
            className="abt-hero-photo size-full object-cover select-none"
          />
        </span>
      ))}
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
