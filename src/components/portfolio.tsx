"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  MotionConfig,
  motion,
  useAnimate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { STILL_KEY } from "./footer";
import { LiquidLens } from "./liquid-lens";
import { ProposalOverlay, useProposalController } from "./proposal-flow";
import { leavePortfolio } from "@/lib/return-spot";
import { PROJECTS, STATUS_LABEL, shown, type Project } from "@/lib/work";

/* ==================================================================
   The portfolio

   A room of its own (user, 2026-10-12): one screen, no bar, no foot, no
   closing section. Its ground is the foot's: black, with the slow glossy
   light in it and the drop of water that follows the hand (the footer's
   LiquidLens, used as it is, with no words or mark of its own to carry).
   On it the work floats as a loose cloud of photos, after a reference the
   user brought: the near one larger, the far one smaller, each drifting
   on a slow loop of its own, and the whole cloud leaning a little after
   the hand, the near photo more than the far one, so the room has depth.

   Two buttons and nothing else, side by side in the middle at the top,
   the same drop in black glass and in white: "Exit portfolio", which
   goes back exactly where the visitor was (see return-spot.ts), and
   "Let's work together", which opens the free-proposal form out of
   itself.

   Pointed at, the photo itself turns to frosted glass, the other steps
   back, and what it is comes up on the glass: the name, underlined, the
   sector and the services the studio took. Pressed, the photo is carried into a
   large card in the middle of the screen, the page under frosted glass:
   what the project is, a few lines about the website and the way to its
   full report. Close, Esc or a click on the glass sends it back.

   The photos are stand-ins (user: "fotos imaginárias", to be changed);
   every field the studio has not given reads as TO_FILL.
   ================================================================== */

const WORDMARK = "/nevima-wordmark-white.svg";

/** How far the cloud follows the hand: the near photo's reach, in CSS
    pixels, and the lean of the whole, in degrees. */
const REACH = { x: 26, y: 18 };
const LEAN = { x: 2.4, y: 3 };
/** How deep each photo stands, 1 the nearest: the far one moves less. */
const DEPTH = [1, 0.55];

const IN = [0.22, 1, 0.36, 1] as const;
const OUT = [0.4, 0, 0.2, 1] as const;

export function Portfolio() {
  const [open, setOpen] = useState<{ project: Project; from: HTMLElement } | null>(null);
  const proposal = useProposalController();
  const ask = useRef<HTMLButtonElement>(null);
  const away = open !== null || proposal.present;

  // The foot's light holds still here too if the visitor asked it to there.
  const [still, setStill] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(STILL_KEY)) setStill(true);
    } catch {}
  }, []);

  const ground = useRef<HTMLDivElement>(null);
  const sign = useRef<HTMLSpanElement>(null);

  return (
    // The same markup on the server and in the browser: under reduced
    // motion Motion drops the movement itself and CSS stops the drift.
    <MotionConfig reducedMotion="user">
      {/* Everything but the open card or form, out of reach while it is out. */}
      <main id="top" inert={away} className="fo-room">
        {/* The foot's ground. The lens follows the hand over the black and
            gives way as the hand reaches a photo, which sits above it. */}
        <div ref={ground} className="absolute inset-0 z-0">
          <LiquidLens host={ground} mark={sign} src={WORDMARK} still={still || away} />
          {/* The lens carries a mark; this room has none, so it is given
              an empty one. */}
          <span ref={sign} aria-hidden="true" className="absolute bottom-0 left-0 size-0" />
        </div>

        <h1 className="sr-only">Portfolio</h1>

        <motion.nav
          aria-label="Portfolio"
          className="fo-top"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: IN }}
        >
          {/* The same drop as its neighbour, in black glass (user: the two
              alike, each its own look). */}
          <button
            type="button"
            onClick={leavePortfolio}
            className="fo-exit cta-drop inline-flex text-[0.9375rem] leading-none"
          >
            <span className="btn-neu-face">
              <span aria-hidden="true" className="fo-exit-arrow">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" className="block">
                  <path d="M14 8H3M7 4 3 8l4 4" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              </span>
              Exit portfolio
            </span>
          </button>
          <button
            ref={ask}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={proposal.open}
            onClick={() => ask.current && proposal.show(ask.current, ask.current, false)}
            className="cta-drop cta-drop-light inline-flex text-[0.9375rem] leading-none"
            style={{ visibility: proposal.present ? "hidden" : undefined }}
          >
            <span className="btn-neu-face">Let&rsquo;s work together</span>
          </button>
        </motion.nav>

        <Cloud
          hidden={open?.project.slug ?? null}
          frozen={away}
          onOpen={(project, from) => setOpen({ project, from })}
        />
      </main>

      {open && (
        <Detail
          key={open.project.slug}
          project={open.project}
          from={open.from}
          onGone={() => {
            const back = open.from;
            setOpen(null);
            back.focus({ preventScroll: true });
          }}
        />
      )}
      <ProposalOverlay ctl={proposal} />
    </MotionConfig>
  );
}

