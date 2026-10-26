"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type MotionValue,
} from "motion/react";
import { basePath, type Copy } from "@/lib/i18n";
import { useHref, useT } from "@/lib/use-lang";
import { useOriginFade, useProposal } from "./proposal-flow";
import { Glass } from "./cta-glass";
import { STILL_KEY } from "./footer";
import { LiquidLens } from "./liquid-lens";
import { getLenis, holdScroll } from "./smooth-scroll";

/* ==================================================================
   The bar is a black, square-cornered strip floating clear of the page
   edges. It holds the white wordmark, which is where the opening mark
   flies to, so the slot below is measured rather than guessed.

   The labels are still the placeholders the studio asked for. Studio is
   the one that goes somewhere of its own, the about page; the others
   point at sections of the home page.
   ================================================================== */

const NAV: { label: Copy; href: string }[] = [
  { label: { en: "Home", pt: "Início" }, href: "#top" },
  { label: { en: "Portfolio", pt: "Portefólio" }, href: "/portfolio" },
  { label: { en: "About nevima", pt: "Sobre a nevima" }, href: "/about" },
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
      {className.includes("cta-drop") && <Glass />}
      {/* On its own layer so it can lean forward without the button
          following it (see .btn-neu-face). */}
      <span className="btn-neu-face">{label}</span>
    </a>
  );
}


/* ==================================================================
   "Get your free proposal", the bar's one thing to press (user,
   2026-10-11; it was "Get in touch"). On the home page it opens the
   free-proposal form, grown out of this button as the How we work
   buttons grow it, and the button keeps its place unseen while the form
   is out. Anywhere else it goes to the home page asking for the form
   (#proposal), and the home page opens it as soon as it can.
   ================================================================== */

/* Not shown on a phone, where the bar is the wordmark and the menu. A
   crate rather than a drop (user, 2026-10-26): the words on the bar's own
   black and a white key at the end carrying the arrow, with no outline.
   Pointed at, a white field runs in from the left over the whole button:
   it is a second copy of the label in the inverse colours, uncovered from
   left to right, so each letter and the key turn as the white reaches
   them. */
const ASK_CLASS = "cta-crate inline-flex items-center whitespace-nowrap text-[0.9375rem] leading-none";

function AskWords() {
  const t = useT();
  return (
    <>
      {/* In full from lg; below it the bar has no room for it beside
          the links, so it says the short of it. */}
      <span className="max-lg:hidden">{t("Get your free proposal", "Pedir proposta gratuita")}</span>
      <span className="lg:hidden">{t("Free proposal", "Proposta gratuita")}</span>
      <span aria-hidden="true" className="cta-crate-key">
        &rarr;
      </span>
    </>
  );
}

function AskLabel() {
  return (
    <>
      <AskWords />
      <span aria-hidden="true" className="cta-crate-fill">
        <AskWords />
      </span>
    </>
  );
}

function ProposalAsk() {
  const proposal = useProposal();
  const href = useHref();
  const button = useRef<HTMLButtonElement>(null);
  const [launched, setLaunched] = useState(false);
  const present = proposal?.present ?? false;
  useEffect(() => {
    if (!present) setLaunched(false);
  }, [present]);
  useOriginFade(button, proposal?.progress, launched && present);

  if (!proposal) {
    return (
      <a href={href("/#proposal")} className={`relative isolate ${ASK_CLASS}`}>
        <AskLabel />
      </a>
    );
  }
  return (
    <button
      ref={button}
      type="button"
      data-nav-proposal
      aria-haspopup="dialog"
      aria-expanded={launched && proposal.open}
      onClick={() => {
        if (!button.current) return;
        setLaunched(true);
        proposal.show(button.current, button.current, false);
      }}
      className={`relative isolate ${ASK_CLASS}`}
          >
      <AskLabel />
    </button>
  );
}

/* ==================================================================
   The menu, on a phone

   Under 640px the bar has no room for its links beside the button, so
   they are folded behind "Menu" (user, 2026-10-19): a cell of its own at
   the bar's end, ruled off as the links are, which reads "Close" while it
   is open. The panel covers the whole screen (user, 2026-10-20: it was
   meant to from the start), under the bar, which stays on it with its
   "Close", and is dressed as the foot is: black, a small grey label over
   the list, the links large in the title face, ruled off by the foot's
   own hairline, and the foot's signature, the wordmark across the whole
   width, at the bottom. It holds the bar's three links and one more, the
   way to the two forms at the foot of the page ("Get a quote"), which
   every page ends with. The proposal's drop is not on a phone's bar
   (user, 2026-10-20); the index and the foot of every page still ask.

   It closes on a link, on Escape, when focus leaves it and the bar, and
   when the screen grows past the phone's width.
   ================================================================== */

