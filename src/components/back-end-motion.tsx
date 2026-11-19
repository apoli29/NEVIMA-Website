"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useInView, type T } from "./sbs-shared";

/* ==================================================================
   The back-end page in motion (user, 2026-11-19)

   Five pieces, one per section, written on the user's notes of that
   day:

   - DepthCard: under the header's title, one request walking through
     the three solutions in depth (a form, then three sheets fanned one
     behind the other), until the three come forward side by side, tied
     by wires. A short caption follows each step.
   - GlowTrail: the week's three drawings in three cards, set off one
     from another as the user's sketch has them, with one soft light
     moving from card to card as the page is scrolled.
   - DragRun: the three solutions, on a desk, pulled out of one another
     from left to right by the scroll (the second is born from the
     first, the third from the second), then the block for whatever the
     three miss, born from under them.
   - GainStory: the three gains, with the drawing beside them held in
     place and changing to the gain being read.
   - PriceLine: how the price works as a line drawn by the scroll, from
     the free meeting to the build to the monthly service.

   With reduced motion asked for, every one of them stands at its end.
   ================================================================== */

/** Whether a media query holds, read after mount (the server draws the
    plain version, which is also the phone's). */
function useMedia(query: string) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const watch = window.matchMedia(query);
    const read = () => setOn(watch.matches);
    read();
    watch.addEventListener("change", read);
    return () => watch.removeEventListener("change", read);
  }, [query]);
  return on;
}

/** Ease in and out, for the parts the scroll drives. */
const io = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* ---- 1. the request, in depth ------------------------------------ */

/** How long each step is held, in ms: the form, the database, the
    calendar, the email, and the three together. */
const HOLD = [2600, 2400, 2400, 2400, 4400];

/** Where each of the three sheets stands at each step. Fanned in depth
    while the request walks through them (the one it is in lifted out
    of the fan), then side by side, flat, at the end. */
function pose(i: number, at: number) {
  if (at === 4) return `translate3d(${(i - 1) * 33}cqw, 0, 0) rotateY(0deg) rotateX(0deg)`;
  const lifted = at - 1 === i;
  const x = -5 + i * 9;
  const y = (1 - i) * 1.2 - (lifted ? 1.6 : 0);
  const z = -i * 90 + (lifted ? 150 : 0);
  return `translate3d(${x}cqw, ${y}cqw, ${z}px) rotateY(${lifted ? -14 : -28}deg) rotateX(${lifted ? 4 : 9}deg)`;
}

