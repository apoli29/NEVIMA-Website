"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { SERVICES, servicePath, type Service } from "@/lib/services";
import { SlideIn } from "./enter";
import { Rise, Rule, Uncover, useSeen } from "./exhibit";
import { PassLink } from "./floating-nav";
import { useInkAlign } from "./ink-align";
import { foldProcess } from "./process";
import { RewriteTitle } from "./rewrite-title";
import { getLenis, jumpTo } from "./smooth-scroll";

/* ==================================================================
   Services

   An index with a showcase, as a gallery hangs a room: on the left a
   single framed picture with its caption, on the right the services.

   Web Design leads, as the studio's main service: its row is inked
   black, in the same shape as the rest (the user's ask, 2026-10-07).
   Every other row (Visual Identity, sold only with a website, then SEO,
   GEO and the photo shoot) carries an "Additional service" tag on its
   right.

   The showcase answers the list. Pointing at a service puts its
   picture in the frame; opening one keeps it there and runs through its
   three pictures, one after another, for as long as it stays open. Only
   one service is open at a time, and it opens in place, like a drawer:
   the description hangs from the line the name starts on, lit rather
   than faded in, with the way to the service's own page under it.

   Below lg there is no room for the frame beside the list, so an open
   drawer carries its own three pictures instead.
   ================================================================== */

/** The light starts once the drawer is mostly open, in milliseconds. */
export const LIGHT_DELAY_MS = 750;
const LIGHT_MS = 1500;
/** How far into one line the next one starts, as a share of a line. */
const LIGHT_OVERLAP = 0.6;

/** Between one row's entrance and the next, in s. */
const ROW_STAGGER_S = 0.09;
/** How long an open service's picture stays before the next, in ms. */
const SLIDE_MS = 3200;

/** Where the services' title is put when the foot sends a visitor to a
    service: clear of the bar, in px from the top of the screen. */
const FRAME_TOP = () => Math.min(Math.max(window.innerHeight * 0.15, 112), 152);

/** The ticks start once the light is most of the way through the
    description, in s, and follow one another at this pace. */
const TICK_DELAY_S = (LIGHT_DELAY_MS + LIGHT_MS * 0.8) / 1000;
const TICK_STAGGER_S = 0.16;

/** The same Unsplash photo, cut to another size. */
function sized(src: string, w: number, h: number) {
  const url = new URL(src);
  url.searchParams.set("w", String(w));
  url.searchParams.set("h", String(h));
  return url.toString();
}

/* ================================================================== */

