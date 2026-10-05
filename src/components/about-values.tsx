"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSeen } from "./use-seen";
import { useValuesWater, type ValuesControl } from "./values-water";

/* ==================================================================
   Values

   The second screen's water again, white under a moving sheet of it,
   with four drops of black glass lying on it, one to a value, and
   nothing else: no title, no names. What each drop stands for is only
   found by choosing it (the user asked for the four on their own).

   So the drops have to ask to be pressed, and the cue is laid on three
   ways at once, because the user wanted it all but impossible to miss.
   Until a first choice, one drop at a time swells and strikes the water
   as if touched, and a small black tag saying "Click" (or "Tap", where
   there is no pointer to hover with) comes up beside it; the drop under
   the pointer swells and holds; and over a drop the tag follows the
   pointer itself. The pointer is the hand.

   Choosing one pulls all four together into a single uneven piece of
   glass, and the value chosen is set on it in white (see
   values-water.ts). The values are not four separate claims: each only
   holds with the other three, and the join is that said without words.
   A press anywhere on the water, or Esc, lets the four go back.

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

/** How long the tag stays up beside a drop that is calling, in ms. */
const CALL_TAG_MS = 1700;

/** Where the tag is, in the section's pixels, and what it says. */
type Tag = { x: number; y: number; label: string; key: string } | null;