export function DepthCard({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLElement>(0.2);
  const [step, setStep] = useState(0);
  const run = inView && !reduce;

  useEffect(() => {
    if (!run) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % 5), HOLD[step]);
    return () => window.clearTimeout(id);
  }, [step, run]);

  const at = reduce ? 4 : step;
  const sheets = [
    { k: "base", name: t("Database", "Base de dados") },
    { k: "cal", name: t("Calendar", "Calendário") },
    { k: "mail", name: t("Email", "E-mail") },
  ];
  const captions = [
    t("A request arrives through the website", "Um pedido chega pelo website"),
    t("It is kept on its own, in the database", "Fica guardado sozinho, na base de dados"),
    t("The booking takes its place in the calendar", "A marcação ocupa o seu lugar no calendário"),
    t("The confirmation goes out, already written", "A confirmação sai, já escrita"),
    t("All three tied together, with nobody copying by hand", "As três ligadas, sem ninguém copiar à mão"),
  ];

  const opacity = (i: number) => (at === 4 || at - 1 === i ? 1 : at - 1 > i ? 0.55 : 0.36);

  return (
    <figure
      ref={ref}
      className="be-dc"
      data-at={at}
      data-row={at >= 1 || undefined}
      data-slot={at >= 2 || undefined}
      data-mail={at >= 3 || undefined}
      data-still={reduce || undefined}
      role="img"
      aria-label={t(
        "A request sent from the website's form is kept in the database, takes its place in the calendar, and the confirmation goes out already written: three solutions tied together.",
        "Um pedido enviado pelo formulário do website fica guardado na base de dados, ocupa o seu lugar no calendário, e a confirmação sai já escrita: três soluções ligadas entre si.",
      )}
    >
      <div className="be-dc-stage" aria-hidden="true">
        <div className="be-dc-space">
          {/* The wires that tie the three at the end. */}
          <span className="be-dc-wire" style={{ ["--x" as string]: "-16.5cqw" }}>
            <i />
          </span>
          <span className="be-dc-wire" style={{ ["--x" as string]: "16.5cqw" }}>
            <i />
          </span>

          {/* The form: the request starts here and goes into the fan. */}
          <div
            className="be-dc-sheet be-dc-form"
            data-on={at === 0 || undefined}
            style={{
              transform:
                at === 0
                  ? "translate3d(-30cqw, 1cqw, 140px) rotateY(-10deg) rotateX(4deg)"
                  : "translate3d(-5cqw, 1.2cqw, -40px) rotateY(-28deg) rotateX(9deg) scale(0.5)",
              opacity: at === 0 ? 1 : 0,
            }}
          >
            <p className="be-dc-tag">{t("Website form", "Formulário do website")}</p>
            <span className="be-dc-field" style={{ ["--i" as string]: 0 }} />
            <span className="be-dc-field" style={{ ["--i" as string]: 1 }} />
            <span className="be-dc-field be-dc-field-tall" style={{ ["--i" as string]: 2 }} />
            <span className="be-dc-send" />
          </div>

          {sheets.map((sheet, i) => (
            <div
              key={sheet.k}
              className="be-dc-sheet"
              data-k={sheet.k}
              data-on={at - 1 === i || at === 4 || undefined}
              style={{ transform: pose(i, at), opacity: opacity(i), zIndex: at - 1 === i ? 4 : 3 - i }}
            >
              <p className="be-dc-tag">{sheet.name}</p>
              {sheet.k === "base" && (
                <span className="be-dc-table">
                  <span className="be-dc-thead">
                    <i /> <i /> <i />
                  </span>
                  <span className="be-dc-trow be-dc-trow-new">
                    <i /> <i /> <i />
                  </span>
                  <span className="be-dc-trow">
                    <i /> <i /> <i />
                  </span>
                  <span className="be-dc-trow">
                    <i /> <i /> <i />
                  </span>
                </span>
              )}
              {sheet.k === "cal" && (
                <span className="be-dc-cal">
                  {Array.from({ length: 21 }, (_, c) => (
                    <i key={c} data-take={c === 10 || undefined} data-had={c === 3 || c === 16 || undefined} />
                  ))}
                </span>
              )}
              {sheet.k === "mail" && (
                <span className="be-dc-mail">
                  <span className="be-dc-line be-dc-line-head" />
                  <span className="be-dc-line" style={{ ["--w" as string]: "78%", ["--i" as string]: 0 }} />
                  <span className="be-dc-line" style={{ ["--w" as string]: "62%", ["--i" as string]: 1 }} />
                  <span className="be-dc-line" style={{ ["--w" as string]: "40%", ["--i" as string]: 2 }} />
                  <svg className="be-dc-tick" viewBox="0 0 20 20">
                    <path d="M4 10.5 L8.5 15 L16 5.5" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="be-dc-foot" aria-hidden="true">
        <span className="be-dc-steps">
          {captions.map((_, i) => (
            <i key={i} data-on={at === i || undefined} data-done={at > i || undefined} />
          ))}
        </span>
        <p key={at} className="be-dc-cap">
          {captions[at]}
        </p>
      </div>
    </figure>
  );
}

/* ---- 2. three cards and a light ---------------------------------- */

/** How far down the screen the reader's line sits (see GlowTrail). */
const READ_LINE = 0.65;

/** Piecewise linear: where `y` falls between the knots `ys`, the same
    share between the matching `ss`; clamped at both ends. */
function along(y: number, ys: number[], ss: number[]) {
  if (y <= ys[0]) return ss[0];
  for (let i = 1; i < ys.length; i++) {
    if (y <= ys[i]) return ss[i - 1] + ((y - ys[i - 1]) / Math.max(1, ys[i] - ys[i - 1])) * (ss[i] - ss[i - 1]);
  }
  return ss[ss.length - 1];
}

/** The three cards of the week, set off one from another as in the
    user's sketch (2026-11-19): a wide one on the left, a smaller one on
    the right a little lower, and one in the middle under them. One soft
    light goes from the centre of one to the centre of the next as the
    page is scrolled, and the card it is on lights its edge.

    The light is a meteor now (user, 2026-11-19, eleventh round): a small
    bright head with a thin trail, almost a line, and it no longer hides
    behind the cards. It runs through the gaps round them like a trace on
    a board: down past the first card's left side, across the gap under
    it, down past the second's right side, back across the gap under
    that, and down past the third's left side. The path is read from the
    cards themselves, so it follows them at every width. */
export function GlowTrail({ cards }: { cards: ReactNode[] }) {
  const reduce = useReducedMotion() ?? false;
  const box = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const track = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const tail = useRef<SVGPathElement>(null);
  const head = useRef<SVGCircleElement>(null);
  const [route, setRoute] = useState({ d: "", w: 0, h: 0, turns: [] as number[], start: 0, end: 0, g1: 0, g2: 0, pageTop: 0 });
  const [lit, setLit] = useState(0);

  // The route, in the box's own pixels, read again whenever anything
  // changes size: outside the side each card is flush with, and through
  // the middle of each gap.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => {
      const c = items.current.filter(Boolean) as HTMLDivElement[];
      if (c.length < 3) return;
      const o = 14;
      const L = (k: HTMLDivElement) => k.offsetLeft - o;
      const R = (k: HTMLDivElement) => k.offsetLeft + k.offsetWidth + o;
      const top = (k: HTMLDivElement) => k.offsetTop;
      const bottom = (k: HTMLDivElement) => k.offsetTop + k.offsetHeight;
      const g1 = (bottom(c[0]) + top(c[1])) / 2;
      const g2 = (bottom(c[1]) + top(c[2])) / 2;
      const pts: [number, number][] = [
        [L(c[0]), top(c[0]) + 24],
        [L(c[0]), g1],
        [R(c[1]), g1],
        [R(c[1]), g2],
        [L(c[2]), g2],
        [L(c[2]), bottom(c[2]) - 24],
      ];
      const d = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
      // where along the route each leg ends, to know which card it is at
      let run = 0;
      const turns = pts.slice(1).map(([x, y], i) => (run += Math.hypot(x - pts[i][0], y - pts[i][1])));
      setRoute({
        d,
        w: el.offsetWidth,
        h: el.offsetHeight,
        turns,
        start: pts[0][1],
        end: pts[5][1],
        g1,
        g2,
        pageTop: el.getBoundingClientRect().top + window.scrollY,
      });
    };
    read();
    const watch = new ResizeObserver(read);
    watch.observe(el);
    for (const card of items.current) if (card) watch.observe(card);
    // the box can move on the page without changing size
    window.addEventListener("resize", read);
    return () => {
      watch.disconnect();
      window.removeEventListener("resize", read);
    };
  }, []);

  // The meteor stays level with a reading line READ_LINE down the screen (65%; it was 55%, and the user asked for it to start 10% higher, 2026-11-19)
  // (user, 2026-11-19: "sincroniza melhor a animação com o scroll e o
  // posicionamento do user"), pixel for pixel on the way down, and crosses
  // each gap while that line passes it, within k above and below; it used
  // to move by the share of the path's length, which ran it ahead on the
  // way down and left it behind in the long crossings (plan 004).
  const { scrollY } = useScroll();
  const place = (sy: number) => {
    const path = track.current;
    if (!path || !route.d || route.turns.length < 5) return;
    const total = path.getTotalLength();
    const { start, end, g1, g2, turns } = route;
    const Y = sy + window.innerHeight * READ_LINE - route.pageTop;
    const shortest = Math.min(g1 - start, g2 - g1, end - g2);
    const k = Math.min(Math.max(80, 0.12 * window.innerHeight), 140, 0.45 * shortest);
    // Down each side the head is exactly on the line; the last k before a
    // corner, the crossing and the first k after it share the 2k of
    // scroll round each gap, so the line never gets ahead or behind.
    const at = along(
      Y,
      [start, g1 - k, g1 + k, g2 - k, g2 + k, end],
      [0, turns[0] - k, turns[1] + k, turns[2] - k, turns[3] + k, total],
    );
    const pt = path.getPointAtLength(at);
    const fade = String(Math.min(1, Math.max(0, (Y - start) / 60)) * Math.min(1, Math.max(0, (end - Y) / 60)));
    head.current?.setAttribute("cx", String(pt.x));
    head.current?.setAttribute("cy", String(pt.y));
    head.current?.setAttribute("opacity", fade);
    if (trail.current) trail.current.style.opacity = fade;
    if (tail.current) tail.current.style.opacity = fade;
    // the trail: a short bright line just behind the head, and a longer
    // faint one behind that
    const draw = (el: SVGPathElement | null, len: number) => {
      if (!el) return;
      el.style.strokeDasharray = `${len} ${total + len}`;
      el.style.strokeDashoffset = String(-(at - len));
    };
    draw(trail.current, 90);
    draw(tail.current, 320);
    const [a, b, c2, d2] = route.turns;
    const near = at < (a + b) / 2 ? 0 : at < (c2 + d2) / 2 ? 1 : 2;
    setLit((was) => (was === near ? was : near));
  };
  useMotionValueEvent(scrollY, "change", place);
  useEffect(() => place(scrollY.get()));

  return (
    <div ref={box} className="be-trail" data-still={reduce || undefined}>
      {!reduce && route.d && (
        <svg className="be-trail-route" width={route.w} height={route.h} viewBox={`0 0 ${route.w} ${route.h}`} aria-hidden="true">
          <path ref={track} className="be-trail-track" d={route.d} />
          <path ref={tail} className="be-trail-tail" d={route.d} />
          <path ref={trail} className="be-trail-line" d={route.d} />
          <circle ref={head} className="be-trail-head" r="2.6" opacity="0" />
        </svg>
      )}
      {cards.map((card, i) => (
        <div
          key={i}
          ref={(el) => {
            items.current[i] = el;
          }}
          className="be-trail-card be-card"
          data-n={i}
          data-lit={(!reduce && lit === i) || undefined}
        >
          {card}
        </div>
      ))}
    </div>
  );
}

/* ---- 3. pulled out of one another -------------------------------- */

type Solution = { id: string; name: string; body: string; draw: ReactNode };

/** One card's share of the scroll, eased, from 0 (not out yet) to 1. */
function useShare(p: MotionValue<number>, from: number, to: number) {
  return useTransform(p, [from, to], [0, 1], { clamp: true, ease: io });
}

export function DragRun({
  head,
  solutions,
  slab,
}: {
  head: ReactNode;
  solutions: Solution[];
  slab: ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;
  // The desk only, and only when the three and the block fit the
  // screen's height together; elsewhere they come in as they are reached.
  const desk = useMedia("(min-width: 1024px) and (min-height: 800px)");
  const pin = desk && !reduce;
  const run = useRef<HTMLDivElement>(null);
  const [plainRef, seen] = useInView<HTMLDivElement>(0.2);
  const [slabRef, slabSeen] = useInView<HTMLDivElement>(0.4);

  const { scrollYProgress } = useScroll({ target: run, offset: ["start start", "end end"] });
  const k0 = useShare(scrollYProgress, 0.02, 0.2);
  const k1 = useShare(scrollYProgress, 0.24, 0.46);
  const k2 = useShare(scrollYProgress, 0.5, 0.72);
  const k3 = useShare(scrollYProgress, 0.78, 0.96);

  // Each card's thread draws itself once the card has landed.
  const [landed, setLanded] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const n = p >= 0.72 ? 3 : p >= 0.46 ? 2 : p >= 0.2 ? 1 : 0;
    setLanded((was) => (was === n ? was : n));
  });

  // The three shares go on the row, and every card reads them: all three
  // start behind the first, the second is pulled out of it, and the
  // third rides on the second until it is pulled out in turn
  // (globals.css, .be-sols[data-pin]).
  const cards = (
    <motion.div
      ref={pin ? undefined : plainRef}
      className="be-sols"
      data-pin={pin || undefined}
      data-seen={(!pin && (seen || reduce)) || undefined}
      data-still={reduce || undefined}
      style={pin ? ({ ["--k0"]: k0, ["--k1"]: k1, ["--k2"]: k2 } as unknown as CSSProperties) : undefined}
    >
      {solutions.map((card, i) => (
        <article
          key={card.id}
          className="be-sol"
          data-i={i}
          data-landed={(pin ? landed > i : seen || reduce) || undefined}
          style={{ ["--i" as string]: i, zIndex: pin ? 3 - i : undefined } as CSSProperties}
        >
          <h3 className="be-sol-name">{card.name}</h3>
          <svg className="be-sol-thread" viewBox="0 0 160 44" aria-hidden="true">
            <path className="be-sol-lead" d="M 1 1 L 1 30 L 74 30" />
            <circle className="be-sol-dot" cx="74" cy="30" r="2.6" />
          </svg>
          {card.draw}
          <p className="be-sol-body">{card.body}</p>
        </article>
      ))}
    </motion.div>
  );

  if (!pin) {
    // The scroll is still watched on this wrapper (motion needs its
    // target mounted), but nothing reads it here.
    return (
      <div ref={run}>
        {head}
        {cards}
        <div ref={slabRef} className="be-slab-in" data-seen={slabSeen || reduce || undefined}>
          {slab}
        </div>
      </div>
    );
  }

  return (
    <div ref={run} className="be-run">
      <div className="be-run-pin">
        {/* The title rides with them, so the three are never seen
            without it. */}
        <div className="be-run-head">{head}</div>
        {cards}
        <motion.div className="be-slab-in" data-pin style={{ ["--k"]: k3 } as unknown as CSSProperties}>
          {slab}
        </motion.div>
      </div>
    </div>
  );
}

