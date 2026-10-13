"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/* ==================================================================
   Page wipe

   Going from one page of the site to another, the button that was
   pressed grows to cover the screen, in its own colour and from its own
   shape, the next page is put behind it, and it fades away to show it
   (user, 2026-10-13: as "See our work" already seemed to do, by its
   black band and the portfolio's black, but smooth and on every button).

   Mounted once, in the layout, so the cover outlives the page it rose
   from. Any plain link to another page of the site is taken over:
   the click is held, the cover grows, and the next page is loaded by the
   router rather than the browser, so nothing reloads. A link to a place
   on the same page is left alone, as are new tabs, modified clicks and
   links elsewhere. Anything that leaves a page another way (the
   portfolio's "Exit portfolio") calls `wipeThen` with its own way out.

   For anyone who has asked for less motion the cover simply fades in
   and out.
   ================================================================== */

const GROW_MS = 560;
const FADE_MS = 460;
/** If the next page never reports in, the cover still goes. */
const SAFETY_MS = 4000;
const EASE_GROW = "cubic-bezier(0.76, 0, 0.24, 1)";
const EASE_FADE = "cubic-bezier(0.22, 1, 0.36, 1)";

let cover: HTMLDivElement | null = null;
let push: ((href: string) => void) | null = null;
let safety = 0;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The colour a button is seen in: its own, the first ancestor's with
    one, or the site's black. The drop buttons draw their colour in a
    layer of their own, so they say which they are by their class. */
function colourOf(el: HTMLElement) {
  if (el.closest(".cta-drop-light")) return "#ffffff";
  if (el.closest(".cta-drop")) return "#000000";
  for (let n: HTMLElement | null = el, i = 0; n && i < 6; n = n.parentElement, i++) {
    const bg = getComputedStyle(n).backgroundColor;
    if (bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg)) return bg;
  }
  return "#000000";
}

/** Grows the cover out of `from`, then calls `go`. */
export function wipeThen(from: HTMLElement, go: () => void) {
  if (cover) return;
  const r = from.getBoundingClientRect();
  const radius = getComputedStyle(from).borderTopLeftRadius || "0px";
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483000",
    background: colourOf(from),
    pointerEvents: "all",
  });
  document.body.appendChild(el);
  cover = el;

  const start = `inset(${Math.max(r.top, 0)}px ${Math.max(vw - r.right, 0)}px ${Math.max(vh - r.bottom, 0)}px ${Math.max(r.left, 0)}px round ${radius})`;
  const grow = reduced()
    ? el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" })
    : el.animate([{ clipPath: start }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }], {
        duration: GROW_MS,
        easing: EASE_GROW,
        fill: "forwards",
      });
  grow.finished.then(go, go);
  window.clearTimeout(safety);
  safety = window.setTimeout(lift, SAFETY_MS + GROW_MS);
}

/** Fades the cover away, once the next page is there under it. */
function lift() {
  const el = cover;
  if (!el) return;
  window.clearTimeout(safety);
  cover = null;
  const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: reduced() ? 200 : FADE_MS,
    easing: EASE_FADE,
    fill: "forwards",
  });
  el.style.pointerEvents = "none";
  fade.finished.then(
    () => el.remove(),
    () => el.remove(),
  );
}

/** The router's way to a page, for code that leaves one on its own. */
export function goTo(href: string) {
  if (push) push(href);
  else window.location.assign(href);
}

export function PageWipe() {
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    push = (href) => router.push(href);
    return () => {
      push = null;
    };
  }, [router]);

  // Bubbled, so anything that handles the click itself first (and stops
  // it, or prevents it) keeps it.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download") || link.dataset.noWipe !== undefined) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // A place on this same page: the page scrolls there itself.
      if (url.pathname === window.location.pathname) return;
      event.preventDefault();
      const href = url.pathname + url.search + url.hash;
      router.prefetch(url.pathname);
      wipeThen(link, () => router.push(href));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  // The next page is in: let it be seen once it has drawn itself.
  useEffect(() => {
    if (!cover) return;
    let a = 0;
    let b = 0;
    const t = window.setTimeout(() => {
      a = requestAnimationFrame(() => {
        b = requestAnimationFrame(lift);
      });
    }, 120);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [path]);

  return null;
}
