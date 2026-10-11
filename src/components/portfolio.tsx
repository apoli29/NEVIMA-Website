"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
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

const EASE = [0.22, 1, 0.36, 1] as const;

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
          </button>
        ))}
      </div>
      {/* The name of the card pointed at, under the hand. */}
      <p className="fo-caption mono-label" aria-hidden="true">
        {shownProject ? (
          <>
            <span className="text-ink">{shownProject.name}</span>
            <span className="text-ash-2">{STATUS_LABEL[shownProject.status]}</span>
          </>
        ) : (
          <span className="text-ash-2">Choose a project</span>
        )}
      </p>
    </div>
  );
}

/** The project's photo, over its name: if the photo cannot be had, the
    card still says whose it is. */
function Photo({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
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
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover select-none"
        />
      )}
    </span>
  );
}

/* --- the large card ------------------------------------------------------- */

type Box = { x: number; y: number; w: number; h: number; rotate: number };

/** The card as it stands in the hand: its own size, centred where it is
    drawn, turned as it is turned (and scaled, while pointed at). */
function boxOf(el: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform === "none" ? undefined : getComputedStyle(el).transform);
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

/** Large in the middle of the screen; on a phone, the whole screen. */
function landing(): Box & { phone: boolean } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw < 768) return { x: 0, y: 0, w: vw, h: vh, rotate: 0, phone: true };
  const w = Math.min(1040, vw - 96);
  const h = Math.min(640, vh - 96);
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h, rotate: 0, phone: false };
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
  const photo = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const start = useRef<Box | null>(null);
  const [phone, setPhone] = useState(false);
  const leaving = useRef(false);

  // In: the card grows to the middle, then its photo draws back to make
  // room for the words. Set on the card's own pixels before the first
  // paint, so it is never seen anywhere else.
  useLayoutEffect(() => {
    const shell = scope.current;
    if (!shell || !glass.current || !photo.current || !body.current) return;
    const a = boxOf(from);
    const b = landing();
    start.current = a;
    setPhone(b.phone);
    Object.assign(shell.style, {
      width: `${a.w}px`,
      height: `${a.h}px`,
      transform: `translateX(${a.x}px) translateY(${a.y}px) rotate(${a.rotate}deg)`,
    });
    const run = async () => {
      if (reduce) {
        Object.assign(shell.style, { width: `${b.w}px`, height: `${b.h}px` });
        animate(shell, { x: b.x, y: b.y, rotate: 0 }, { duration: 0 });
        animate(photo.current!, b.phone ? { height: "38%" } : { width: "44%" }, { duration: 0 });
        await Promise.all([
          animate(glass.current!, { opacity: 1 }, { duration: 0.2 }),
          animate(shell, { opacity: [0, 1] }, { duration: 0.2 }),
          animate(body.current!, { opacity: 1 }, { duration: 0.2 }),
        ]);
      } else {
        animate(glass.current!, { opacity: 1 }, { duration: 0.45 });
        await animate(
          shell,
          { x: [a.x, b.x], y: [a.y, b.y], width: [a.w, b.w], height: [a.h, b.h], rotate: [a.rotate, 0] },
          { duration: 0.75, ease: EASE },
        );
        // The photo makes room first; the words only come in once it has.
        await animate(photo.current!, b.phone ? { height: "38%" } : { width: "44%" }, { duration: 0.55, ease: EASE });
        await animate(body.current!, { opacity: [0, 1], y: [12, 0] }, { duration: 0.45, ease: EASE });
      }
      close.current?.focus({ preventScroll: true });
    };
    run();
    // Once, as it comes in; leaving is shut() below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shut = useCallback(async () => {
    if (leaving.current) return;
    leaving.current = true;
    const shell = scope.current;
    const a = start.current;
    if (!shell || !a || !glass.current || !photo.current || !body.current) return onGone();
    if (reduce) {
      await Promise.all([
        animate(shell, { opacity: 0 }, { duration: 0.15 }),
        animate(glass.current, { opacity: 0 }, { duration: 0.15 }),
      ]);
      return onGone();
    }
    await animate(body.current, { opacity: 0 }, { duration: 0.18 });
    await animate(photo.current, phone ? { height: "100%" } : { width: "100%" }, { duration: 0.35, ease: EASE });
    animate(glass.current, { opacity: 0 }, { duration: 0.5 });
    await animate(
      shell,
      { x: a.x, y: a.y, width: a.w, height: a.h, rotate: a.rotate },
      { duration: 0.6, ease: [0.65, 0, 0.35, 1] },
    );
    onGone();
  }, [animate, onGone, phone, reduce, scope]);

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

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="pf-detail-title">
      <div ref={glass} className="fo-glass" style={{ opacity: 0 }} onClick={shut} />
      <div ref={scope} className="fo-shell" data-phone={phone ? "" : undefined}>
        <div ref={photo} className="fo-shell-photo">
          <Photo project={project} />
        </div>
        <div ref={body} className="fo-shell-body" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between gap-4">
            <p className="mono-label">
              <span className="idx-title">Project</span>
            </p>
            <button ref={close} type="button" onClick={shut} className="prop-close mono-label">
              Close
              <span aria-hidden="true" className="ml-1.5">
                &times;
              </span>
            </button>
          </div>

          <h2
            id="pf-detail-title"
            className="display mt-6 text-[clamp(2rem,3.4vw,3.25rem)] leading-[0.98] font-medium text-ink md:mt-8"
          >
            {project.name}
          </h2>
          <p className="mono-label mt-3 text-ash-2">{STATUS_LABEL[project.status]}</p>

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
                <span className="mono-label text-ash-2">Full report coming soon</span>
              </>
            )}
          </div>
          <p className="mono-label mt-6 text-ash-2">Photo: {project.photo.credit}, a stand-in</p>
        </div>
      </div>
    </div>
  );
}
