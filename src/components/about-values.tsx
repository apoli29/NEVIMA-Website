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
import { PIECE_PAD, useValuesWater, type Point, type ValuesControl } from "./values-water";

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
   as its underline. It never stops while the four are apart: it moves
   from drop to drop, a ring striking the water where it lands, two up
   at once; the drop under the pointer only swells a little (no callout
   of its own: the moving one is cue enough, the user's ask); once the four are together it points at the piece they made
   and says how to let them go.

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

  // The callouts. While the four are apart they never stop: each drop
  // that calls keeps its callout through the next call, so two are up at
  // once, the older one going a moment before a third comes (timed by the
  // water, see values-water.ts). Once joined, a single one points at the
  // piece.
  const [calls, setCalls] = useState<{ i: number; id: number }[]>([]);

  const aims: { key: string; aim: NonNullable<Aim> }[] = joined
    ? [{ key: "piece", aim: { kind: "piece" } }]
    : chosen !== null
      ? []
      : [
          ...calls.map((c) => ({ key: `call-${c.id}`, aim: { kind: "drop" as const, i: c.i } })),        ];

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
    onBeckonEnd: () => {},
    edge: () => null,
  });
  const edge = useCallback<ValuesControl["edge"]>((i, a, from) => control.current.edge(i, a, from), []);

  const tell = useCallback((name: string, detail?: number) => {
    section.current?.dispatchEvent(new CustomEvent(name, { detail }));
  }, []);

  control.current.onJoined = () => setJoined(true);
  control.current.onParted = () => {
    focusBack.current = returnFocus.current ? control.current.lead : null;
    returnFocus.current = false;
    setChosen(null);
  };
  control.current.onBeckon = (i, id) =>
    setCalls((c) => [...c.filter((x) => x.i !== i), { i, id }]);
  control.current.onBeckonEnd = (id) => setCalls((c) => c.filter((x) => x.id !== id));


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
    setCalls([]);
    control.current.lead = i;
    control.current.target = 1;
    control.current.hover = -1;
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
  // Where each callout up on the water was drawn, so a new one can keep
  // clear of them (see Callout).
  const placed = useRef(new Map<string, Lead>());

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
      className="abt-val relative isolate flex flex-col overflow-hidden bg-paper pt-[calc(var(--section-gap)*0.85)]"
    >
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="absolute inset-0 -z-10 block size-full"
      />

      {/* A little less room above than a section's usual head room, and
          below as much as it takes for the space under the drops (whose
          glass reaches past their buttons) to match the space over the
          title, so the heading and the drops sit as one piece in the
          middle of the water. */}
      <div className="shell flex flex-col pb-[3.25rem] md:pb-[8rem]">
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

        {/* Room above the drops for the callouts, and enough height
            either way for the piece the four become. */}
        <div ref={field} className="relative flex items-center pt-24 pb-10 md:pt-28 md:pb-12">
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
        <AnimatePresence>
          {aims.map(({ key, aim }) => (
            <Callout
              key={key}
              id={key}
              placed={placed.current}
              aim={aim}
              label={aim.kind === "piece" ? `${press} to close` : `${press} here`}
              section={section}
              slots={control.current.slots}
              edge={edge}
              piece={mergedRef}
            />
          ))}
        </AnimatePresence>
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
    level run is and which way it goes. A drop's callout also says which
    drop and which way out from its middle, so its start can stay on the
    glass as the glass moves. */
type Lead = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  run: number;
  dir: 1 | -1;
  track?: { i: number; a: number; from?: Point };
};
/* A leader runs up from the top of its target, or (to keep clear of a
   callout beside it) down from the bottom; either way its words sit on
   its level run. by < ay going up, by > ay going down. */

/** How far up and out the piece's slanted stretch runs, and the level
    run. A drop's callout that would run into another rises a step
    higher, so the two are written at different heights. */
const RISE = 46;
const RISE_STEP = 40;
const RUN = 128;
/** The least level run the words fit along. */
const MIN_RUN = 90;
/** Where the drops' level runs lie, as a share of a drop's button width
    from its middle: every label in a row on the one line, clear of the
    glass however the drops have turned. Under the drops the words sit
    over the line, so it goes their height further down. */
const LINE = 0.56;
const WORDS_H = 22;
/** The least slanted stretch, should the glass reach near the line. */
const MIN_RISE = 18;