export function Services({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState<string | null>(null);
  // The row pointed at, which the showcase shows ahead of the open one.
  const [pointed, setPointed] = useState<number | null>(null);
  const [listRef, seen] = useSeen<HTMLDivElement>(ready, "0px 0px -12% 0px");
  const titleRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  useInkAlign(titleRef, subRef);

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = useCallback(
    (slug: string) => setOpen((now) => (now === slug ? null : slug)),
    [],
  );

  /* Sent here for one service (the foot's service links point at
     /#open-<slug>, user 2026-10-12): that row opens and the section is
     always framed the same way, its title just under the bar. A hash no element
     carries, so neither the browser nor Lenis scrolls to it on its own.
     From another page the jump is instant, once the page is handed back.
     From the foot of this page the page glides up to it, quickly (user,
     2026-10-13), with How we work folded on the way so it passes as one
     still screen instead of running its slide backwards (see
     foldProcess). */
  const [asked, setAsked] = useState<{ slug: string; glide: boolean } | null>(null);
  useEffect(() => {
    const read = (glide: boolean) => {
      const slug = /^#open-([a-z-]+)$/.exec(window.location.hash)?.[1];
      if (!slug || !SERVICES.some((s) => s.slug === slug)) return;
      history.replaceState(null, "", window.location.pathname + window.location.search);
      setOpen(slug);
      setAsked({ slug, glide });
    };
    read(false);
    const onHash = () => read(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!ready || !asked) return;
    // Always the same framing, whichever service was asked for (user,
    // 2026-10-13): the section's title just under the bar. The rows
    // opening and closing below it cannot move it.
    const title = document.getElementById("services-title");
    const target = () => (title ? title.getBoundingClientRect().top + window.scrollY - FRAME_TOP() : window.scrollY);
    if (!asked.glide || reduce || !getLenis()) {
      const t = window.setTimeout(() => {
        jumpTo(target());
        setAsked(null);
      }, 120);
      return () => window.clearTimeout(t);
    }
    const lenis = getLenis()!;
    const unfold = foldProcess();
    const far = Math.abs(target() - window.scrollY) / window.innerHeight;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      off();
      unfold?.();
      setAsked(null);
    };
    // Lenis's own glide, so nothing else moves the page meanwhile; the
    // visitor's own wheel, touch or key takes the page back at once.
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const off = () => events.forEach((e) => window.removeEventListener(e, finish, true));
    events.forEach((e) => window.addEventListener(e, finish, { capture: true, passive: true }));
    lenis.scrollTo(target(), {
      // Off at once, settling at the end: quick to answer the click.
      duration: Math.min(1.25, 0.55 + far * 0.1),
      easing: (t) => 1 - Math.pow(1 - t, 4),
      force: true,
      onComplete: finish,
    });
    return finish;
  }, [ready, asked, reduce]);

  const openIndex = SERVICES.findIndex((s) => s.slug === open);
  const shown = pointed ?? (openIndex >= 0 ? openIndex : 0);

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      // No foot padding: the comparison below brings its own head room, as
      // this section does for the studio above it.
      className="relative z-10 bg-paper pt-(--section-gap)"
    >
      <div className="shell">
        {/* Side by side from lg, the subtitle's first line level with the top
            of the title's last letter (see ink-align.ts). */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <SlideIn ready={ready} className="flex items-start gap-2 md:gap-3">
            {/* "We only do websites", corrected in place (see rewrite-title.tsx). */}
            {/* One line from lg. */}
            <div ref={titleRef}>
              <RewriteTitle
                ready={ready}
                id="services-title"
                className="display text-[clamp(2rem,3.4vw,3.25rem)] font-light text-ink lg:whitespace-nowrap"
              />
            </div>
          </SlideIn>
          <SlideIn
            ready={ready}
            from="right"
            delay={0.12}
            className="max-w-[17rem] shrink-0 lg:text-right"
          >
            <p ref={subRef} className="text-[0.9375rem] leading-[1.45] text-balance text-ash">
              Websites first. Every additional service is offered only
              together with a website we design.
            </p>
          </SlideIn>
        </div>

        <div ref={listRef} className="relative mt-8 grid grid-cols-12 gap-x-4 md:mt-10">
          <Rule shown={seen} className="absolute inset-x-0 top-0 bg-ink" />

          <Showcase index={shown} open={openIndex >= 0 && pointed === null} seen={seen} reduce={reduce} />

          <ol
            data-open={open ? "" : undefined}
            onPointerLeave={() => setPointed(null)}
            className="xs-list col-span-12 lg:col-span-7 lg:col-start-6"
          >
            {SERVICES.map((service, i) => (
              <Row
                key={service.slug}
                service={service}
                index={i}
                mark={`0${i + 1}`}
                open={open === service.slug}
                seen={seen}
                reduce={reduce}
                onToggle={toggle}
                onPoint={(on) => setPointed(on && open !== service.slug ? i : null)}
              />
            ))}
          </ol>

          {/* Under the list's last row, in its column, its right edge on the
              rows' "n" rings (user, 2026-10-14: small and thin, after the
              tags and the ring; its left edge is free). */}
          <div className="col-span-12 flex justify-end pt-6 md:pt-7 lg:col-span-7 lg:col-start-6">
            <PortfolioCall />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================================================================
   The way to the portfolio: the section's one call to see the work
   (user, 2026-10-11: one call, in place of the web design page's own).
   Since 2026-10-14 (user: smaller and thinner, after the services'
   tags and the "n" ring) it is cut from the rows' own parts: a black
   band as high as the ring, its words in the tags' mono, an arrow
   after them, hung under the list with its right edge on the rings'.
   The light still passes over it on its slow clock.
   ================================================================== */

function PortfolioCall() {
  return (
    <a href="/portfolio" className="svc-folio">
      <span className="mono-label">See our work</span>
      <span aria-hidden="true" className="svc-folio-arrow">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" className="block">
          <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </span>
    </a>
  );
}

/* ================================================================== */
/* Showcase: the framed picture beside the list                         */
/* ================================================================== */

/* Each new picture is uncovered over the one before it, from the foot up,
   settling as it comes, and the one under it is let go once it is
   covered. */
function Showcase({
  index,
  open,
  seen,
  reduce,
}: {
  index: number;
  /** The service shown is the open one: run through its pictures. */
  open: boolean;
  seen: boolean;
  reduce: boolean;
}) {
  const service = SERVICES[index];
  const [slide, setSlide] = useState(0);

  // Back to the first picture whenever the service changes; through the
  // three for as long as an open one is shown.
  useEffect(() => setSlide(0), [index]);
  const count = service.photos.length;
  useEffect(() => {
    if (!open || reduce || count < 2) return;
    const id = window.setInterval(() => setSlide((n) => (n + 1) % count), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [open, reduce, index, count]);

  // A service with no pictures yet leaves the frame empty.
  const src = service.photos[slide] ?? "";
  const [layers, setLayers] = useState([{ src, key: 0 }]);
  useEffect(() => {
    setLayers((now) =>
      now[now.length - 1].src === src
        ? now
        : [...now.slice(-2), { src, key: now[now.length - 1].key + 1 }],
    );
  }, [src]);

  return (
    <figure className="hidden lg:col-span-3 lg:block">
      <div className="sticky top-28 pt-6">
        <Uncover shown={seen} className="relative aspect-[4/5] bg-ink/5">
          {layers.filter((layer) => layer.src).map((layer, i, shownLayers) => (
            <motion.div
              key={layer.key}
              className="absolute inset-0"
              initial={i === 0 || reduce ? false : { clipPath: "inset(100% 0% 0% 0%)", scale: 1.08 }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
              transition={{
                clipPath: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
                scale: { duration: 1.3, ease: [0.22, 1, 0.36, 1] },
              }}
              onAnimationComplete={() => {
                if (i === shownLayers.length - 1 && i > 0) setLayers((now) => now.slice(-1));
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sized(layer.src, 800, 1000)}
                alt=""
                decoding="async"
                draggable={false}
                className="block size-full object-cover select-none"
              />
            </motion.div>
          ))}
        </Uncover>
        <figcaption className="mono-label mt-3 flex items-baseline justify-between gap-4 text-ash-2">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="block size-[7px] bg-ink" />
            <span className="text-ink tabular-nums">Fig. 0{index + 1}</span>
            <span>— {service.title}</span>
          </span>
          <span className="tabular-nums">
            {count ? `${slide + 1} / ${count}` : "Photos to come"}
          </span>
        </figcaption>
      </div>
    </figure>
  );
}

/* ================================================================== */
/* Row                                                                 */
/* ================================================================== */

function Row({
  service,
  index,
  mark,
  open,
  seen,
  reduce,
  onToggle,
  onPoint,
}: {
  service: Service;
  /** its place in the section's entrance */
  index: number;
  /** its number, set after the name like an exponent */
  mark: string;
  open: boolean;
  seen: boolean;
  reduce: boolean;
  onToggle: (slug: string) => void;
  onPoint: (on: boolean) => void;
}) {
  const headId = `service-${service.slug}-name`;
  const bodyId = `service-${service.slug}`;
  const delay = 0.15 + index * ROW_STAGGER_S;
  // One whole turn of the mark per click, counted so it always turns the
  // same way round however quickly the clicks come.
  const [turns, setTurns] = useState(0);
  // The light runs again every time the drawer is opened.
  const [opened, setOpened] = useState(0);
  const main = service.tier === "main";

  return (
    <li
      data-open={open ? "" : undefined}
      data-main={main ? "" : undefined}
      className="xs-row relative"
    >
      <h3>
        <button
          type="button"
          id={headId}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => {
            setTurns((n) => n + 1);
            if (!open) setOpened((n) => n + 1);
            onPoint(false);
            onToggle(service.slug);
          }}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") onPoint(true);
          }}
          className="xs-head grid w-full grid-cols-[1fr_auto] items-center gap-x-3 py-4 text-left md:gap-x-4 md:py-5"
        >
          <span className="min-w-0">
            {/* Sized on the slot, not the name, so the room the slot leaves
                for the tails under the line is measured in the name's ems. */}
            <Rise
              shown={seen}
              delay={delay}
              className="text-[clamp(1.3rem,2.1vw,2rem)]"
            >
              <span
                className={`xs-name display block leading-[0.98] font-light tracking-[-0.03em] ${main ? "text-paper" : "text-ink"}`}
              >
                {service.title}
                {/* Its number, hung off the name's top right like an
                    exponent (user), so it rises, dims and moves with it. */}
                <sup
                  aria-hidden="true"
                  className={`xs-exp ${main ? "text-paper/60" : "text-ash-2"}`}
                >
                  {mark}
                </sup>
              </span>
            </Rise>
          </span>

          <motion.span
            className="flex shrink-0 items-center gap-4 self-center md:gap-5"
            initial={false}
            animate={{ opacity: seen || reduce ? 1 : 0, scale: seen || reduce ? 1 : 0.6 }}
            transition={{ duration: 0.6, delay: delay + 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* What kind of service it is, on the right. */}
            <span className={`mono-label max-sm:hidden ${main ? "xs-tag-main" : "idx-title"}`}>
              {main ? "Main service" : "Additional service"}
            </span>
            <Chevron open={open} turns={turns} reduce={reduce} small />
          </motion.span>
        </button>
      </h3>

      <div
        id={bodyId}
        role="region"
        aria-labelledby={headId}
        data-open={open}
        // Closed, the drawer still holds its words and its link; nothing in
        // it may be reached until it is open.
        inert={!open}
        className="xs-panel"
      >
        <div>
          {/* Hung from the line the name starts on. */}
          <div className="pr-0 pb-7 md:pr-[4rem] md:pb-9">
            {open && !reduce ? (
              <Illuminated
                key={opened}
                text={service.body}
                delayMs={LIGHT_DELAY_MS}
                reduce={reduce}
                className={`xs-copy svc-copy ${main ? "" : "std-ink"} text-[clamp(1.0625rem,1.25vw,1.25rem)] leading-[1.3] tracking-[-0.014em]`}
              />
            ) : (
              // Closing, the words stay lit while the drawer shuts on them.
              <p
                data-lit="true"
                className={`xs-copy svc-copy ${main ? "" : "std-ink"} text-[clamp(1.0625rem,1.25vw,1.25rem)] leading-[1.3] tracking-[-0.014em]`}
              >
                {service.body}
              </p>
            )}

            {service.included && (
              <Included
                // Apart from the description's key, beside which it stands.
                key={`included-${opened}`}
                included={service.included}
                play={open && !reduce}
                onInk={main}
                className="mt-7 md:mt-9"
              />
            )}

            {/* Where there is no showcase, the drawer carries the pictures. */}
            <div className="mt-6 grid grid-cols-3 gap-2 lg:hidden">
              {service.photos.map((photo, i) => (
                <Uncover
                  key={photo}
                  shown={open}
                  delay={open ? 0.3 + i * 0.1 : 0}
                  className="aspect-[4/5] bg-ink/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sized(photo, 360, 450)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="block size-full object-cover select-none"
                  />
                </Uncover>
              ))}
            </div>

            {/* The way out of the index and into the service's own page.
                Web design has none any more: its work is in the portfolio,
                reached by the call under the list. */}
            {service.slug !== "web-design" && (
              <div className="mt-7 md:mt-8">
                <PassLink
                  href={servicePath(service.slug)}
                  label={`Explore ${service.title}`}
                  className={`cta-drop inline-flex text-[1rem] leading-none ${main ? "cta-drop-light" : ""}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Rule
        shown={seen}
        delay={delay + 0.1}
        className="absolute inset-x-0 bottom-0 bg-ink/25"
      />
    </li>
  );
}

/* What comes with a service, ticked off under its description. Opening a
   drawer, the ticks are drawn in one after another as the light finishes
   the words above them, each line coming up with its own; closing, they
   stay drawn while the drawer shuts. The tick is a single pen stroke: a
   short down-stroke, then a long arm that eases as it rises. */
export function Included({
  included,
  play,
  onInk = false,
  className,
}: {
  included: NonNullable<Service["included"]>;
  /** Draw the ticks in, rather than show them drawn. */
  play: boolean;
  /** Set on the inked Web Design row. */
  onInk?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className={`mono-label ${onInk ? "text-paper/55" : "text-ash-2"}`}>
        {included.title}
      </p>
      <ul className="mt-3.5 grid gap-2.5 md:mt-4 md:gap-3">
        {included.items.map((item, i) => {
          const delay = TICK_DELAY_S + i * TICK_STAGGER_S;
          return (
            <motion.li
              key={item}
              className={`grid grid-cols-[1.125rem_1fr] gap-x-3 text-[0.9375rem] leading-[1.45] tracking-[-0.006em] md:text-[1rem] ${onInk ? "text-paper/85" : "text-ink/80"}`}
              initial={play ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* A box a line high, so the tick sits on the first line. */}
              <span aria-hidden="true" className="flex h-[1.45em] items-center">
                <svg
                  viewBox="0 0 18 18"
                  fill="none"
                  className={`block size-[1.0625rem] ${onInk ? "text-paper" : "text-ink"}`}
                >
                  <motion.path
                    d="M3.4 9.7 7.1 13.3C9.4 9.5 11.8 6.7 15 4.3"
                    stroke="currentColor"
                    strokeWidth={1.35}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={play ? { pathLength: 0 } : false}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: delay + 0.08, ease: [0.65, 0, 0.35, 1] }}
                  />
                </svg>
              </span>
              <span>{item}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* The studio's "n" standing in for the chevron of an accordion. It always
   comes to rest upright; every click spins it once all the way round, and
   the ring it stands in, filled black, is what says the row is open. */
export function Chevron({
  open,
  turns,
  reduce,
  small = false,
}: {
  open: boolean;
  turns: number;
  reduce: boolean;
  /** A size down, for the services' tighter rows. */
  small?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-open={open}
      className={`xs-toggle grid place-items-center rounded-full ${small ? "size-9 md:size-10" : "size-10 md:size-12"}`}
    >
      <motion.span
        className={`block ${small ? "w-[0.6875rem] md:w-3" : "w-3 md:w-[0.875rem]"}`}
        initial={false}
        animate={{ rotate: turns * 360 }}
        transition={
          reduce ? { duration: 0 } : { duration: 1.1, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <svg viewBox="0 0 318 349" width="100%" className="block" fill="currentColor">
          <path d="M0 349V11H66L74 70C96 31 139 0 199 0C274 0 318 45 318 122V349H244V144C244 88 209 63 173 63C116 63 75 99 75 166V349Z" />
        </svg>
      </motion.span>
    </span>
  );
}

/* ================================================================== */
/* Illuminated: the description, lit line by line                      */
/*                                                                     */
/* Lines are whatever the browser wrapped, so they are read back from   */
/* the layout: the words are set once, their tops grouped into lines,   */
/* and each line then gets its own sweep. Once the last one has run the */
/* spans are dropped for plain text, which rewraps freely on resize.    */
/* ================================================================== */

/** One wrapped line: whatever part of the lead fell on it, then the rest,
    then whatever of the marked tail reached it. */
type LitLine = { lead: string; body: string; mark: string };

function LineWords({ line }: { line: LitLine }) {
  return (
    <>
      {line.lead && <strong>{line.lead}</strong>}
      {line.lead && (line.body || line.mark) ? " " : null}
      {line.body}
      {line.body && line.mark ? " " : null}
      {line.mark && <mark>{line.mark}</mark>}
    </>
  );
}

export function Illuminated({
  text,
  lead,
  mark,
  delayMs,
  durationMs = LIGHT_MS,
  reduce,
  className,
}: {
  text: string;
  /** Set in bold ahead of the text and lit with it (the comparison table). */
  lead?: string;
  /** Run on under the text and struck through with a marker (the pillar).
      It keeps its own colours, so it is lit as its own ground asks. */
  mark?: string;
  delayMs: number;
  /** How long the light takes over the whole paragraph, in ms. */
  durationMs?: number;
  reduce: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState<LitLine[] | null>(null);
  const [lit, setLit] = useState(reduce);
  // Split after every hyphen as well as at spaces. The browser may break a
  // line inside "cost-benefit", and a word read back whole would put all of
  // it on the line its first half fell on, pushing that line past its edge.
  // A glued piece is followed by the rest of its word, not by a space.
  const pieces = (value: string) =>
    value.split(" ").flatMap((word) => {
      const parts = word.split("-");
      return parts.map((part, i) => {
        const glued = i < parts.length - 1;
        return { piece: glued ? `${part}-` : part, glued };
      });
    });
  const leadPieces = lead ? pieces(lead) : [];
  const markPieces = mark ? pieces(mark) : [];

  useLayoutEffect(() => {
    if (lit) return;
    const words = ref.current?.querySelectorAll<HTMLElement>("[data-word]");
    if (!words?.length) return;
    const found: LitLine[] = [];
    let top = Number.NaN;
    words.forEach((word) => {
      if (word.offsetTop !== top) {
        found.push({ lead: "", body: "", mark: "" });
        top = word.offsetTop;
      }
      const line = found[found.length - 1];
      const part =
        (word.textContent ?? "") +
        (word.dataset.glued === undefined ? " " : "");
      if (word.dataset.lead !== undefined) line.lead += part;
      else if (word.dataset.mark !== undefined) line.mark += part;
      else line.body += part;
    });
    setLines(
      found.map((line) => ({
        lead: line.lead.trimEnd(),
        body: line.body.trimEnd(),
        mark: line.mark.trimEnd(),
      })),
    );
    // Measured once per mount: the card remounts this for every opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A resize mid-sweep would leave the measured lines wrong, so it simply
  // finishes the effect.
  useEffect(() => {
    if (lit) return;
    const finish = () => setLit(true);
    window.addEventListener("resize", finish);
    return () => window.removeEventListener("resize", finish);
  }, [lit]);

  const per = lines ? durationMs / (1 + LIGHT_OVERLAP * (lines.length - 1)) : 0;

  return (
    <p ref={ref} className={className} data-lit={lit}>
      {lit ? (
        <>
          {lead && <strong>{lead}</strong>}
          {lead ? " " : null}
          {text}
          {mark ? " " : null}
          {mark && <mark>{mark}</mark>}
        </>
      ) : lines ? (
        lines.map((line, i) => (
          // The grey line holds the place and is the one read aloud; the
          // lit copy sits exactly over it and the light uncovers it.
          <span key={i} className="svc-line">
            <span>
              <LineWords line={line} />
            </span>
            <span
              aria-hidden="true"
              className="svc-line-lit"
              style={{
                animationDuration: `${per}ms`,
                animationDelay: `${delayMs + i * per * LIGHT_OVERLAP}ms`,
              }}
              onAnimationEnd={
                i === lines.length - 1 ? () => setLit(true) : undefined
              }
            >
              <LineWords line={line} />
            </span>
          </span>
        ))
      ) : (
        <>
          {/* The lead's spaces sit inside its bold, as they do once lit, so
              the words measure at the widths they will be drawn at. */}
          {leadPieces.length > 0 && (
            <>
              <strong>
                {leadPieces.map(({ piece, glued }, i) => (
                  <Fragment key={i}>
                    <span
                      data-word=""
                      data-lead=""
                      data-glued={glued ? "" : undefined}
                    >
                      {piece}
                    </span>
                    {glued || i === leadPieces.length - 1 ? null : " "}
                  </Fragment>
                ))}
              </strong>{" "}
            </>
          )}
          {pieces(text).map(({ piece, glued }, i) => (
            <Fragment key={i}>
              <span data-word="" data-glued={glued ? "" : undefined}>
                {piece}
              </span>
              {glued ? null : " "}
            </Fragment>
          ))}
          {/* Measured inside its own marker, padding and all, or the words
              would be read back at widths they are never drawn at. */}
          {markPieces.length > 0 && (
            <mark>
              {markPieces.map(({ piece, glued }, i) => (
                <Fragment key={i}>
                  <span
                    data-word=""
                    data-mark=""
                    data-glued={glued ? "" : undefined}
                  >
                    {piece}
                  </span>
                  {glued || i === markPieces.length - 1 ? null : " "}
                </Fragment>
              ))}
            </mark>
          )}
        </>
      )}
    </p>
  );
}