/* --- the cloud -------------------------------------------------------------
   Each photo is three layers deep: where it is placed (CSS, per screen
   size), how far it has followed the hand (motion values, sprung so it
   trails), and its own slow drift (a CSS loop, so it costs nothing on the
   main thread). Only transforms move. For a finger there is no hand to
   follow, so only the drift; for anyone who asked for less motion, none
   of it: the hand is never read, the drift is stopped in CSS, and the
   photos only fade in. */

function Cloud({
  hidden,
  frozen,
  onOpen,
}: {
  /** the work that is out, kept in its place but unseen */
  hidden: string | null;
  /** something is open over the room: the cloud holds still */
  frozen: boolean;
  onOpen: (project: Project, from: HTMLElement) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState<number | null>(null);

  // The hand, from -1 to 1 across the screen, sprung so the cloud trails it.
  const hx = useMotionValue(0);
  const hy = useMotionValue(0);
  const sx = useSpring(hx, { stiffness: 40, damping: 16, mass: 1 });
  const sy = useSpring(hy, { stiffness: 40, damping: 16, mass: 1 });
  const leanY = useTransform(sx, (v) => v * LEAN.y);
  const leanX = useTransform(sy, (v) => -v * LEAN.x);

  const frozenAt = useRef(frozen);
  useEffect(() => {
    frozenAt.current = frozen;
  }, [frozen]);

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      if (frozenAt.current) return;
      hx.set((event.clientX / window.innerWidth) * 2 - 1);
      hy.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    // The hand gone from the window, the cloud settles back to the middle.
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget || frozenAt.current) return;
      hx.set(0);
      hy.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
    };
  }, [reduce, hx, hy]);

  return (
    <div
      className="fo-stage"
      data-active={active ?? undefined}
      data-still={frozen ? "" : undefined}
    >
      <motion.div className="fo-lean" style={{ rotateX: leanX, rotateY: leanY }}>
        {PROJECTS.map((project, i) => (
          <Piece
            key={project.slug}
            project={project}
            i={i}
            sx={sx}
            sy={sy}
            on={active === i}
            hidden={hidden === project.slug}
            onActive={(on) => setActive((was) => (on ? i : was === i ? null : was))}
            onOpen={onOpen}
          />
        ))}
      </motion.div>
    </div>
  );
}

