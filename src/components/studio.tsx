"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ENTER_EASE } from "./enter";
import { Illuminated } from "./services";

/* ==================================================================
   Studio

   A screen of its own (2026-10-14), full at rest, in two halves from lg
   aligned on their last lines (user, same day):

   - on the left, the statement, large and justified, 40% of the page,
     read in ink: it waits in a pale grey and each word turns black as
     the page brings it up, at the pace of the scroll. After "two" the
     co-founders are set into the line, two round portraits in colour in
     a capsule: the section's way to the about page. Its last words are
     underlined by a stroke drawn as they are read;
   - on the right, wider and smaller, the pillar, justified, its answer
     run through with the black marker.

   The co-founders' full plates are on the about page (cofounders.tsx).
   ================================================================== */

/* Soft hyphens in the long words: justified in a narrow column, the
   lines can break inside them rather than open gaps around them. */
const STATEMENT =
  "Nevima is a studio of two young friends who go way back and share a fas\u00adci\u00adna\u00adtion with com\u00admu\u00adni\u00adca\u00adtion and web de\u00advel\u00adop\u00adment. We didn\u2019t set out to be one more studio doing more of the same, but to bring a com\u00adplete\u00adly dif\u00adfer\u00adent proposition.";

/* The pillar, up to and including the colon it turns on. */
const PILLAR =
  "Our pillar is efficiency, because we deliver elite results without long turnaround times. The secret is simple:";

/* And what follows it, which is run through with a black marker. */
// A non-breaking hyphen: "know-how" is never split across two lines.
const PILLAR_MARK = "the know\u2011how we have and using the right tools.";

/** How far out of the shell each half of the statement starts, in pixels. */
const ENTER_SHIFT = 56;

/* The pillar is lit once the section is in sight. */
const PILLAR_LIGHT_MS = 500;

const FOUNDERS = [
  { name: "Emanuel Costa", photo: "/cofounders/ec.webp", focus: "44% 45%" },
  { name: "António Policarpo", photo: "/cofounders/ap.webp", focus: "50% 48%" },
] as const;

/* The statement's words, and where it is given its two people and its
   stroke. */
const WORDS = STATEMENT.split(" ");
const PORTRAITS_AFTER = WORDS.indexOf("two");
/* "a completely different proposition." */
const STROKE_FROM = WORDS.findIndex((w) => w.startsWith("com\u00adplete")) - 1;

/* ================================================================== */

export function Studio({ ready }: { ready: boolean }) {
  return (
    <section
      id="studio"
      aria-labelledby="studio-title"
      // A section of its own (user, 2026-10-14): a whole screen, the copy
      // held in the middle of it, with at least a section's room above and
      // below, so it stands well clear of the second screen it is drawn
      // over and of the services under it. A little more room on top: the
      // bar hangs over that end. One layer above the services, so the
      // "Learn more" drop's glass and shadow are never cut off by their
      // ground.
      className="relative z-[11] flex min-h-[100svh] flex-col justify-center bg-paper pt-[calc(var(--section-gap)+2rem)] pb-(--section-gap)"
    >
      <div className="shell">
        <h2 id="studio-title" className="sr-only">
          About Nevima
        </h2>

        <div className="std-wrap">
          <Statement ready={ready} />
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Statement                                                           */
/* ================================================================== */

function Statement({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  // While the opening plays its stage is fixed and takes no room, so this
  // copy sits at the top of the page right behind the curtain: watched from
  // the start, the light would run where nobody can see it. The watch only
  // begins once the page has been handed back.
  useEffect(() => {
    if (!ready || seen) return;
    const copy = ref.current;
    if (!copy) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true);
      },
      { threshold: 0.45 },
    );
    watch.observe(copy);
    return () => watch.disconnect();
  }, [ready, seen]);

  const lit = seen || reduce;
  // Each half comes in from the edge it is set against and travels inwards,
  // so the sentence closes on itself. The fade is spent in the first third
  // and the slide carries on under it; the light follows once both have
  // arrived.
  const enter = (from: -1 | 1) => ({
    initial: false as const,
    animate: {
      opacity: lit ? 1 : 0,
      x: lit || reduce ? 0 : from * ENTER_SHIFT,
    },
    transition: {
      opacity: { duration: 0.42, ease: "easeOut" as const },
      x: { duration: 0.95, ease: ENTER_EASE },
    },
  });

  return (
    <div ref={ref} className="std-lede">
      {/* The measure the statement is sized from (see .std-statement). */}
      <motion.div className="std-copy std-measure" {...enter(-1)}>
        <InkStatement reduce={reduce} />
      </motion.div>

      {/* The pillar, with everything after the colon run through with a
          black marker: the answer is the one thing set out of black. */}
      <motion.div className="std-aside" {...enter(1)}>
        <LitCopy
          lit={lit}
          reduce={reduce}
          delayMs={PILLAR_LIGHT_MS}
          text={PILLAR}
          mark={PILLAR_MARK}
          className="svc-copy std-ink std-pillar"
        />
      </motion.div>
    </div>
  );
}

