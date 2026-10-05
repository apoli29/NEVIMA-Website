"use client";

import { useRef, useState, type ReactNode, type RefObject } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type MotionValue,
} from "motion/react";

/* ==================================================================
   The bar is a black, square-cornered strip floating clear of the page
   edges. It holds the white wordmark, which is where the opening mark
   flies to, so the slot below is measured rather than guessed.

   The labels are still the placeholders the studio asked for. Studio is
   the one that goes somewhere of its own, the about page; the others
   point at sections of the home page.
   ================================================================== */

const NAV = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Studio", href: "/about" },
];

/** A link to a section of the home page, from wherever the bar is: off the
    home page it has to go there first. Anything else is left as it is. */
export function homeSection(href: string, onHome: boolean) {
  return href.startsWith("#") && !onHome ? `/${href}` : href;
}

/* ==================================================================
   A link set as a button, for the bar and for the calls to action down
   the page (exported as PassLink). It once threw the boomerang across
   itself when pointed at; the studio has since asked for no boomerangs
   on its calls to action, so each button answers in its own way (see
   .cta-drop and .nav-link).
   ================================================================== */

function Pass({
  href,
  label,
  className,
}: {
  href: string;
  label: ReactNode;
  className: string;
}) {
  return (
    <a
      href={href}
      // No display utility here on purpose: the caller owns it. Setting one
      // both places leaves Tailwind's source order to decide which wins, and
      // it is not the one written last in the attribute.
      className={`relative isolate items-center justify-center whitespace-nowrap ${className}`}
    >
      {/* On its own layer so it can lean forward without the button
          following it (see .btn-neu-face). */}
      <span className="btn-neu-face">{label}</span>
    </a>
  );
}


/* ================================================================== */

export function FloatingNav({
  opacity = 1,
  linksOpacity = 1,
  markRef,
  onMarkLoad,
  markVisible = true,
}: {
  /** The bar. It is black on the black curtain, so it can be fully in
      under the landed mark without anyone seeing it arrive. Left out (on
      a page with no opening), it is simply there. */
  opacity?: MotionValue<number> | number;
  /** The links. They are what would show on the curtain, so they come in
      with the page rather than with the bar. */
  linksOpacity?: MotionValue<number> | number;
  /** the wordmark slot the opening mark flies into */
  markRef?: RefObject<HTMLImageElement | null>;
  /** the slot has a width to be measured against */
  onMarkLoad?: () => void;
  markVisible?: boolean;
}) {
  const reduce = useReducedMotion();
  const onHome = usePathname() === "/";
  const bar = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // The footer carries the same links and the address itself, and once it
  // is taller than what is left of the screen the bar would sit on top of
  // them, the address first. So the bar steps out of the way as the footer
  // reaches it, and comes back as soon as the footer drops below it again.
  // Measured from the bar's layout box, which its own lift does not move.
  const [tucked, setTucked] = useState(false);
  useMotionValueEvent(scrollY, "change", () => {
    const foot = document.getElementById("contact");
    const b = bar.current;
    if (!foot || !b) return;
    setTucked(foot.getBoundingClientRect().top < b.offsetTop + b.offsetHeight + 16);
  });

  return (
    <motion.header
      style={{ opacity }}
      animate={{ y: tucked ? "-120%" : "0%" }}
      transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      // Out of reach while it is out of sight.
      inert={tucked}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-4 md:pt-6"
    >
      {/* Same container as the headline, so the two share a left edge. The
          bar then hangs out of that column by exactly its own padding, which
          puts the wordmark back on the column edge and leaves the difference
          between the gutter and that padding as the float. */}
      <div className="shell">
        {/* Square-cornered, as everything set on the gallery wall is. */}
        <div ref={bar} className="pointer-events-auto -mx-3 flex items-center justify-between gap-4 bg-ink px-3 py-2.5 md:-mx-5 md:gap-8 md:px-5 md:py-[0.8125rem] xl:-mx-8 xl:px-8">
          <a
            href={onHome ? "#top" : "/"}
            aria-label="nevima, home"
            className="flex shrink-0 items-center"
          >
            {/* Held invisible until the opening mark has landed on it, then
                taken over from the flying copy in the same pixels. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={markRef}
              src="/nevima-wordmark-white.svg"
              alt="nevima"
              onLoad={onMarkLoad}
              className="block h-[1.35rem] w-auto md:h-[1.55rem]"
              style={{ opacity: markVisible ? 1 : 0 }}
            />
          </a>

          {/* The links stand in cells, ruled off from one another by
              hairlines that run the bar's full height, the way the second
              screen is ruled into columns; each carries its number, as the
              index there does. */}
          <motion.nav
            aria-label="Primary"
            style={{ opacity: linksOpacity }}
            className="-my-2.5 flex items-stretch self-stretch md:-my-[0.8125rem]"
          >
            {NAV.map((item, i) => (
              <Pass
                key={item.href}
                href={homeSection(item.href, onHome)}
                label={
                  <>
                    <span className="mr-2 align-[0.12em] font-mono text-[0.625rem] tracking-[0.06em] text-paper/45 tabular-nums">
                      0{i + 1}
                    </span>
                    <span className="nav-link-label">{item.label}</span>
                  </>
                }
                className="nav-link hidden border-l border-paper/15 px-5 text-[0.9375rem] text-paper sm:inline-flex lg:px-6"
              />
            ))}
            {/* The one thing to press: a white drop (see .cta-drop), in a cell
                of its own. The cell is padded by what the row took from the
                bar, so the drop, taller than the words beside it, sets the
                bar's height. */}
            <span className="flex items-center border-paper/15 py-2.5 sm:border-l sm:pl-4 md:py-[0.8125rem] md:pl-5">
              <Pass
                href="#contact"
                label={
                  <>
                    Get in touch
                    <span aria-hidden="true" className="ml-2.5 inline-block">
                      &rarr;
                    </span>
                  </>
                }
                className="cta-drop cta-drop-light inline-flex text-[0.9375rem] leading-none"
              />
            </span>
          </motion.nav>
        </div>
      </div>
    </motion.header>
  );
}

export { NAV, Pass as PassLink };