function Piece({
  project,
  i,
  sx,
  sy,
  on,
  hidden,
  onActive,
  onOpen,
}: {
  project: Project;
  i: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  on: boolean;
  hidden: boolean;
  onActive: (on: boolean) => void;
  onOpen: (project: Project, from: HTMLElement) => void;
}) {
  const depth = DEPTH[i % DEPTH.length];
  const x = useTransform(sx, (v) => v * REACH.x * depth);
  const y = useTransform(sy, (v) => v * REACH.y * depth);
  const note = `fo-about-${project.slug}`;

  return (
    <div className="fo-piece" data-i={i} data-on={on ? "" : undefined}>
      <motion.div style={{ x, y }}>
        <div className="fo-drift">
          {/* It comes into focus as the room opens, the near one first. */}
          <motion.button
            type="button"
            aria-haspopup="dialog"
            aria-label={`Open ${project.name}`}
            aria-describedby={note}
            className="fo-tile"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.2 + i * 0.14, ease: IN }}
            style={{ visibility: hidden ? "hidden" : undefined }}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") onActive(true);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") onActive(false);
            }}
            // From the keyboard only: a click's focus is not a pointing.
            onFocus={(e) => {
              if (e.currentTarget.matches(":focus-visible")) onActive(true);
            }}
            onBlur={() => onActive(false)}
            onClick={(e) => onOpen(project, e.currentTarget)}
          >
            <span className="fo-window">
              <Photo project={project} />
            </span>
            {/* Pointed at, the photo itself turns to frosted glass: it
                blurs and pales under a veil, and what it is comes up
                on it (user). Inside a button, so spans throughout; read
                with the photo by a screen reader at any time. */}
            <span id={note} className="fo-frost">
              <span className="fo-frost-body">
                <span className="fo-frost-name">{project.name}</span>
                <span className="fo-frost-sector">
                  <span className="fo-frost-key">Sector</span> {shown(project.sector)}
                </span>
                <span className="fo-tags fo-frost-tags">
                  {project.services.map((service) => (
                    <span key={service}>{service}</span>
                  ))}
                </span>
              </span>
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/** The project's photo, on a dark ground for while it comes. */
function Photo({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <span className="fo-photo">
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          // An image that came before the page woke up has no load event
          // left to fire, so it is checked for once it is in place.
          ref={(img) => {
            if (img?.complete && img.naturalWidth > 0) setLoaded(true);
          }}
          src={project.photo.src}
          alt={project.photo.alt}
          draggable={false}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          // Faded in once it has come, not popped over the name.
          data-loaded={loaded ? "" : undefined}
          className="fo-img absolute inset-0 size-full object-cover select-none"
        />
      )}
    </span>
  );
}

/* --- the large card -------------------------------------------------------
   Moved by transform and clip-path only, never by width or height, so no
   frame of it asks the page to lay itself out again. On a computer the
   photo is the card itself, flown from the hand to the large card's left
   column (cut to the card's own 3:4, so it only has to scale evenly);
   once it has landed, the large card opens out from behind it to the
   right and the words come in. On a phone the large card is the whole
   screen and simply rises into place. Leaving is quicker and quieter
   than arriving. */

type Box = { x: number; y: number; w: number; h: number; rotate: number };

/** A photo as it stands in the cloud: its own size, centred where it is
    drawn, turned and scaled as its tile is. */
function boxOf(turned: HTMLElement, el: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  const t = getComputedStyle(turned).transform;
  const m = new DOMMatrixReadOnly(t === "none" ? undefined : t);
  const scale = Math.hypot(m.a, m.b) || 1;
  const w = el.offsetWidth * scale;
  const h = el.offsetHeight * scale;
  return {
    x: r.left + r.width / 2 - w / 2,
    y: r.top + r.height / 2 - h / 2,
    w,
    h,
    rotate: (Math.atan2(m.b, m.a) * 180) / Math.PI,
  };
}

type Landing = { x: number; y: number; w: number; h: number; photo: number; phone: boolean };

/** Large in the middle of the screen, its photo column as wide as a card
    of its height; on a phone, the whole screen. */
function landing(): Landing {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw < 768) return { x: 0, y: 0, w: vw, h: vh, photo: vw, phone: true };
  const w = Math.min(1040, vw - 96);
  const h = Math.min(640, vh - 96);
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h, photo: Math.round(h * 0.75), phone: false };
}

