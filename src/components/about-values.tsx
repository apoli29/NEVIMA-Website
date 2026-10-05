"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { useInkAlign } from "./ink-align";
import { useSeen } from "./use-seen";
import { useValuesWater, type ValuesControl } from "./values-water";

/* ==================================================================
   Values

   The second screen's water again, white under a moving sheet of it,
   with the section's title and its subtitle at the head (title on the
   left, subtitle justified on the right, level with it), and under them
   four drops of black glass lying on the water, one to a value, with no
   names: what each drop stands for is only found by choosing it.

   So the drops have to ask to be pressed. The cue is a callout of the
   kind films draw over a camera feed when a target is picked out: from
   the edge of one drop a fine line runs off at an angle, turns level,
   and "Click here" is written along the level stretch, the line under it
   as its underline. Until a first choice it moves from drop to drop, a
   ring striking the water where it lands; the drop under the pointer
   takes it and swells a little; once the four are together it points
   at the piece they made and says how to let them go.

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

/** What the callout points at: a drop, or the piece the four made. */
type Aim = { kind: "drop"; i: number } | { kind: "piece" } | null;

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

  // The callout: on the drop under the pointer if there is one, else on
  // the drop that is calling, else (once joined) on the piece.
  const [hovered, setHovered] = useState<number | null>(null);
  const [calling, setCalling] = useState<number | null>(null);
  const aim: Aim = joined
    ? { kind: "piece" }
    : chosen !== null
      ? null
      : hovered !== null
        ? { kind: "drop", i: hovered }
        : calling !== null
          ? { kind: "drop", i: calling }
          : null;

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
  control.current.onBeckon = (i) => setCalling(i);

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
    setCalling(null);
    setHovered(null);
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
      // While the four are together, a press anywhere on the water lets
      // them go: on a phone there is no Esc, and the piece is not the only
      // thing a thumb will aim at.
      onClick={() => {
        if (joined) part();
      }}
      data-joined={joined ? "" : undefined}
      className="abt-val relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-paper pt-(--section-gap)"
    >
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="absolute inset-0 -z-10 block size-full"
      />

      <div className="shell flex flex-1 flex-col pb-[clamp(2.5rem,7svh,5rem)]">
        {/* Side by side from md: the title on the left, the subtitle
            justified on the right, its first line level with the top of
            the title's (see ink-align.ts). */}
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
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
          <SlideIn ready from="right" delay={0.12} className="w-full max-w-[20rem] shrink-0">
            <p ref={subRef} className="abt-val-sub text-[0.9375rem] leading-[1.45] text-ash">
              Pick one to see what it means. None of them works alone, so
              they never stay apart for long.
            </p>
          </SlideIn>
        </div>

        <div ref={field} className="relative flex flex-1 items-center py-14 md:py-16">
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
                  aria-pressed={chosen === i}
                  aria-controls="value-drop"
                  aria-label={v.name}
                  // While the four are together, the piece they made is the
                  // one thing to press.
                  disabled={chosen !== null}
                  onClick={(event) => choose(i, event)}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "mouse" || chosen !== null) return;
                    control.current.hover = i;
                    setHovered(i);
                    tell("values:change");
                  }}
                  onPointerLeave={() => {
                    if (control.current.hover === i) control.current.hover = -1;
                    setHovered((h) => (h === i ? null : h));
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
              so they always know the size they are going to; seen only
              once they have met (its opacity is set by the water). */}
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
      </div>

      {!reduce && on && (
        <Callout
          aim={aim}
          label={aim?.kind === "piece" ? `${press} to close` : `${press} here`}
          section={section}
          slots={control.current.slots}
          piece={mergedRef}
        />
      )}

      <p className="sr-only" aria-live="polite">
        {joined ? `${value.name}. ${value.text}` : ""}
      </p>
    </section>
  );
}

/* ================================================================== */
/* The callout                                                          */
/* ================================================================== */

/** Where the callout is drawn, in the section's pixels: the point on the
    target it starts from, the corner where it turns level, how long the
    level run is and which way it goes. */
type Lead = { ax: number; ay: number; bx: number; by: number; run: number; dir: 1 | -1 };

/** How far up and out the slanted stretch runs, and the level run. */
const RISE = 46;
const RUN = 128;

