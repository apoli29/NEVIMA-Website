"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PORTFOLIO_PATH, keepSpot, takeReturn } from "@/lib/return-spot";

/* ==================================================================
   Return keeper

   Mounted once, in the layout. It notes where a visitor stands as they
   follow any link into the portfolio, and puts a page back where it
   stood when the portfolio sends them back to it (see return-spot.ts).

   The page is put back over a short while rather than once: its height
   settles as its fonts and images arrive, and the home page holds itself
   at the top for a frame or two on its way in. Anything the visitor does
   meanwhile (a wheel, a touch, a key) ends it, so it never fights them.
   ================================================================== */

/** How long the page is held to its place while it settles, in ms. */
const SETTLE_MS = 1200;

export function ReturnKeeper() {
  const path = usePathname();

  // Captured, so it is read before anything else handles the click.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== PORTFOLIO_PATH) return;
      if (window.location.pathname === PORTFOLIO_PATH) return;
      keepSpot();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    const y = takeReturn(path);
    if (y === null) return;
    const until = performance.now() + SETTLE_MS;
    let frame = 0;
    const hold = () => {
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
      if (performance.now() < until) frame = requestAnimationFrame(hold);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      off();
    };
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const off = () => events.forEach((e) => window.removeEventListener(e, stop, true));
    events.forEach((e) => window.addEventListener(e, stop, { capture: true, passive: true }));
    frame = requestAnimationFrame(hold);
    return stop;
  }, [path]);

  return null;
}