function Detail({
  project,
  from,
  onGone,
}: {
  project: Project;
  from: HTMLElement;
  onGone: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const glass = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [place, setPlace] = useState<Landing | null>(null);
  const flight = useRef<{ x: number; y: number; scale: number; rotate: number } | null>(null);
  const leaving = useRef(false);

  // Measured once, before the first paint, so nothing is ever drawn in
  // the wrong place.
  useLayoutEffect(() => {
    const b = landing();
    // The photo is what is carried, turned and scaled as its card is.
    // The whole tile, not its photo, which is scaled up while it is frosted.
    const a = boxOf(from, from);
    const ph = b.phone ? null : { cx: b.x + b.photo / 2, cy: b.y + b.h / 2 };
    flight.current = ph && {
      x: a.x + a.w / 2 - ph.cx,
      y: a.y + a.h / 2 - ph.cy,
      scale: a.w / b.photo,
      rotate: a.rotate,
    };
    setPlace(b);
  }, [from]);

  // In.
  useEffect(() => {
    if (!place || !glass.current || !frame.current || !photo.current || !body.current) return;
    const f = flight.current;
    const rest = `inset(0 ${place.w - place.photo}px 0 0)`;
    const run = async () => {
      if (reduce) {
        await Promise.all([
          animate(glass.current!, { opacity: 1 }, { duration: 0.2 }),
          animate(scope.current, { opacity: [0, 1] }, { duration: 0.2 }),
        ]);
      } else if (place.phone || !f) {
        // A phone: the sheet rises a little into place as it appears.
        animate(glass.current!, { opacity: 1 }, { duration: 0.3 });
        await animate(scope.current, { opacity: [0, 1], y: [16, 0] }, { duration: 0.4, ease: IN });
      } else {
        animate(glass.current!, { opacity: 1 }, { duration: 0.4 });
        // The card flies to the left column, straightening as it goes.
        await animate(
          photo.current!,
          { x: [f.x, 0], y: [f.y, 0], scale: [f.scale, 1], rotate: [f.rotate, 0] },
          { duration: 0.6, ease: IN },
        );
        // The large card opens out from behind it...
        await animate(
          frame.current!,
          { clipPath: [rest, "inset(0 0px 0 0)"], opacity: [1, 1] },
          { duration: 0.45, ease: IN },
        );
        // ...and the words come in.
        await animate(body.current!, { opacity: [0, 1], y: [8, 0] }, { duration: 0.3, ease: IN });
      }
      close.current?.focus({ preventScroll: true });
    };
    run();
    // Once, as it comes in; leaving is shut() below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  const shut = useCallback(async () => {
    if (leaving.current || !place) return;
    leaving.current = true;
    const f = flight.current;
    if (!glass.current || !frame.current || !photo.current || !body.current) return onGone();
    if (reduce) {
      await Promise.all([
        animate(scope.current, { opacity: 0 }, { duration: 0.15 }),
        animate(glass.current, { opacity: 0 }, { duration: 0.15 }),
      ]);
      return onGone();
    }
    if (place.phone || !f) {
      animate(glass.current, { opacity: 0 }, { duration: 0.25 });
      await animate(scope.current, { opacity: 0, y: 8 }, { duration: 0.25, ease: OUT });
      return onGone();
    }
    await animate(body.current, { opacity: 0 }, { duration: 0.12 });
    await animate(
      frame.current,
      { clipPath: `inset(0 ${place.w - place.photo}px 0 0)` },
      { duration: 0.3, ease: OUT },
    );
    frame.current.style.opacity = "0";
    animate(glass.current, { opacity: 0 }, { duration: 0.4 });
    await animate(
      photo.current,
      { x: f.x, y: f.y, scale: f.scale, rotate: f.rotate },
      { duration: 0.45, ease: OUT },
    );
    onGone();
  }, [animate, onGone, place, reduce, scope]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") shut();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shut]);

  const fields = [
    { name: "Sector", value: shown(project.sector) },
    { name: "Website type", value: shown(project.websiteType) },
    { name: "Design level", value: shown(project.designLevel) },
    { name: "Identity", value: shown(project.identity) },
    { name: "Pages", value: shown(project.pages) },
    { name: "Year", value: shown(project.year) },
  ];

  const phone = place?.phone ?? false;
  const desk = place && !phone;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="fo-detail-title">
      <div ref={glass} className="fo-glass" style={{ opacity: 0 }} onClick={shut} />
      <div
        ref={scope}
        className="fo-shell"
        data-phone={phone ? "" : undefined}
        style={
          place
            ? {
                left: place.x,
                top: place.y,
                width: place.w,
                height: place.h,
                ["--fo-photo" as string]: `${place.photo}px`,
                // A phone's sheet, and every card under reduced motion,
                // fades in from nothing.
                ...(phone || reduce ? { opacity: 0 } : {}),
              }
            : { visibility: "hidden" }
        }
      >
        {/* The large card's paper and edge, opened out from behind the
            photo once it has landed (hidden until then). */}
        <div
          ref={frame}
          className="fo-frame"
          style={desk && !reduce ? { opacity: 0 } : undefined}
        />
        <div
          ref={photo}
          className="fo-shell-photo"
          // Drawn first where the card is, so the frame before the flight
          // starts never shows it anywhere else.
          style={
            desk && !reduce && flight.current
              ? {
                  transform: `translateX(${flight.current.x}px) translateY(${flight.current.y}px) scale(${flight.current.scale}) rotate(${flight.current.rotate}deg)`,
                }
              : undefined
          }
        >
          <Photo project={project} />
        </div>
        {/* On a computer the words wait for the large card to open out;
            on a phone they come in with the sheet. */}
        <div ref={body} className="fo-shell-body" style={desk && !reduce ? { opacity: 0 } : undefined}>
          <div className="flex items-start justify-between gap-4">
            <p className="fo-kicker">Selected work</p>
            <button ref={close} type="button" onClick={shut} className="fo-close">
              Close
              <span aria-hidden="true" className="ml-1.5">
                &times;
              </span>
            </button>
          </div>

          <h2
            id="fo-detail-title"
            className="display mt-3 text-[clamp(2rem,3.4vw,3.25rem)] leading-[0.98] font-medium text-ink md:mt-4"
          >
            {project.name}
          </h2>
          <p className="fo-kicker mt-2">{STATUS_LABEL[project.status]}</p>
          <ul className="fo-tags mt-4" aria-label="Services">
            {project.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>

          <dl className="fo-specs mt-7 md:mt-9">
            {fields.map((field) => (
              <div key={field.name} className="fo-spec">
                <dt>{field.name}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>

          {/* A few lines, never long ones (user: no more than five or six). */}
          <p className="fo-about mt-7 md:mt-8">{shown(project.about)}</p>

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-3 pt-8">
            {/* The live site, in a new tab; a site still being made has none. */}
            {project.status === "live" && project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener"
                className="cta-drop ml-[0.85em] inline-flex text-[1rem] leading-none"
              >
                <span className="btn-neu-face">
                  Go to the website
                  <span aria-hidden="true" className="ml-2.5 inline-block">
                    ↗
                  </span>
                </span>
              </a>
            )}
            {project.report ? (
              <a href={project.report} className="cta-drop cta-drop-light ml-[0.85em] inline-flex text-[1rem] leading-none">
                <span className="btn-neu-face">View the full project report</span>
              </a>
            ) : (
              <span aria-disabled="true" className="cta-drop cta-drop-light wk-rest ml-[0.85em] inline-flex text-[1rem] leading-none">
                <span className="btn-neu-face">View the full project report</span>
              </span>
            )}
          </div>
          {!project.report && <p className="fo-kicker mt-3">Full report coming soon</p>}
          <p className="fo-credit mt-6">Photo: {project.photo.credit}, a stand-in</p>
        </div>
      </div>
    </div>
  );
}
