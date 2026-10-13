"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/* ==================================================================
   Page cover

   Links between the site's pages are followed by the router, at once,
   with no transition: the growing cover that once carried every button
   into the next page was taken out (user, 2026-10-13: "horrível"). The
   cover that is left is for a page that leaves
   by its own gesture, the portfolio's "Exit portfolio": the screen falls
   to black under a cover (`fadeThen`), the router loads the page the
   visitor came from behind it (`goTo`), and the cover fades away once
   that page has drawn. Mounted once, in the layout, so the cover
   outlives the page it fell over. For anyone who has asked for less
   motion it is a short fade both ways.
   ================================================================== */

const FADE_MS = 460;
/** If the next page never reports in, the cover still goes. */
const SAFETY_MS = 4000;
const EASE_FADE = "cubic-bezier(0.22, 1, 0.36, 1)";

let cover: HTMLDivElement | null = null;
let push: ((href: string) => void) | null = null;
let safety = 0;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Darkens the screen with a cover in `colour`, then calls `go`: for a
    page that leaves by its own gesture rather than from a button (the
    portfolio's "Exit portfolio", whose photos draw back as it falls). */
export function fadeThen(colour: string, go: () => void, delay = 0, duration = 380) {
  if (cover) return;
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483000",
    background: colour,
    pointerEvents: "all",
    opacity: "0",
  });
  document.body.appendChild(el);
  cover = el;
  const fade = el.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: reduced() ? 200 : duration,
    delay: reduced() ? 0 : delay,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    fill: "forwards",
  });
  fade.finished.then(go, go);
  window.clearTimeout(safety);
  safety = window.setTimeout(lift, SAFETY_MS + delay + duration);
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

  // Links to another page of the site are followed by the router, at
  // once and with no transition of their own: nothing reloads, so the
  // home page, once opened, never shows its curtain again on the way
  // back. A place on the same page, new tabs and modified clicks are left
  // to the browser.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      event.preventDefault();
      router.push(url.pathname + url.search + url.hash);
    };
    // Fetched as the hand reaches the link, so the page is there by the
    // time it is pressed.
    const asked = new Set<string>();
    const onOver = (event: PointerEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (asked.has(url.pathname)) return;
      asked.add(url.pathname);
      router.prefetch(url.pathname);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onOver);
    };
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
