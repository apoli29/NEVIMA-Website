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
import { RewriteTitle } from "./rewrite-title";

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

/* The line under each name: what an acronym stands for, or how the
   service is sold, or, for the one that needs neither, what it is for,
   in the words of its own description. */
const LINE: Record<string, string> = {
  "web-design": "Websites that make a business stand out",
  "visual-identity": "Only together with a website",
  "photo-shoot": "Photos, or photos and video",
};



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
                className="display text-[clamp(2.25rem,4.2vw,4.25rem)] font-light text-ink lg:whitespace-nowrap"
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

        <div ref={listRef} className="relative mt-12 grid grid-cols-12 gap-x-4 md:mt-16">
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
                mark={`(0${i + 1})`}
                open={open === service.slug}
                seen={seen}
                reduce={reduce}
                onToggle={toggle}
                onPoint={(on) => setPointed(on && open !== service.slug ? i : null)}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
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
    <figure className="hidden lg:col-span-4 lg:block">
      <div className="sticky top-28 pt-10">
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
  /** what stands before the name: its number, or a plus for a service
      sold inside another */
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
  const line = service.full ?? LINE[service.slug];
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
          className="xs-head grid w-full grid-cols-[2.75rem_1fr_auto] items-center gap-x-3 py-5 text-left md:grid-cols-[3.5rem_1fr_auto] md:gap-x-4 md:py-7"
        >
          <motion.span
            className="mono-label self-start pt-[0.55em] text-ash-2 tabular-nums md:pt-[0.9em]"
            initial={false}
            animate={{ opacity: seen || reduce ? 1 : 0 }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
          >
            {mark}
          </motion.span>

          <span className="min-w-0">
            {/* Sized on the slot, not the name, so the room the slot leaves
                for the tails under the line is measured in the name's ems. */}
            <Rise
              shown={seen}
              delay={delay}
              className="text-[clamp(1.6rem,2.8vw,2.7rem)]"
            >
              <span
                className={`xs-name display block leading-[0.98] font-light tracking-[-0.03em] ${main ? "text-paper" : "text-ink"}`}
              >
                {service.title}
              </span>
            </Rise>
            {line && (
              <motion.span
                className={`mono-label mt-2 block md:mt-2.5 ${main ? "text-paper/70" : "text-ash"}`}
                initial={false}
                animate={{ opacity: seen || reduce ? 1 : 0 }}
                transition={{ duration: 0.6, delay: delay + 0.3 }}
              >
                {line}
              </motion.span>
            )}
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
            <Chevron open={open} turns={turns} reduce={reduce} />
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
          <div className="pr-0 pb-9 pl-[calc(2.75rem+0.75rem)] md:pr-[4.5rem] md:pb-11 md:pl-[calc(3.5rem+1rem)]">
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

            {/* The way out of the index and into the service's own page. */}
            <div className="mt-7 md:mt-8">
              <PassLink
                href={servicePath(service.slug)}
                label={`Explore ${service.title}`}
                className={`cta-drop inline-flex text-[1rem] leading-none ${main ? "cta-drop-light" : ""}`}
              />
            </div>
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

/* The studio's "n" standing in for the chevron of an accordion. It always
   comes to rest upright; every click spins it once all the way round, and
   the ring it stands in, filled black, is what says the row is open. */
export function Chevron({
  open,
  turns,
  reduce,
}: {
  open: boolean;
  turns: number;
  reduce: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-open={open}
      className="xs-toggle grid size-10 place-items-center rounded-full md:size-12"
    >
      <motion.span
        className="block w-3 md:w-[0.875rem]"
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
