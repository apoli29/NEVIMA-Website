"use client";

import { useEffect, useRef, useState } from "react";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { STILL_KEY } from "./footer";
import { LiquidLens } from "./liquid-lens";
import { ProjectReport } from "./project-report";
import { ProposalOverlay, useProposalController } from "./proposal-flow";
import { leavePortfolio } from "@/lib/return-spot";
import { PROJECTS, shown, type Project } from "@/lib/work";

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
   sector, a few words on what was made and the services the studio took.
   Pressed, the photo grows into the first sheet of the project's report
   (see project-report.tsx).

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
        <ProjectReport
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
                <span className="fo-frost-name">
                  <span>{project.name}</span>
                </span>
                <span className="fo-frost-sector">
                  <span className="fo-frost-key">Sector</span> {shown(project.sector)}
                </span>
                <span className="fo-frost-summary">{project.summary}</span>
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
