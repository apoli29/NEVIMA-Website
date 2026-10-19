"use client";

import { useEffect } from "react";

/* ==================================================================
   Off-screen pause

   Mounted once, in the layout. The site's never-ending CSS loops (the
   drops' glass, the index's gleam and breath, the services' beckon, the
   comparison's marker, the portraits' shake, the live lights) kept
   running wherever they were, the second screen's long after the studio
   had closed over it and the page had moved on. Several of them can only
   be played by repainting, so the whole page was repainted on every
   frame for loops nobody could see.

   Each of them is now held where it is while it is off the screen
   ([data-offscreen], globals.css) and let go again a little before it
   comes back, so nothing on screen ever differs. Elements mounted later
   (a form, a row, the bar's drop) are picked up as they arrive.
   ================================================================== */

/** What carries a never-ending loop, itself or in its pseudo-elements. */
const LOOPS = [
  ".cta-drop",
  ".idx-lead",
  ".idx-ask",
  ".svc-folio",
  "[data-beckon]",
  ".std-faces-in",
  ".cmp-marked",
  ".live-dot",
  ".fo-drift",
  ".rp-ba",
].join(",");

/** Let go this far ahead of the screen's edges, so a loop is already
    running when it comes into view. */
const AHEAD = "25% 0px 25% 0px";

export function OffscreenPause() {
  useEffect(() => {
    const watched = new WeakSet<Element>();
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) el.removeAttribute("data-offscreen");
          else el.setAttribute("data-offscreen", "");
        }
      },
      { rootMargin: AHEAD },
    );

    const sweep = () => {
      for (const el of document.querySelectorAll(LOOPS)) {
        if (watched.has(el)) continue;
        watched.add(el);
        watch.observe(el);
      }
    };

    // New elements arrive in bursts (a whole section at a time): one sweep
    // per frame at most.
    let queued = 0;
    const later = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        sweep();
      });
    };

    sweep();
    // And dropped when they leave the page, so nothing is held on to.
    const arrivals = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.removedNodes) {
          if (!(node instanceof Element)) continue;
          for (const el of [node, ...node.querySelectorAll(LOOPS)])
            if (watched.has(el)) {
              watched.delete(el);
              watch.unobserve(el);
            }
        }
      later();
    });
    arrivals.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(queued);
      arrivals.disconnect();
      watch.disconnect();
    };
  }, []);

  return null;
}
