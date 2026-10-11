"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { WorkTogether } from "./work-together";
import { JellyField } from "./jelly-field";
import { useSmoothScroll } from "./smooth-scroll";
import { PROJECTS, STATUS_LABEL, shown, type Project } from "@/lib/work";

/* ==================================================================
   The portfolio

   A gallery wall, not a dashboard (user, 2026-10-11: less tech, more the
   curation of a creative agency and a gallery). Of the home page's
   second screen only its water is kept, and flooded: the drops so large
   they meet and run off the edges, so the white left between them reads
   as the shapes afloat. Nothing else of that screen comes with it.

   On the water, a wall label (what the room is) and the work hung as
   prints: each photo behind a white mat, its name and state set on the
   mat below it, the two crossed as a hand of cards (the user's
   reference). Pointed at, a print straightens, rises and comes forward
   while the other leans away and darkens.

   Pressed, the print's photo is carried to the left of a large card in
   the middle of the screen, the page under frosted glass, and the card
   opens out from behind it: what the project is, a few lines about the
   website and the way to its full report. Close, Esc or a click on the
   glass sends it back.

   The photos are stand-ins (user: "fotos imaginárias", to be changed);
   every field the studio has not given reads as TO_FILL.
   ================================================================== */

/** How much bigger than on the home page the drops are drawn here. */
const FLOOD = 3.6;

export function Portfolio() {
  const [open, setOpen] = useState<{ project: Project; from: HTMLElement } | null>(null);
  useSmoothScroll(open !== null);

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
              <JellyField flood={FLOOD} covered={open !== null} />
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 pt-[6.5rem] pb-8 md:pt-[8rem] md:pb-12">
              <div className="shell flex h-full flex-col">
                {/* The wall label: what this room is. */}
                <div className="fo-label pointer-events-auto">
                  <h1 id="portfolio-title" className="fo-label-title">
                    Portfolio
                  </h1>
                  <p className="fo-label-line">Selected work</p>
                  <p className="fo-label-note">
                    Two projects so far, one live and one in production. Choose one to see it up close.
                  </p>
                </div>

                <div className="flex min-h-0 flex-1 items-center justify-center py-6">
                  <Fan
                    hidden={open?.project.slug ?? null}
                    onOpen={(project, from) => setOpen({ project, from })}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>
        <WorkTogether />
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

/* --- the prints ------------------------------------------------------------ */

function Fan({
  hidden,
  onOpen,
}: {
  /** the work that is out, kept in its place but unseen */
  hidden: string | null;
  onOpen: (project: Project, from: HTMLElement) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);
  // A carousel only once the work outgrows the row (user: centred and
  // large for now; a carousel as more projects come).
  const [overflow, setOverflow] = useState({ left: false, right: false });
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const read = () =>
      setOverflow({
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    read();
    el.addEventListener("scroll", read, { passive: true });
    const watch = new ResizeObserver(read);
    watch.observe(el);
    return () => {
      el.removeEventListener("scroll", read);
      watch.disconnect();
    };
  }, []);
  const nudge = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>(".fo-card");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: "smooth" });
  };

  return (
    <div className="fo-row-wrap pointer-events-auto">
      <div
        ref={track}
        data-lenis-prevent
        className="fo-row"
        data-active={active ?? undefined}
        data-scrolls={overflow.left || overflow.right ? "" : undefined}
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
            <span className="fo-window">
              <Photo project={project} />
            </span>
            {/* Its name and state, over the foot of the photo. */}
            <span className="fo-cap">
              <span className="fo-cap-name">{project.name}</span>
              <span className="fo-cap-meta">{STATUS_LABEL[project.status]}</span>
            </span>
            <span aria-hidden="true" className="fo-cap-arrow">
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" className="block">
                <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </span>
          </button>
        ))}
      </div>
      {(overflow.left || overflow.right) && (
        <div className="fo-row-nav">
          <button type="button" aria-label="Previous projects" disabled={!overflow.left} onClick={() => nudge(-1)}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" style={{ transform: "scaleX(-1)" }}>
              <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </button>
          <button type="button" aria-label="Next projects" disabled={!overflow.right} onClick={() => nudge(1)}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
              <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/** The project's photo, on a dark ground for while it comes (the card's
    caption already says whose it is). */
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

/** A part of a print as it stands in the hand: its own size, centred
    where it is drawn, turned and scaled as the print is. */
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
    // The photo is what is carried, turned and scaled as its card is.
    const a = boxOf(from, from.querySelector<HTMLElement>(".fo-window") ?? from);
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
                <span className="fo-kicker">Full report coming soon</span>
              </>
            )}
          </div>
          <p className="fo-credit mt-6">Photo: {project.photo.credit}, a stand-in</p>
        </div>
      </div>
    </div>
  );
}