/** The leader's path: from the mark, out at an angle, then level. */
const pathOf = (x: number, y: number, l: Lead) =>
  `M ${x} ${y} L ${l.bx} ${l.by} L ${l.bx + l.dir * l.run} ${l.by}`;

type Box = { l: number; r: number; t: number; b: number };

/** What a callout covers: its slanted stretch, and its level run with
    the words over it. */
function boxesOf(lead: Lead): Box[] {
  const end = lead.bx + lead.dir * lead.run;
  return [
    {
      l: Math.min(lead.ax, lead.bx),
      r: Math.max(lead.ax, lead.bx),
      t: Math.min(lead.ay, lead.by),
      b: Math.max(lead.ay, lead.by),
    },
    { l: Math.min(lead.bx, end), r: Math.max(lead.bx, end), t: lead.by - 24, b: lead.by + 2 },
  ];
}

function collides(a: Lead, b: Lead) {
  const pad = 8;
  return boxesOf(a).some((x) =>
    boxesOf(b).some(
      (y) => x.l < y.r + pad && x.r + pad > y.l && x.t < y.b + pad && x.b + pad > y.t,
    ),
  );
}

function Callout({
  id,
  placed,
  aim,
  label,
  section,
  slots,
  edge,
  piece,
}: {
  id: string;
  /** Every callout up, by id: read to keep clear of, written once placed. */
  placed: Map<string, Lead>;
  aim: NonNullable<Aim>;
  label: string;
  section: React.RefObject<HTMLElement | null>;
  slots: (HTMLElement | null)[];
  /** Where a drop's glass is drawn (see ValuesControl). */
  edge: ValuesControl["edge"];
  piece: React.RefObject<HTMLButtonElement | null>;
}) {
  const [lead, setLead] = useState<Lead | null>(null);
  const mark = useRef<SVGGElement>(null);
  const leader = useRef<SVGPathElement>(null);
  const key = aim.kind === "drop" ? `drop-${aim.i}` : "piece";

  // Measured from the page whenever the target changes, and again if the
  // window does, so it is always drawn off the drop where it now is.
  useLayoutEffect(() => {
    const measure = () => {
      const sec = section.current;
      const box = sec?.getBoundingClientRect();
      if (!sec || !box) return setLead(null);
      // The callout keeps inside the page's columns, as everything else
      // on the wall does: the shell's content edges, in section pixels.
      const shell = sec.querySelector<HTMLElement>(".shell");
      const pad = shell ? parseFloat(getComputedStyle(shell).paddingLeft) || 16 : 16;
      const sb = shell?.getBoundingClientRect();
      const minX = sb ? sb.left - box.left + pad : 16;
      const maxX = sb ? sb.right - box.left - pad : box.width - 16;
      if (aim.kind === "drop") {
        const el = slots[aim.i];
        if (!el) return setLead(null);
        const b = el.getBoundingClientRect();
        const cx = b.left - box.left + b.width / 2;
        const cy = b.top - box.top + b.height / 2;
        const i = aim.i;
        // From the drop's outline where the glass is drawn (its button is
        // only roughly where), up and outwards at forty-five degrees to the
        // row's line, then level along it.
        const make = (dir: 1 | -1, step: number, down = false): Lead => {
          const v = down ? 1 : -1;
          const a = Math.atan2(v, dir);
          const at = edge(i, a) ?? {
            x: cx + dir * b.width * 0.3,
            y: cy + v * b.width * 0.3,
          };
          const line = cy + v * (b.width * LINE + step + (down ? WORDS_H : 0));
          const rise = Math.max(MIN_RISE, v * (line - at.y));
          const bx = at.x + dir * rise;
          const room = dir === 1 ? maxX - bx : bx - minX;
          return {
            ax: at.x,
            ay: at.y,
            bx,
            by: at.y + v * rise,
            run: Math.min(RUN, room),
            dir,
            track: { i, a },
          };
        };
        // Up and off the right of the drop, unless that would run off the
        // screen; then up the other way; then down off its foot either
        // way; then a step higher. Whichever first keeps clear of the
        // callouts already up wins: two side by side once pointed at each
        // other and wrote over each other.
        const first: 1 | -1 = cx + b.width * LINE + RUN > maxX ? -1 : 1;
        const other = -first as 1 | -1;
        const others = [...placed].filter(([k]) => k !== id).map(([, l]) => l);
        const tries = [
          make(first, 0),
          make(other, 0),
          make(first, 0, true),
          make(other, 0, true),
          make(first, RISE_STEP),
          make(other, RISE_STEP),
        ].filter((l) => l.run >= MIN_RUN);
        const pick = tries.find((l) => !others.some((o) => collides(l, o))) ?? tries[0] ?? make(first, 0);
        placed.set(id, pick);
        setLead(pick);
      } else {
        const el = piece.current;
        if (!el) return setLead(null);
        const r = el.getBoundingClientRect();
        // The piece reaches past the words' box by the margin it is laid
        // out with (see measure() in values-water.ts).
        const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
        const left = r.left - box.left - PIECE_PAD.x * fs;
        const right = r.right - box.left + PIECE_PAD.x * fs;
        const top = r.top - box.top - PIECE_PAD.y * fs;
        const width = right - left;
        const half = r.height / 2 + PIECE_PAD.y * fs;
        const cy = top + half;
        const need = RISE + RUN + 24;
        // Off whichever end of the piece has room, from its upper shoulder;
        // where neither has (a phone), up off its top, towards the wider
        // side. Found on the outline from a point inside the glass, out
        // the way the leader goes.
        let from: Point;
        let a: number;
        let dir: 1 | -1;
        if (maxX - right >= need) {
          dir = 1;
          from = { x: right - half, y: cy };
          a = -Math.PI / 4;
        } else if (left - minX >= need) {
          dir = -1;
          from = { x: left + half, y: cy };
          a = (-3 * Math.PI) / 4;
        } else {
          dir = right - minX > maxX - left ? -1 : 1;
          from = { x: dir === -1 ? right - width * 0.18 : left + width * 0.18, y: cy };
          a = -Math.PI / 2;
        }
        const at = edge(-1, a, from) ?? {
          x: from.x + Math.cos(a) * half,
          y: from.y + Math.sin(a) * half,
        };
        const bx = at.x + dir * RISE;
        const room = dir === 1 ? maxX - bx : bx - minX;
        const lead: Lead = {
          ax: at.x,
          ay: at.y,
          bx,
          by: at.y - RISE,
          run: Math.min(RUN + 24, room),
          dir,
          track: { i: -1, a, from },
        };
        placed.set(id, lead);
        setLead(lead);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      placed.delete(id);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // The mark stays on the glass: every frame it is set again where the
  // outline now is, and the slanted stretch with it, from there to the
  // corner. The corner and the words hold still.
  useEffect(() => {
    const track = lead?.track;
    if (!lead || !track) return;
    let frame = 0;
    const follow = () => {
      const at = edge(track.i, track.a, track.from);
      if (at) {
        mark.current?.setAttribute("transform", `translate(${at.x} ${at.y})`);
        leader.current?.setAttribute("d", pathOf(at.x, at.y, lead));
      }
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, [lead, edge]);

  if (!lead) return null;
  const fade = { opacity: 0, transition: { duration: 0.18 } };
  return (
    <>
      {/* The mark and the leader are drawn in difference: black on the
          water, white where they cross onto the glass, so the mark can sit
          right on a drop's outline and still be read whole. */}
      <motion.svg
        aria-hidden="true"
        className="abt-callout abt-callout-mark pointer-events-none absolute inset-0 z-10 size-full overflow-visible"
        initial={{ opacity: 1 }}
        exit={fade}
      >
        {/* The mark on the target: a dot in a ring. */}
        <g ref={mark} transform={`translate(${lead.ax} ${lead.ay})`}>
          <motion.circle
            r={7}
            className="abt-callout-ring"
            initial={{ scale: 2.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "0px 0px" }}
          />
          <circle r={2.5} className="abt-callout-dot" />
        </g>
        {/* The leader: up and out at an angle, then level. */}
        <motion.path
          ref={leader}
          d={pathOf(lead.ax, lead.ay, lead)}
          className="abt-callout-line"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.65, 0, 0.35, 1] }}
        />
      </motion.svg>
      {/* Written along the level run, the line under it as its
          underline, as it is drawn out. */}
      <motion.svg
        aria-hidden="true"
        className="abt-callout pointer-events-none absolute inset-0 z-10 size-full overflow-visible"
        initial={{ opacity: 1 }}
        exit={fade}
      >
        <text
          x={lead.dir === 1 ? lead.bx + 2 : lead.bx - 2}
          y={lead.by - 8}
          textAnchor={lead.dir === 1 ? "start" : "end"}
          className="abt-callout-text"
        >
          <Typed text={label} delayMs={400} />
        </text>
      </motion.svg>
    </>
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