/* The statement, read in ink: each word turns from a pale grey to black
   as the page brings it up, one after another at the pace of the scroll.
   Done, it is simply black. */
function InkStatement({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 1.05", "end 1"] });
  const n = WORDS.length;
  // Each word takes a little longer than its share, so the ink runs on
  // as a soft front rather than word by word in steps.
  const at = (i: number) => i / (n + 2);
  const span = 2.5 / n;

  const word = (i: number) => (
    <InkWord key={i} progress={scrollYProgress} from={at(i)} span={span} reduce={reduce}>
      {WORDS[i]}
    </InkWord>
  );

  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    if (i === STROKE_FROM) {
      // The last words under one stroke, drawn as they are read.
      const under: React.ReactNode[] = [];
      for (let j = i; j < n; j++) under.push(word(j), j < n - 1 ? " " : null);
      out.push(
        <Stroke key="stroke" progress={scrollYProgress} from={at(i + 1)} to={Math.min(1, at(n - 1) + span)} reduce={reduce}>
          {under}
        </Stroke>,
      );
      break;
    } else if (i === PORTRAITS_AFTER) {
      // "two" and the two of them are held together, with no space the
      // justification could stretch between them: opened, the capsule
      // grows on from where it stands and never slides away from the word.
      out.push(
        <span key="two" className="std-two">
          {word(i)}
          <Portraits progress={scrollYProgress} from={at(i)} reduce={reduce} />
        </span>,
      );
    } else out.push(word(i));
    if (i < n - 1) out.push(" ");
  }

  return (
    <p ref={ref} className="svc-copy std-statement std-read">
      {out}
    </p>
  );
}

function InkWord({
  progress,
  from,
  span,
  reduce,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  span: number;
  reduce: boolean;
  children: string;
}) {
  const color = useTransform(progress, [from, from + span], ["rgba(0, 0, 0, 0.14)", "rgba(0, 0, 0, 1)"]);
  // In pieces, one per syllable where the word may break (each keeps its
  // soft hyphen at its end), so no piece is ever split across two lines
  // and each can be moved on its own when the paragraph is set anew (see
  // reset).
  return (
    <motion.span className="std-word" style={reduce ? undefined : { color }}>
      {children.split(/(?<=\u00ad)/).map((piece, i) => (
        <span key={i} className="std-piece">
          {piece}
        </span>
      ))}
    </motion.span>
  );
}

function Stroke({
  progress,
  from,
  to,
  reduce,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  reduce: boolean;
  children: React.ReactNode;
}) {
  const draw = useTransform(progress, [from, to], ["0%", "100%"]);
  // Drawn as the span's own background, so it runs on across a line break
  // like the words it is under.
  return (
    <motion.span className="std-stroke" style={reduce ? undefined : ({ "--draw": draw } as never)}>
      {children}
    </motion.span>
  );
}

/** How long the paragraph takes to settle into its new setting. */
const RESET_MS = 560;
const RESET_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* Where everything that moves when the paragraph is set anew stands on
   screen, as it is seen (mid-move included). */
type Seen = {
  line: DOMRect;
  pillar: DOMRect | null;
  capsule: DOMRect;
  pieces: DOMRect[];
  /** each piece's opacity, should it be seen halfway through a line change */
  shown: number[];
  ink: number;
  face: number;
};

