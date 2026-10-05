"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { useInkAlign } from "./ink-align";
import { useSeen } from "./use-seen";
import { useValuesWater, type ValuesControl } from "./values-water";

/* ==================================================================
   Values

   The second screen's water again, white under a moving sheet of it,
   with four drops of black glass lying on it, one to a value, each with
   its name under it as a wall label. Choosing one pulls all four
   together into a single drop, the site's call-to-action drop, which
   carries the value chosen in white (see values-water.ts). The values
   are not four separate claims: each only holds with the other three,
   and the join is that said without words. Pressing the drop, or Esc,
   lets the four go back to where they lay.

   The four come from what the studio is built on. Less is more is the
   philosophy (Less, on purpose); being two people means the client
   speaks with whoever does the work (Direct line); leverage is not
   doing less but wasting nothing (Fast, not rushed); and modern tools,
   kept up with, are what make two people enough (Always current).

   The drops are drawn on a canvas; what is pressed is a real button set
   exactly under each one, so the page works from the keyboard and to a
   screen reader as it does to the pointer.
   ================================================================== */

const VALUES = [
  {
    id: "less",
    name: "Less, on purpose",
    text: "Every page, every step and every pixel has to earn its place. What doesn’t, we leave out.",
  },
  {
    id: "direct",
    name: "Direct line",
    text: "You talk to the two people who design and build your website. No account managers, no feedback lost on the way.",
  },
  {
    id: "fast",
    name: "Fast, not rushed",
    text: "We cut waste, never care. The speed comes from focus and the right tools, not from shortcuts.",
  },
  {
    id: "current",
    name: "Always current",
    text: "We keep up with the tools and with how people search, from Google to AI, so your business doesn’t fall behind.",
  },
] as const;

export function AboutValues() {
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const mergedRef = useRef<HTMLButtonElement>(null);
  useInkAlign(titleRef, subRef);
  const seen = useSeen(field, { threshold: 0.35 });

  // The value on show, from the moment it is chosen until the four are
  // back where they lay; and whether the real drop has fully taken over.
  const [chosen, setChosen] = useState<number | null>(null);
  const [joined, setJoined] = useState(false);
  // Whether focus should come back to the chosen drop once they part, and
  // which one that is.
  const returnFocus = useRef(false);
  const focusBack = useRef<number | null>(null);

  const control = useRef<ValuesControl>({
    target: 0,
    lead: 0,
    slots: [],
    merged: null,
    remeasure: true,
    onJoined: () => {},
    onParted: () => {},
  });

  const tell = useCallback((name: string, detail?: number) => {
    section.current?.dispatchEvent(new CustomEvent(name, { detail }));
  }, []);

  control.current.onJoined = () => setJoined(true);

  // Once the drop they made can be pressed, it holds the focus.
  useEffect(() => {
    if (joined) mergedRef.current?.focus({ preventScroll: true });
  }, [joined]);
  control.current.onParted = () => {
    focusBack.current = returnFocus.current ? control.current.lead : null;
    returnFocus.current = false;
    setChosen(null);
  };

  // Once the buttons are pressable again.
  useEffect(() => {
    if (chosen !== null || focusBack.current === null) return;
    buttons.current[focusBack.current]?.focus({ preventScroll: true });
    focusBack.current = null;
  }, [chosen]);

  useValuesWater(canvas, control, reduce);

  // The real drop is laid out with the chosen value's words before the
  // four set off, so they travel to the size it will actually be.
  useLayoutEffect(() => {
    control.current.merged = mergedRef.current;
    control.current.remeasure = true;
  }, [chosen]);

  const choose = (i: number, event: MouseEvent<HTMLButtonElement>) => {
    if (chosen !== null) return;
    setChosen(i);
    control.current.lead = i;
    control.current.target = 1;
    // From the keyboard there is no click on the water, so the drop
    // strikes it itself.
    if (event.detail === 0) tell("values:pick", i);
    tell("values:change");
  };

  const part = useCallback(() => {
    if (control.current.target === 0) return;
    returnFocus.current = mergedRef.current === document.activeElement;
    control.current.target = 0;
    setJoined(false);
    tell("values:change");
  }, [tell]);

  useEffect(() => {
    if (chosen === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") part();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chosen, part]);

  const value = VALUES[chosen ?? 0];
  const on = seen || reduce;

  return (
    <section
      ref={section}
      id="values"
      aria-labelledby="values-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-paper pt-(--section-gap)"
    >
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="absolute inset-0 -z-10 block size-full"
      />

      <div className="shell flex flex-1 flex-col pb-[clamp(2.5rem,7svh,5rem)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <SlideIn ready>
            <h2
              ref={titleRef}
              id="values-title"
              className="display text-[clamp(2.25rem,4.2vw,4.25rem)] text-ink"
            >
              <span className="block font-light">Four values.</span>
              <span className="block font-medium">One way of working.</span>
            </h2>
          </SlideIn>
          <SlideIn ready from="right" delay={0.12} className="max-w-[18rem] shrink-0 lg:text-right">
            <p ref={subRef} className="text-[0.9375rem] leading-[1.45] text-balance text-ash">
              Pick one to see what it means. None of them works alone, so
              they never stay apart for long.
            </p>
          </SlideIn>
        </div>

        <div
          ref={field}
          className="relative flex flex-1 items-center py-16 md:py-20"
        >
          <ul
            aria-label="Values"
            data-chosen={chosen === null ? undefined : ""}
            className="abt-val-list grid w-full grid-cols-2 gap-y-14 md:grid-cols-4"
          >
            {VALUES.map((v, i) => (
              <motion.li
                key={v.id}
                className="flex justify-center"
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={{ duration: 0.6, delay: reduce ? 0 : 0.2 + i * 0.12 }}
              >
                <button
                  ref={(el) => {
                    buttons.current[i] = el;
                  }}
                  type="button"
                  aria-pressed={chosen === i}
                  aria-controls="value-drop"
                  // While the four are together, the drop they made is the
                  // one thing to press.
                  disabled={chosen !== null}
                  onClick={(event) => choose(i, event)}
                  className="abt-val-slot group flex flex-col items-center gap-8 md:gap-10"
                >
                  <span
                    ref={(el) => {
                      control.current.slots[i] = el;
                    }}
                    aria-hidden="true"
                    className="abt-val-hit block rounded-full"
                  />
                  <span className="abt-val-label mono-label text-ink">{v.name}</span>
                </button>
              </motion.li>
            ))}
          </ul>

          {/* Where the four meet. Always laid out, so they always know the
              size they are going to; seen only once they have met (its
              opacity is set by the water, frame by frame). */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center px-1">
            <button
              ref={mergedRef}
              id="value-drop"
              type="button"
              onClick={part}
              inert={!joined}
              data-joined={joined ? "" : undefined}
              style={{ opacity: 0 }}
              className="abt-val-drop cta-drop drop-shell"
            >
              <span className="abt-val-name display block">{value.name}</span>
              <span className="abt-val-text block">{value.text}</span>
              <span className="sr-only">. Press to see all four values again.</span>
            </button>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mono-label text-center text-ash-2 transition-opacity duration-500"
          style={{ opacity: on ? 1 : 0 }}
        >
          {joined ? "Press the drop to let go" : chosen === null ? "Pick a drop" : " "}
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {joined ? `${value.name}. ${value.text}` : ""}
      </p>
    </section>
  );
}