/* ---- 4. the gains, with the drawing held beside them ------------- */

/** Each gain as it is read now (user, 2026-11-19, second round): the
    name, one line that leads, and the rest as short keyed lines that
    open only on the gain being read (the key terms of The Equity Fund's
    approach page and the folding list of GitHub's features, through
    Inspo; only the composition). */
type Gain = { id: string; name: string; lead: string; items: { key: string; rest: string }[] };

export function GainStory({ gains, scenes, t }: { gains: Gain[]; scenes: ReactNode[]; t: T }) {
  const reduce = useReducedMotion() ?? false;
  const rows = useRef<(HTMLElement | null)[]>([]);
  const [at, setAt] = useState(0);

  // The card behind the drawings takes the size of the drawing it holds
  // (user, 2026-11-19, second round), so a phone sits in a tall card and
  // the week in a wide one, with the same margin round each.
  const fits = useRef<(HTMLDivElement | null)[]>([]);
  const [sizes, setSizes] = useState<{ w: number; h: number }[]>([]);
  useEffect(() => {
    const read = () =>
      setSizes(fits.current.map((el) => ({ w: el?.offsetWidth ?? 0, h: el?.offsetHeight ?? 0 })));
    read();
    const watch = new ResizeObserver(read);
    for (const el of fits.current) if (el) watch.observe(el);
    return () => watch.disconnect();
  }, []);
  const size = sizes[at];

  // The gain being read is the one across the middle of the screen.
  useEffect(() => {
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = rows.current.indexOf(entry.target as HTMLElement);
          if (i >= 0) setAt(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const row of rows.current) if (row) watch.observe(row);
    return () => watch.disconnect();
  }, []);

  return (
    <div className="be-gs" data-still={reduce || undefined}>
      <ol className="be-gs-list">
        {gains.map((gain, i) => (
          <li
            key={gain.id}
            ref={(el) => {
              rows.current[i] = el;
            }}
            className="be-gs-row"
            data-on={at === i || undefined}
          >
            <h3 className="be-gs-name">{gain.name}</h3>
            <p className="be-gs-lead">{gain.lead}</p>
            <div className="be-gs-fold">
              <ul className="be-gs-items">
                {gain.items.map((item) => (
                  <li key={item.key}>
                    <b>{item.key}</b> {item.rest}
                  </li>
                ))}
              </ul>
            </div>
            {/* On a phone the drawing comes with its own gain. */}
            <InlineScene>{scenes[i]}</InlineScene>
          </li>
        ))}
      </ol>
      <div className="be-gs-hold" aria-hidden="true">
        <div
          className="be-gs-frame be-card"
          style={size && size.w ? { width: size.w, height: size.h } : undefined}
        >
          {scenes.map((scene, i) => (
            <div
              key={i}
              ref={(el) => {
                fits.current[i] = el;
              }}
              className="be-gs-scene"
              data-on={at === i || undefined}
            >
              {/* Keyed to the gain being read, so the drawing plays
                  again each time its gain comes round. */}
              <div key={at === i ? `on-${i}` : `off-${i}`} className="be-gs-play">
                {scene}
              </div>
            </div>
          ))}
          <p className="be-gs-count mono-label">
            {gains.map((g, i) => (
              <i key={g.id} data-on={at === i || undefined} />
            ))}
            <span>{t(`${at + 1} of 3`, `${at + 1} de 3`)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** A phone's drawing, under its own gain: it plays once it is reached. */
function InlineScene({ children }: { children: ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);
  return (
    <div ref={ref} className="be-gs-inline be-card" aria-hidden="true">
      <div className="be-gs-scene" data-on>
        {seen ? children : null}
      </div>
    </div>
  );
}

/** The day: blocks that were scattered fall into their slots, the free
    end of the day is left open, and a line of the business's own
    numbers goes up beside it. */
export function SceneDay({ t }: { t: T }) {
  const blocks = [
    { c: 0, r: 0, h: 2 }, { c: 1, r: 1, h: 1 }, { c: 2, r: 0, h: 1 }, { c: 3, r: 1, h: 2 },
    { c: 4, r: 0, h: 1 }, { c: 0, r: 3, h: 1 }, { c: 2, r: 2, h: 2 }, { c: 4, r: 2, h: 1 },
  ];
  return (
    <div className="be-sc be-sc-day">
      <div className="be-sc-sheet be-sc-week">
        <p className="be-sc-tag">{t("The week", "A semana")}</p>
        <span className="be-sc-grid">
          {blocks.map((b, i) => (
            <i
              key={i}
              style={{
                ["--c" as string]: b.c,
                ["--r" as string]: b.r,
                ["--h" as string]: b.h,
                ["--i" as string]: i,
                ["--tilt" as string]: `${((i * 37) % 24) - 12}deg`,
                ["--dx" as string]: `${((i * 53) % 60) - 30}%`,
              }}
            />
          ))}
          <b className="be-sc-free">{t("Free to grow", "Livre para crescer")}</b>
        </span>
      </div>
      <div className="be-sc-sheet be-sc-chart">
        <p className="be-sc-tag">{t("The business's own numbers", "Os números do negócio")}</p>
        <svg viewBox="0 0 100 50" preserveAspectRatio="none">
          <path className="be-sc-base" d="M 0 49 L 100 49" />
          <path className="be-sc-rise" d="M 0 44 L 14 40 L 28 41 L 42 33 L 56 30 L 70 22 L 84 17 L 100 8" pathLength={100} />
        </svg>
      </div>
    </div>
  );
}

/** Nothing lost: one client's record, with every request, booking and
    email landing in it on its own, each with its tick. */
export function SceneKept({ t }: { t: T }) {
  const rows = [
    t("Request received", "Pedido recebido"),
    t("Booking made", "Marcação criada"),
    t("Confirmation sent", "Confirmação enviada"),
    t("Reminder sent", "Lembrete enviado"),
  ];
  return (
    <div className="be-sc be-sc-kept">
      <div className="be-sc-sheet be-sc-record">
        <span className="be-sc-who">
          <i className="be-sc-face" />
          <span>
            <i className="be-sc-bar" style={{ ["--w" as string]: "7em" }} />
            <i className="be-sc-bar be-sc-bar-soft" style={{ ["--w" as string]: "4.5em" }} />
          </span>
        </span>
        <ol className="be-sc-hist">
          {rows.map((row, i) => (
            <li key={row} style={{ ["--i" as string]: i }}>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 10.5 L8.5 15 L16 5.5" />
              </svg>
              <span>{row}</span>
              <i className="be-sc-bar be-sc-bar-soft" style={{ ["--w" as string]: "3em" }} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** The client feels it: a phone that gets the confirmation late at
    night, the reminder the day before, and an answer that knows the
    history. */
export function SceneClient({ t }: { t: T }) {
  const notes = [
    { time: "23:47", head: t("Request received", "Pedido recebido"), say: t("We'll be in touch first thing tomorrow.", "Entramos em contacto amanhã logo de manhã.") },
    { time: t("Yesterday", "Ontem"), head: t("Reminder", "Lembrete"), say: t("Your booking is tomorrow at 10:00.", "A marcação é amanhã às 10:00.") },
    { time: "09:12", head: t("Welcome back", "Bem-vindo de volta"), say: t("Same as last time, in March?", "O mesmo da última vez, em março?") },
  ];
  return (
    <div className="be-sc be-sc-client">
      <div className="be-sc-phone">
        <span className="be-sc-notch" />
        {notes.map((note, i) => (
          <span key={note.head} className="be-sc-note" style={{ ["--i" as string]: i }}>
            <span className="be-sc-note-top">
              <b>{note.head}</b>
              <em>{note.time}</em>
            </span>
            <span className="be-sc-note-say">{note.say}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---- 5. the price, as a line ------------------------------------- */

type Stop = { id: string; name: string; value: string; per?: string; body: string; note?: string; glyph: "meet" | "build" | "month" };

function Glyph({ kind }: { kind: Stop["glyph"] }) {
  if (kind === "meet") {
    return (
      <svg className="be-pl-glyph" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="17" cy="24" r="7" />
        <circle cx="31" cy="24" r="7" />
      </svg>
    );
  }
  if (kind === "build") {
    return (
      <svg className="be-pl-glyph" viewBox="0 0 48 48" aria-hidden="true">
        <rect x="6" y="17" width="13" height="13" />
        <rect x="29" y="17" width="13" height="13" />
        <path className="be-pl-tie" d="M 19 23.5 L 29 23.5" />
      </svg>
    );
  }
  return (
    <svg className="be-pl-glyph be-pl-loop" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="13" pathLength={100} />
      <circle className="be-pl-bead" cx="24" cy="11" r="2.4" />
    </svg>
  );
}

export function PriceLine({ stops }: { stops: Stop[] }) {
  const reduce = useReducedMotion() ?? false;
  const line = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: line, offset: ["start 95%", "end 72%"] });
  const grow = useTransform(scrollYProgress, [0, 1], [0, 1], { clamp: true });
  const [reached, setReached] = useState(reduce ? stops.length : 0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // It answers sooner (user, 2026-11-19, second round): each stop lights
    // a little before the line reaches it.
    const n = p >= 0.82 ? 3 : p >= 0.38 ? 2 : p > 0 ? 1 : 0;
    setReached((was) => (was === n ? was : n));
  });
  const shown = reduce ? stops.length : reached;

  return (
    <ol ref={line} className="be-pl" data-still={reduce || undefined}>
      <span className="be-pl-rail" aria-hidden="true">
        <motion.span className="be-pl-fill" style={reduce ? undefined : ({ ["--g"]: grow } as unknown as CSSProperties)} />
      </span>
      {stops.map((stop, i) => (
        <li key={stop.id} className="be-pl-stop" data-on={shown > i || undefined} style={{ ["--i" as string]: i } as CSSProperties}>
          <span className="be-pl-node" aria-hidden="true">
            <Glyph kind={stop.glyph} />
          </span>
          <h3 className="be-pl-name">{stop.name}</h3>
          <p className="be-pl-value">
            {stop.value}
            {stop.per && <small>{stop.per}</small>}
          </p>
          <p className="be-pl-body">{stop.body}</p>
          {stop.note && <p className="be-pl-note">{stop.note}</p>}
        </li>
      ))}
    </ol>
  );
}