/* The two of them, set into the line after "two": round portraits in
   colour in a capsule, inked in with the words around them. They are
   the section's way to the about page (user, 2026-10-14): every few
   seconds they give a shake, and pointed at (or reached from the
   keyboard) the capsule opens in the line: the two part, "Find out more
   about us" opens out between them and the words make room for it.

   Opening reflows the justified paragraph: words change lines, every
   line's spacing changes, the paragraph gains a line and the pillar,
   level with its last line, goes down with it. A browser does all that
   from one frame to the next, so it is done here as one move (user,
   2026-10-15: the words jumped to the next line): the paragraph is set
   in its new place at once and everything is carried there from where
   it was seen, every piece of every word on its own, the capsule's
   black stretching, the far portrait travelling with its end, the
   paragraph and the pillar sliding with the page around them, and the
   stroke under the last words drawn again once they have arrived.
   Closing is the same move back, and either can take over from the
   other halfway.

   The capsule is held to "two" (see InkStatement), so it only grows on
   from where it stands. Where its opened width sends the next word down
   a line, it grows on to the end of its own line, so that line stays
   full and the justification has no gap to throw open. It is held open
   until the pointer is clearly away from both where it was and where it
   now is (it opened and closed in a loop when the line threw it from
   under the pointer). A shake under way is eased out, not frozen at its
   tilt. */