function Callout({
  aim,
  label,
  section,
  slots,
  piece,
}: {
  aim: Aim;
  label: string;
  section: React.RefObject<HTMLElement | null>;
  slots: (HTMLElement | null)[];
  piece: React.RefObject<HTMLButtonElement | null>;
}) {
  const [lead, setLead] = useState<Lead | null>(null);
  const key = aim ? (aim.kind === "drop" ? `drop-${aim.i}` : "piece") : "none";

  // Measured from the page whenever the target changes, and again if the
  // window does, so it is always drawn off the drop where it now is.
  useLayoutEffect(() => {
    const measure = () => {
      const box = section.current?.getBoundingClientRect();
      if (!aim || !box) return setLead(null);
      if (aim.kind === "drop") {
        const el = slots[aim.i];
        if (!el) return setLead(null);
        const b = el.getBoundingClientRect();
        const cx = b.left - box.left + b.width / 2;
        const cy = b.top - box.top + b.height / 2;
        // Off the right of the drop, unless that would run off the screen.
        const dir: 1 | -1 = cx + b.width * 0.4 + RISE + RUN > box.width - 16 ? -1 : 1;
        // From the drop's edge, up and outwards at forty-five degrees.
        const reach = b.width * 0.3;
        const ax = cx + dir * reach;
        const ay = cy - reach;
        const bx = ax + dir * RISE;
        const room = dir === 1 ? box.width - 16 - bx : bx - 16;
        setLead({ ax, ay, bx, by: ay - RISE, run: Math.min(RUN, room), dir });
      } else {
        const el = piece.current;
        if (!el) return setLead(null);
        const r = el.getBoundingClientRect();
        // The piece reaches past the words' box by the margin it is laid
        // out with (see measure() in values-water.ts).
        const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
        const b = {
          left: r.left - 0.9 * fs,
          right: r.right + 0.9 * fs,
          top: r.top - 1.1 * fs,
          width: r.width + 1.8 * fs,
        };
        const left = b.left - box.left;
        const right = b.right - box.left;
        const need = RISE + RUN + 24;
        // Off whichever end of the piece has room; where neither has (a
        // phone), up off its top, towards the wider side.
        let ax: number;
        let ay = b.top - box.top - 4;
        let dir: 1 | -1;
        if (box.width - right >= need) {
          dir = 1;
          ax = right + 4;
        } else if (left >= need) {
          dir = -1;
          ax = left - 4;
        } else {
          dir = right > box.width - left ? -1 : 1;
          ax = dir === -1 ? right - b.width * 0.18 : left + b.width * 0.18;
          ay = b.top - box.top - 2;
        }
        const bx = ax + dir * RISE;
        const room = dir === 1 ? box.width - 16 - bx : bx - 16;
        setLead({ ax, ay, bx, by: ay - RISE, run: Math.min(RUN + 24, room), dir });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {aim && lead && (
        <motion.svg
          key={key}
          aria-hidden="true"
          className="abt-callout pointer-events-none absolute inset-0 z-10 size-full overflow-visible"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
        >
          {/* The mark on the target: a dot in a ring. */}
          <motion.circle
            cx={lead.ax}
            cy={lead.ay}
            r={7}
            className="abt-callout-ring"
            initial={{ scale: 2.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${lead.ax}px ${lead.ay}px` }}
          />
          <circle cx={lead.ax} cy={lead.ay} r={2.5} className="abt-callout-dot" />
          {/* The leader: up and out at an angle, then level. */}
          <motion.path
            d={`M ${lead.ax} ${lead.ay} L ${lead.bx} ${lead.by} L ${lead.bx + lead.dir * lead.run} ${lead.by}`}
            className="abt-callout-line"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.65, 0, 0.35, 1] }}
          />
          {/* Written along the level run, the line under it as its
              underline, as it is drawn out. */}
          <text
            x={lead.dir === 1 ? lead.bx + 2 : lead.bx - 2}
            y={lead.by - 8}
            textAnchor={lead.dir === 1 ? "start" : "end"}
            className="abt-callout-text"
          >
            <Typed text={label} delayMs={400} />
          </text>
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

/* Written out a letter at a time, as a readout on a screen is. */
function Typed({ text, delayMs }: { text: string; delayMs: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        setN((v) => {
          if (v >= text.length) window.clearInterval(id);
          return Math.min(v + 1, text.length);
        });
      }, 32);
    }, delayMs);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [text, delayMs]);
  return <>{text.slice(0, n)}</>;
}