export function AboutValues() {
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const mergedRef = useRef<HTMLButtonElement>(null);
  const seen = useSeen(field, { threshold: 0.35 });

  // The value on show, from the moment it is chosen until the four are
  // back where they lay; and whether the words are fully in on the piece.
  const [chosen, setChosen] = useState<number | null>(null);
  const [joined, setJoined] = useState(false);
  // Whether focus should come back to the chosen drop once they part, and
  // which one that is.
  const returnFocus = useRef(false);
  const focusBack = useRef<number | null>(null);

  // "Click" where there is a pointer that can hover, "Tap" where there is
  // not. Read once mounted: the server cannot know.
  const [press, setPress] = useState("Click");
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) setPress("Tap");
  }, []);

  // The tag: following the pointer over a drop, or up beside the drop
  // that is calling. The pointer's place wins.
  const [pointerTag, setPointerTag] = useState<Tag>(null);
  const [callTag, setCallTag] = useState<Tag>(null);
  const tag = pointerTag ?? callTag;

  const control = useRef<ValuesControl>({
    target: 0,
    lead: 0,
    slots: [],
    merged: null,
    remeasure: true,
    beckon: true,
    hover: -1,
    onJoined: () => {},
    onParted: () => {},
    onBeckon: () => {},
  });

  const tell = useCallback((name: string, detail?: number) => {
    section.current?.dispatchEvent(new CustomEvent(name, { detail }));
  }, []);

  control.current.onJoined = () => setJoined(true);
  control.current.onParted = () => {
    focusBack.current = returnFocus.current ? control.current.lead : null;
    returnFocus.current = false;
    setChosen(null);
  };
  control.current.onBeckon = (i) => {
    const hit = control.current.slots[i];
    const box = section.current?.getBoundingClientRect();
    if (!hit || !box) return;
    const b = hit.getBoundingClientRect();
    // Up and to the right of the drop, where a hand would come from.
    setCallTag({
      x: b.right - box.left - b.width * 0.12,
      y: b.top - box.top + b.height * 0.08,
      label: press,
      key: `call-${i}-${Date.now()}`,
    });
  };

  // A call's tag comes down again after a moment.
  useEffect(() => {
    if (!callTag) return;
    const id = window.setTimeout(() => setCallTag(null), CALL_TAG_MS);
    return () => window.clearTimeout(id);
  }, [callTag]);

  // Once the piece they made can be pressed, it holds the focus.
  useEffect(() => {
    if (joined) mergedRef.current?.focus({ preventScroll: true });
  }, [joined]);

  // Once the buttons are pressable again.
  useEffect(() => {
    if (chosen !== null || focusBack.current === null) return;
    buttons.current[focusBack.current]?.focus({ preventScroll: true });
    focusBack.current = null;
  }, [chosen]);

  useValuesWater(canvas, control, reduce);

  // The words are laid out on the chosen value before the four set off,
  // so they travel to the size the piece will actually need.
  useLayoutEffect(() => {
    control.current.merged = mergedRef.current;
    control.current.remeasure = true;
  }, [chosen]);

  const choose = (i: number, event: MouseEvent<HTMLButtonElement>) => {
    if (chosen !== null) return;
    setChosen(i);
    setCallTag(null);
    setPointerTag(null);
    control.current.lead = i;
    control.current.target = 1;
    control.current.hover = -1;
    // Found once, the drops have done their asking.
    control.current.beckon = false;
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
    setPointerTag(null);
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

  /* The tag follows a mouse that is over a drop, or anywhere on the water
     while the four are together (where a press lets them go). */
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || reduce) return;
    const box = section.current?.getBoundingClientRect();
    if (!box) return;
    const over = (event.target as HTMLElement).closest<HTMLElement>("[data-drop]");
    const label = joined ? "Close" : chosen === null && over ? press : null;
    if (!label) {
      if (pointerTag) setPointerTag(null);
      return;
    }
    setPointerTag({
      x: event.clientX - box.left + 20,
      y: event.clientY - box.top - 40,
      label,
      key: "pointer",
    });
  };

  const value = VALUES[chosen ?? 0];
  const on = seen || reduce;

  return (
    <section
      ref={section}
      id="values"
      aria-labelledby="values-title"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setPointerTag(null)}
      // While the four are together, a press anywhere on the water lets
      // them go: on a phone there is no Esc, and the piece is not the only
      // thing a thumb will aim at.
      onClick={() => {
        if (joined) part();
      }}
      data-joined={joined ? "" : undefined}
      className="abt-val relative isolate flex min-h-[100svh] items-center overflow-hidden bg-paper"
    >
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="absolute inset-0 -z-10 block size-full"
      />

      <h2 id="values-title" className="sr-only">
        Our values
      </h2>

      <div ref={field} className="shell relative py-24">
        <ul
          aria-label="Values: choose one to read it"
          data-chosen={chosen === null ? undefined : ""}
          className="abt-val-list grid w-full grid-cols-2 gap-y-16 md:grid-cols-4"
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
                data-drop=""
                aria-pressed={chosen === i}
                aria-controls="value-drop"
                aria-label={v.name}
                // While the four are together, the piece they made is the
                // one thing to press.
                disabled={chosen !== null}
                onClick={(event) => choose(i, event)}
                onPointerEnter={() => {
                  if (chosen === null) control.current.hover = i;
                  tell("values:change");
                }}
                onPointerLeave={() => {
                  if (control.current.hover === i) control.current.hover = -1;
                }}
                className="abt-val-slot"
              >
                <span
                  ref={(el) => {
                    control.current.slots[i] = el;
                  }}
                  aria-hidden="true"
                  className="abt-val-hit block rounded-full"
                />
              </button>
            </motion.li>
          ))}
        </ul>

        {/* The value, set on the piece the four become. Always laid out,
            so they always know the size they are going to; seen only once
            they have met (its opacity is set by the water, frame by frame). */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-1">
          <button
            ref={mergedRef}
            id="value-drop"
            type="button"
            onClick={part}
            inert={!joined}
            data-joined={joined ? "" : undefined}
            style={{ opacity: 0 }}
            className="abt-val-drop"
          >
            <span className="abt-val-name display block">{value.name}</span>
            <span className="abt-val-text block">{value.text}</span>
            <span className="sr-only">. Press to see all four values again.</span>
          </button>
        </div>
      </div>

      {/* The tag. Drawn for the eye only: the buttons carry the names. */}
      <AnimatePresence>
        {tag && !reduce && (
          <motion.span
            key={tag.key}
            aria-hidden="true"
            className="abt-val-tag mono-label pointer-events-none absolute top-0 left-0 z-10"
            initial={{ opacity: 0, scale: 0.85, x: tag.x, y: tag.y + 6 }}
            animate={{ opacity: 1, scale: 1, x: tag.x, y: tag.y }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{
              opacity: { duration: 0.2 },
              scale: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              // Close behind the pointer, not stuck to it.
              x: { type: "spring", stiffness: 900, damping: 60 },
              y: { type: "spring", stiffness: 900, damping: 60 },
            }}
          >
            {tag.label}
          </motion.span>
        )}
      </AnimatePresence>

      <p className="sr-only" aria-live="polite">
        {joined ? `${value.name}. ${value.text}` : ""}
      </p>
    </section>
  );
}