function Portraits({
  progress,
  from,
  reduce,
}: {
  progress: MotionValue<number>;
  from: number;
  reduce: boolean;
}) {
  const [open, setOpen] = useState(false);
  const self = useRef<HTMLAnchorElement>(null);
  const shell = useRef<HTMLSpanElement>(null);
  const ink = useRef<HTMLSpanElement>(null);
  const say = useRef<HTMLSpanElement>(null);
  const words = useRef<HTMLSpanElement>(null);
  const far = useRef<HTMLSpanElement>(null);
  // Opened by the pointer, it closes once the pointer is away; from the
  // keyboard, once the focus moves on.
  const by = useRef<"pointer" | "focus">("pointer");
  // Where the capsule stood as it was opened, the room it opens to, the
  // shake's tilt at that moment, what was seen before the change, and the
  // moves under way.
  const was = useRef<DOMRect | null>(null);
  const width = useRef(0);
  const tilt = useRef("none");
  const seen = useRef<Seen | null>(null);
  const moves = useRef<Animation[]>([]);
  const gone = useRef<HTMLElement[]>([]);

  const parts = () => {
    const a = self.current;
    const line = a?.closest("p");
    if (!a || !line) return null;
    return {
      a,
      line,
      pillar: line.closest(".std-lede")?.querySelector<HTMLElement>(".std-aside > *") ?? null,
      pieces: [...line.querySelectorAll<HTMLElement>(".std-piece")],
      stroke: line.querySelector<HTMLElement>(".std-stroke"),
    };
  };

  const look = (): Seen | null => {
    const p = parts();
    const f = far.current;
    if (!p || !ink.current || !f) return null;
    const shift = parseFloat(getComputedStyle(f).translate) || 0;
    return {
      line: p.line.getBoundingClientRect(),
      pillar: p.pillar?.getBoundingClientRect() ?? null,
      capsule: p.a.getBoundingClientRect(),
      pieces: p.pieces.map((el) => el.getBoundingClientRect()),
      shown: p.pieces.map((el) => Number(getComputedStyle(el).opacity)),
      ink: ink.current.offsetWidth,
      face: f.offsetLeft + shift,
    };
  };

  const show = (how: "pointer" | "focus") => {
    const p = parts();
    const s = say.current;
    const w = words.current;
    if (open || !p || !s || !w) return;
    by.current = how;
    was.current = p.a.getBoundingClientRect();
    tilt.current = shell.current ? getComputedStyle(shell.current).transform : "none";
    seen.current = reduce ? null : look();

    // Set open for a moment with the line ragged: its breaks fall where
    // they will once open, and the room left at the end of the capsule's
    // line can be read.
    p.line.style.textAlign = "left";
    const own = w.offsetWidth;
    s.style.width = s.style.maxWidth = `${own}px`;
    s.style.marginInline = "0.06em";
    const capsule = p.a.getBoundingClientRect();
    const next = p.a.parentElement?.nextElementSibling?.getBoundingClientRect();
    const ends = !!next && next.top >= capsule.bottom;
    const lineEnd = p.line.getBoundingClientRect().right - parseFloat(getComputedStyle(p.line).paddingRight);
    width.current = own + (ends ? Math.max(0, Math.floor(lineEnd - capsule.right)) : 0);
    s.style.width = s.style.maxWidth = s.style.marginInline = "";
    p.line.style.textAlign = "";
    setOpen(true);
  };

  const hide = () => {
    seen.current = reduce ? null : look();
    setOpen(false);
  };

  // The paragraph set anew, and carried there from where it was seen.
  useLayoutEffect(() => {
    const s = say.current;
    const p = parts();
    if (!s || !p) return;
    const before = seen.current;
    seen.current = null;
    // Stand-ins still on their way out of a move cut short are let go
    // softly from where they are, never dropped.
    const leaving = gone.current.map((g) => {
      const look = getComputedStyle(g);
      return { g, translate: look.translate, opacity: look.opacity };
    });
    gone.current = [];
    moves.current.forEach((m) => m.cancel());
    moves.current = [];
    delete p.line.dataset.moving;

    s.style.width = s.style.maxWidth = open ? `${width.current}px` : "";
    const after = before && look();
    if (!before || !after) {
      leaving.forEach(({ g }) => g.remove());
      return;
    }

    const go = (el: Element, frames: Keyframe[]) =>
      moves.current.push(el.animate(frames, { duration: RESET_MS, easing: RESET_EASE }));
    const slide = (el: Element, b: DOMRect, n: DOMRect) => {
      const dx = b.left - n.left;
      const dy = b.top - n.top;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5)
        go(el, [{ translate: `${dx}px ${dy}px` }, { translate: "0 0" }]);
    };

    // The paragraph and the pillar, as the page around them moves.
    slide(p.line, before.line, after.line);
    if (p.pillar && before.pillar && after.pillar) slide(p.pillar, before.pillar, after.pillar);
    // Every piece, from where it was in the paragraph to where it is now,
    // set the way a line of type is: a line pushes its words along, and
    // those that no longer fit go on out past its end, keeping pace with
    // the word before them, while they come in at the start of the next
    // line, keeping pace with the word after them (going up a line, the
    // other way round). The paragraph is clipped at its sides while it
    // moves, so a word only ever leaves or enters at a margin, and no word
    // crosses another. The one going out is a stand-in drawn where it was;
    // the piece itself comes in. Pieces are inline, so they are moved by
    // their relative offsets.
    const type = getComputedStyle(p.line);
    const lh = parseFloat(type.lineHeight) || parseFloat(type.fontSize);
    const drift = 0.55 * parseFloat(type.fontSize);
    type Spot = { line: number; x: number; travel: number };
    const spot = (r: DOMRect, box: DOMRect) => ({
      line: Math.round((r.top - box.top) / lh),
      x: r.left - box.left,
    });
    const was2 = before.pieces.map((r) => spot(r, before.line));
    const now2 = after.pieces.map((r) => spot(r, after.line));
    // What keeps its line, and how far it goes along it; the capsule's end
    // counts, as it pushes the words after it.
    const stay: (Spot & { now: number })[] = [];
    was2.forEach((w, i) => {
      const n = now2[i];
      if (n && w.line === n.line) stay.push({ line: w.line, x: w.x, now: n.x, travel: n.x - w.x });
    });
    const capWas = spot(before.capsule, before.line);
    const capNow = spot(after.capsule, after.line);
    if (capWas.line === capNow.line) {
      const end = before.capsule.right - before.line.left;
      stay.push({ line: capWas.line, x: end - 1, now: after.capsule.right - after.line.left - 1, travel: after.capsule.right - after.line.left - end });
    }
    const pace = (line: number, x: number, side: "before" | "after", key: "x" | "now", way: number) => {
      const on = stay.filter((s) => s.line === line);
      const near = on
        .filter((s) => (side === "before" ? s[key] < x : s[key] > x))
        .sort((a, b) => (side === "before" ? b[key] - a[key] : a[key] - b[key]))[0];
      const t = (near ?? on[0])?.travel ?? 0;
      // Always on its way out, and at least a little.
      return way * Math.max(way * t, drift);
    };

    const ghosts: HTMLElement[] = leaving.map(({ g, translate, opacity }) => {
      g.style.translate = translate;
      g.style.opacity = opacity;
      moves.current.push(g.animate([{ opacity: 0 }], { duration: 200, fill: "forwards" }));
      return g;
    });
    // Whether the line broke after a piece, so it showed a hyphen.
    const broken = (i: number, at: { line: number }[]) =>
      (p.pieces[i]!.textContent ?? "").endsWith("\u00ad") && !at.some((v, j) => j > i && v.line === at[i]!.line);
    // A stand-in for a piece as it was seen, hyphen and all.
    const standIn = (el: HTMLElement, i: number) => {
      const ghost = document.createElement("span");
      ghost.className = "std-word std-ghost";
      ghost.setAttribute("aria-hidden", "true");
      ghost.textContent = (el.textContent ?? "").replace(/\u00ad/g, "") + (broken(i, was2) ? "-" : "");
      ghost.style.color = getComputedStyle(el).color;
      ghost.style.left = `${was2[i]!.x}px`;
      ghost.style.top = `${before.pieces[i]!.top - before.line.top}px`;
      p.line.appendChild(ghost);
      ghosts.push(ghost);
      return ghost;
    };
    p.pieces.forEach((el, i) => {
      const b = before.pieces[i];
      const w = was2[i];
      const n = now2[i];
      if (!b || !w || !n) return;
      const dx = w.x - n.x;
      const dy = b.top - before.line.top - (after.pieces[i]!.top - after.line.top);
      const o = before.shown[i] ?? 1;
      if (w.line === n.line) {
        // Its hyphen shown or taken away, it travels as it was and turns
        // into what it is at the end, so the hyphen comes and goes softly.
        if (broken(i, was2) !== broken(i, now2)) {
          // Shown near the end, once the words after it have gone; taken
          // away at the start, before the words coming back reach it.
          // (Offsets are along the eased move.)
          const turn = broken(i, was2) ? 0.14 : 0.86;
          moves.current.push(
            standIn(el, i).animate(
              [
                { translate: "0 0", opacity: o },
                { opacity: turn < 0.5 ? 0 : o, offset: turn },
                { translate: `${-dx}px 0`, opacity: 0 },
              ],
              { duration: RESET_MS, easing: RESET_EASE, fill: "forwards" },
            ),
          );
          go(el, [
            { left: `${dx}px`, top: `${dy}px`, opacity: 0 },
            { opacity: turn < 0.5 ? 1 : 0, offset: turn },
            { left: "0px", top: "0px", opacity: 1 },
          ]);
        } else if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5 || o < 1)
          go(el, [{ left: `${dx}px`, top: `${dy}px`, opacity: o }, { left: "0px", top: "0px", opacity: 1 }]);
        return;
      }
      const way = n.line > w.line ? 1 : -1;
      // Out: a stand-in where it was, going on along its old line.
      const out = pace(w.line, w.x, "before", "x", way);
      const ghost = standIn(el, i);
      moves.current.push(
        ghost.animate(
          [
            { translate: "0 0", opacity: o },
            { opacity: o, offset: 0.35 },
            { translate: `${out}px 0`, opacity: 0 },
          ],
          { duration: RESET_MS, easing: RESET_EASE, fill: "forwards" },
        ),
      );
      // In: the piece itself, coming along its new line.
      const into = pace(n.line, n.x, "after", "now", way);
      go(el, [
        { left: `${-into}px`, top: "0px", opacity: 0 },
        { opacity: 1, offset: 0.6 },
        { left: "0px", top: "0px", opacity: 1 },
      ]);
    });
    gone.current = ghosts;
    if (ghosts.length || moves.current.length) {
      p.line.dataset.moving = "";
      const mine = moves.current;
      void Promise.all(mine.map((m) => m.finished)).then(
        () => {
          if (moves.current !== mine) return;
          ghosts.forEach((g) => g.remove());
          delete p.line.dataset.moving;
        },
        () => {},
      );
    }
    // The capsule itself, should its line have moved it.
    const cx = before.capsule.left - before.line.left - (after.capsule.left - after.line.left);
    const cy = before.capsule.top - before.line.top - (after.capsule.top - after.line.top);
    if (Math.abs(cx) > 0.5 || Math.abs(cy) > 0.5)
      go(p.a, [{ translate: `${cx}px ${cy}px` }, { translate: "0 0" }]);
    // Its black stretched or drawn in, the far portrait at its end.
    if (ink.current && before.ink !== after.ink)
      go(ink.current, [{ width: `${before.ink}px` }, { width: `${after.ink}px` }]);
    if (far.current && before.face !== after.face)
      go(far.current, [{ translate: `${before.face - after.face}px 0` }, { translate: "0 0" }]);
    // The stroke under the last words is taken off while they move and
    // drawn in again, left to right, once they are in place.
    if (p.stroke) {
      const size = getComputedStyle(p.stroke).backgroundSize;
      const thin = size.split(" ")[1] ?? "0.06em";
      moves.current.push(
        p.stroke.animate(
          [
            { backgroundSize: `0% ${thin}`, offset: 0 },
            { backgroundSize: `0% ${thin}`, offset: 0.62, easing: "cubic-bezier(0.65, 0, 0.35, 1)" },
            { backgroundSize: size, offset: 1 },
          ],
          { duration: RESET_MS + 520 },
        ),
      );
    }
    // A shake under way eased out rather than stopped at its tilt.
    if (open && tilt.current !== "none" && shell.current)
      go(shell.current, [{ transform: tilt.current }, { transform: "none" }]);
    // parts() is read fresh from the page on every run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Watched from the moment it opens, not a frame later, so a hand that
  // leaves at once is not missed.
  useLayoutEffect(() => {
    if (!open) return;
    // A new width sets the line anew: closed, it is worked out again.
    const onResize = () => setOpen(false);
    window.addEventListener("resize", onResize);
    if (by.current === "focus")
      return () => window.removeEventListener("resize", onResize);
    const onMove = (event: PointerEvent) => {
      const now = self.current?.getBoundingClientRect();
      const then = was.current;
      if (!now || !then) return;
      const pad = 18;
      const near = (r: DOMRect) =>
        event.clientX > r.left - pad &&
        event.clientX < r.right + pad &&
        event.clientY > r.top - pad &&
        event.clientY < r.bottom + pad;
      if (!near(now) && !near(then)) hide();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
    // hide only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const opacity = useTransform(progress, [from, from + 0.06], [0.35, 1]);
  const scale = useTransform(progress, [from, from + 0.08], [0.82, 1]);
  return (
    <motion.a
      ref={self}
      href="/about"
      className="std-faces"
      data-open={open ? "" : undefined}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") show("pointer");
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) show("focus");
      }}
      onBlur={() => {
        if (open && by.current === "focus") hide();
      }}
      style={reduce ? undefined : { opacity, scale }}
      aria-label="Find out more about us"
    >
      <span ref={shell} className="std-faces-in">
        {/* The capsule's black, drawn under the faces and the words, so it
            can be stretched without setting the line anew every frame. */}
        <span ref={ink} aria-hidden="true" className="std-faces-ink" />
        <span className="std-face">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FOUNDERS[0].photo} alt="" draggable={false} style={{ objectPosition: FOUNDERS[0].focus }} />
        </span>
        <span ref={say} aria-hidden="true" className="std-faces-say">
          <span ref={words}>Find out more about us</span>
        </span>
        <span ref={far} className="std-face">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FOUNDERS[1].photo} alt="" draggable={false} style={{ objectPosition: FOUNDERS[1].focus }} />
        </span>
      </span>
    </motion.a>
  );
}

/* Grey and plain until the copy has been seen. Illuminated reads its lines
   back from the layout the moment it mounts, so it is only mounted once that
   layout is the one the reader gets: before the opening hands the page back
   there is no scrollbar yet, and every measured line would be a little too
   long for the page that follows. */
function LitCopy({
  lit,
  text,
  mark,
  delayMs,
  reduce,
  className,
}: {
  lit: boolean;
  text: string;
  mark?: string;
  delayMs: number;
  reduce: boolean;
  className: string;
}) {
  if (!lit)
    return (
      <p className={className}>
        {text}
        {mark ? " " : null}
        {mark && <mark>{mark}</mark>}
      </p>
    );
  return (
    <Illuminated
      text={text}
      mark={mark}
      delayMs={delayMs}
      reduce={reduce}
      className={className}
    />
  );
}
