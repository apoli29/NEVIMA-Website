"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { useInkAlign } from "./ink-align";
import { JellyField } from "./jelly-field";
import { useSmoothScroll } from "./smooth-scroll";
import { Readouts, WallRule } from "./statement-screen";
import { PROJECTS, STATUS_LABEL, shown, type Project } from "@/lib/work";

/* ==================================================================
   The portfolio

   One screen, set as the home page's second screen is (user: its ground
   replicated precisely): the water with its drops, the title top left,
   a line top right, the readouts along the foot under a black rule. In
   the middle, the work as a hand of cards fanned out (after the user's
   reference): two for now, crossed. Pointed at, a card straightens,
   rises and comes to the front while the other leans away and darkens.

   Pressed, the card grows out of its place into a large card in the
   middle of the screen, the page under frosted glass, the same way the
   free-proposal form opens: its photo first, filling it, then drawing
   back to the left to make room for what the project is (a grid of
   fields), a few lines about the website and the way to its full
   report. Close, Esc or a click on the glass sends it back.

   The photos are stand-ins (user: "fotos imaginárias", to be changed);
   every field the studio has not given reads as TO_FILL.
   ================================================================== */


export function Portfolio() {
  const [open, setOpen] = useState<{ project: Project; from: HTMLElement } | null>(null);
  useSmoothScroll(open !== null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  useInkAlign(titleRef, subRef);

  return (
    <>
      {/* Everything but the open card, out of reach while it is out. */}
      <div inert={open !== null}>
        <FloatingNav />
        <main id="top" className="relative">
          <section
            aria-labelledby="portfolio-title"
            className="relative h-[100svh] min-h-[40rem] overflow-hidden bg-paper"
          >
            <div className="absolute inset-0 z-0" aria-hidden="true">
              {/* Held still while the large card covers it. */}
              <JellyField covered={open !== null} />
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 pt-[7.25rem] pb-[clamp(1.25rem,3.5svh,2.75rem)] md:pt-[clamp(8.5rem,17svh,10rem)]">
              <div className="shell flex h-full flex-col">
                <div className="flex flex-wrap items-start justify-between gap-x-16 gap-y-4">
                  <h1
                    ref={titleRef}
                    id="portfolio-title"
                    data-jelly-quiet
                    className="display h1 trim-cap pointer-events-auto w-fit max-w-full shrink-0 text-ink"
                  >
                    <span className="block font-light">Portfolio.</span>
                    <span className="block font-medium">Our work, case by case.</span>
                  </h1>
                  <p
                    ref={subRef}
                    data-jelly-quiet
                    data-jelly-wide
                    className="lede trim-cap pointer-events-auto ml-auto max-w-[24rem] text-right text-[1.0625rem] leading-[1.3] text-ash md:text-[clamp(1.125rem,min(1.45vw,2.4svh),1.375rem)]"
                  >
                    <span className="block">Two projects so far, one live and one in production.</span>
                    <span className="block font-medium">Pick one to see what we made.</span>
                  </p>
                </div>

                <div className="flex min-h-0 flex-1 items-center justify-center py-6">
                  <Fan
                    hidden={open?.project.slug ?? null}
                    onOpen={(project, from) => setOpen({ project, from })}
                  />
                </div>

                <WallRule settled delay={0.2} className="mb-3 md:mb-4" />
                <Readouts settled />
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>

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
    </>
  );
}

/* --- the hand of cards -------------------------------------------------- */

function Fan({
  hidden,
  onOpen,
}: {
  /** the card that is out, kept in its place but unseen */
  hidden: string | null;
  onOpen: (project: Project, from: HTMLElement) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const shownProject = active === null ? null : PROJECTS[active];

  return (
    <div data-jelly-quiet className="pointer-events-auto flex flex-col items-center">
      <div
        className="fo-fan"
        data-active={active ?? undefined}
        onPointerLeave={() => setActive(null)}
      >
        {PROJECTS.map((project, i) => (
          <button
            key={project.slug}
            type="button"
            data-i={i}
            aria-haspopup="dialog"
            aria-label={`Open ${project.name}`}
            className="fo-card"
            style={{ visibility: hidden === project.slug ? "hidden" : undefined }}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setActive(i);
            }}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={(e) => onOpen(project, e.currentTarget)}
          >
            <Photo project={project} />
            {/* With no pointer to point with, each card names itself. */}
            <span aria-hidden="true" className="fo-card-tag mono-label">
              <span className="idx-title">{project.name}</span>
            </span>
          </button>
        ))}
      </div>
      {/* The name of the card pointed at, under the hand. */}
      <p className="fo-caption mono-label" aria-hidden="true">
        {/* Each change of name comes in quietly rather than snapping. */}
        <motion.span
          key={shownProject?.slug ?? "none"}
          className="flex gap-[0.9rem]"
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {shownProject ? (
            <>
              <span className="text-ink">{shownProject.name}</span>
              <span className="text-ash">{STATUS_LABEL[shownProject.status]}</span>
            </>
          ) : (
            <span className="text-ash">Choose a project</span>
          )}
        </motion.span>
      </p>
    </div>
  );
}

/** The project's photo, over its name: if the photo cannot be had, the
    card still says whose it is. */
function Photo({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <span className="fo-photo">
      <span className="fo-photo-name display">{project.name}</span>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
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

/** The card as it stands in the hand: its own size, centred where it is
    drawn, turned as it is turned (and scaled, while pointed at). */
function boxOf(el: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  const t = getComputedStyle(el).transform;
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

const IN = [0.22, 1, 0.36, 1] as const;
const OUT = [0.4, 0, 0.2, 1] as const;

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
    const a = boxOf(from);
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
          <div className="flex items-center justify-between gap-4">
            <p className="mono-label">
              <span className="idx-title">Project</span>
            </p>
            <button ref={close} type="button" onClick={shut} className="fo-close prop-close mono-label">
              Close
              <span aria-hidden="true" className="ml-1.5">
                &times;
              </span>
            </button>
          </div>

          <h2
            id="fo-detail-title"
            className="display mt-5 text-[clamp(2rem,3.4vw,3.25rem)] leading-[0.98] font-medium text-ink md:mt-7"
          >
            {project.name}
          </h2>
          <p className="mono-label mt-3 text-ash">{STATUS_LABEL[project.status]}</p>

          <dl className="wk-specs fo-specs mt-6 md:mt-8">
            {fields.map((field) => (
              <div key={field.name} className="wk-spec">
                <dt className="mono-label text-ash-2">{field.name}</dt>
                <dd className="mt-2 text-ink">{field.value}</dd>
              </div>
            ))}
          </dl>

          {/* A few lines, never long ones (user: no more than five or six). */}
          <p className="fo-about mt-6 md:mt-7">{shown(project.about)}</p>

          <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-8">
            {project.report ? (
              <a href={project.report} className="cta-drop ml-[0.85em] inline-flex text-[1rem] leading-none">
                <span className="btn-neu-face">View the full project report</span>
              </a>
            ) : (
              <>
                <span aria-disabled="true" className="cta-drop wk-rest ml-[0.85em] inline-flex text-[1rem] leading-none">
                  <span className="btn-neu-face">View the full project report</span>
                </span>
                <span className="mono-label text-ash">Full report coming soon</span>
              </>
            )}
          </div>
          <p className="mono-label mt-6 text-ash">Photo: {project.photo.credit}, a stand-in</p>
        </div>
      </div>
    </div>
  );
}