const MENU_EXTRA: { label: Copy; href: string } = {
  label: { en: "Get a quote", pt: "Pedir orçamento" },
  href: "#work-together",
};

/** The width under which the bar's links fold into the menu (sm). */
const PHONE = "(max-width: 639.98px)";

function useMenu(tucked: boolean) {
  const [open, setOpen] = useState(false);
  // Held still while the panel is out, by the page's own lock.
  useEffect(() => {
    holdScroll("menu", open);
    return () => holdScroll("menu", false);
  }, [open]);
  // The links come back to the bar on a wider screen, and the bar steps
  // out of the way at the foot: either way the panel goes.
  useEffect(() => {
    if (!open) return;
    const list = window.matchMedia(PHONE);
    const shut = () => !list.matches && setOpen(false);
    list.addEventListener("change", shut);
    return () => list.removeEventListener("change", shut);
  }, [open]);
  useEffect(() => {
    if (tucked) setOpen(false);
  }, [tucked]);
  return [open, setOpen] as const;
}

function MenuButton({ open, panel, onToggle }: { open: boolean; panel: string; onToggle: () => void }) {
  const t = useT();
  return (
    <span className="flex items-stretch border-l border-paper/15 sm:hidden">
      <button
        type="button"
        data-menu-toggle
        aria-expanded={open}
        aria-controls={panel}
        onClick={onToggle}
        // To the bar's own edge, so the whole end of the bar is the button.
        className="nav-link -mr-3 flex items-center justify-center px-3 font-mono text-[0.6875rem] tracking-[0.04em] text-paper uppercase"
      >
        {/* Both words laid out in the same cell, so it is as wide as the
            longer and the bar does not shift when it turns. */}
        <span className="grid">
          <span className={`nav-link-label col-start-1 row-start-1 text-center ${open ? "invisible" : ""}`}>Menu</span>
          <span className={`nav-link-label col-start-1 row-start-1 text-center ${open ? "" : "invisible"}`}>
            {t("Close", "Fechar")}
          </span>
        </span>
      </button>
    </span>
  );
}

function MenuPanel({
  id,
  onHome,
  onClose,
}: {
  id: string;
  onHome: boolean;
  onClose: (focusBack: boolean) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const href = useHref();
  const t = useT();
  const items = [...NAV, MENU_EXTRA];
  // The foot's light behind the links (user, 2026-10-20: in place of the
  // wordmark), held still if the visitor asked for it to be in the foot.
  const panel = useRef<HTMLDivElement>(null);
  const sign = useRef<HTMLImageElement>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    try {
      setStill(!!localStorage.getItem(STILL_KEY));
    } catch {}
  }, []);

  /* A place on this page is scrolled to once the page is let go: followed
     at once, it would be asked of a page still held for the menu. */
  const follow = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    if (!to.startsWith("#")) {
      onClose(false);
      return;
    }
    event.preventDefault();
    onClose(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const target = to === "#top" ? 0 : document.getElementById(to.slice(1));
        if (target === null) return;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(target, { force: true });
        else if (target === 0) window.scrollTo({ top: 0 });
        else target.scrollIntoView();
      }),
    );
  };

  return (
    <motion.div
      ref={panel}
      id={id}
      // Its own scrolling on a screen too short for it, which the page's
      // smooth scroll must leave alone (see Lenis's prevent attribute).
      data-lenis-prevent
      initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
      animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
      exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: reduce ? 0.15 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="ftr fixed inset-0 z-40 isolate overflow-y-auto overscroll-contain text-paper sm:hidden"
    >
      <LiquidLens host={panel} mark={sign} src="/nevima-wordmark-white.svg" still={still} />
      {/* Clear of the bar at the top, and of the phone's own bar at the foot. */}
      <div className="shell relative z-10 flex min-h-full flex-col pt-[6.75rem] pb-[max(1.75rem,env(safe-area-inset-bottom))]">
      <nav aria-label={t("Menu", "Menu")} data-calm>
        <p className="ftr-label">Menu</p>
        <ul className="mt-4 border-t border-white/10">
          {items.map((item, i) => {
            // The bar's links point at the home page; the way to the
            // forms is to this page's own, which every page ends with.
            const quote = item === MENU_EXTRA;
            const to = quote ? item.href : homeSection(item.href, onHome);
            return (
              <motion.li
                key={item.href}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: reduce ? 0 : 0.08 + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                className="border-b border-white/10"
              >
                <a
                  href={href(to)}
                  onClick={(event) => follow(event, to)}
                  className={`ftr-menu-item flex items-center justify-between py-4 text-[clamp(2rem,9.5vw,2.75rem)] max-[359.98px]:py-3 ${quote ? "ftr-menu-quote" : ""}`}
                >
                  {quote ? (
                    <span className="ftr-quote-shine">{t(item.label)}</span>
                  ) : (
                    <span className="ftr-link">{t(item.label)}</span>
                  )}
                  <span aria-hidden="true" className={`flex items-center gap-4 text-[1.375rem] ${quote ? "text-ink" : "text-paper/45"}`}>
                    {/* The green light on the right of "Get a quote", before
                        its arrow (user, 2026-10-20). */}
                    {quote && <span className="live-dot live-dot-loud shrink-0" />}
                    &rarr;
                  </span>
                </a>
              </motion.li>
            );
          })}
        </ul>
      </nav>
      {/* The foot's signature, across the whole width at the bottom, on
          the foot's light, as the foot itself has it (user, 2026-10-20);
          the bar's own mark steps aside while the menu is open. */}
      <div className="mt-auto pt-12">
        <motion.img
          ref={sign}
          src="/nevima-wordmark-white.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="block w-full select-none"
        />
      </div>
      </div>
    </motion.div>
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
  const onHome = basePath(usePathname()) === "/";
  const href = useHref();
  const t = useT();
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

  const [menuOpen, setMenuOpen] = useMenu(tucked);
  const menuId = useId();
  const header = useRef<HTMLElement>(null);
  const closeMenu = (focusBack: boolean) => {
    setMenuOpen(false);
    if (focusBack) header.current?.querySelector<HTMLElement>("[data-menu-toggle]")?.focus();
  };
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      closeMenu(true);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  return (
    // Focus that leaves the bar and its menu closes the menu.
    <div
      className="contents"
      onBlur={(event) => {
        if (menuOpen && !event.currentTarget.contains(event.relatedTarget as Node | null)) closeMenu(false);
      }}
    >
    {/* Out of the header: the header is moved by a transform (its tuck),
        which would hold a fixed panel to the header's own box. */}
    <AnimatePresence>
      {menuOpen && <MenuPanel key="menu" id={menuId} onHome={onHome} onClose={closeMenu} />}
    </AnimatePresence>
    <motion.header
      ref={header}
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
        <div ref={bar} className="pointer-events-auto -mx-3 flex items-center max-sm:min-h-[3.25rem] justify-between gap-4 bg-ink px-3 py-2.5 max-[399.98px]:gap-2.5 md:-mx-5 md:gap-8 md:px-5 md:py-[0.8125rem] xl:-mx-8 xl:px-8">
          <a
            href={onHome ? "#top" : href("/")}
            aria-label={t("nevima, home", "nevima, início")}
            className="hit-wide flex shrink-0 items-center transition-[opacity,visibility] duration-300"
            // The menu has the mark across its foot: the bar's steps aside
            // while it is open (user, 2026-10-20).
            style={menuOpen ? { opacity: 0, visibility: "hidden" } : undefined}
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
            aria-label={t("Primary", "Principal")}
            style={{ opacity: linksOpacity }}
            className="-my-2.5 flex items-stretch self-stretch md:-my-[0.8125rem]"
          >
            {NAV.map((item, i) => (
              <Pass
                key={item.href}
                href={href(homeSection(item.href, onHome))}
                label={
                  <>
                    <span className="mr-2 align-[0.12em] font-mono text-[0.625rem] tracking-[0.06em] text-paper/45 tabular-nums">
                      0{i + 1}
                    </span>
                    <span className="nav-link-label">{t(item.label)}</span>
                  </>
                }
                className="nav-link hidden border-l border-paper/15 px-4 text-[0.9375rem] text-paper sm:inline-flex lg:px-6"
              />
            ))}
            {/* The one thing to press: a white drop (see .cta-drop), in a cell
                of its own. The cell is padded by what the row took from the
                bar, so the drop, taller than the words beside it, sets the
                bar's height. Not on a phone (user, 2026-10-20): there the
                bar is the wordmark and the menu, as tall as it was with the
                drop on it. */}
            <span
              className="flex items-center border-l border-paper/15 py-2.5 pl-4 max-sm:hidden md:py-[0.8125rem] md:pl-5"
              onClickCapture={() => menuOpen && setMenuOpen(false)}
            >
              <ProposalAsk />
            </span>
            <MenuButton open={menuOpen} panel={menuId} onToggle={() => setMenuOpen(!menuOpen)} />
          </motion.nav>
        </div>
      </div>
    </motion.header>
    </div>
  );
}

export { NAV, Pass as PassLink };
