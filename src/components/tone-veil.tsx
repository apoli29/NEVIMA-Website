"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

/* ==================================================================
   Tonal veil

   Between two sections, no line: the sections inside a room have no
   ground of their own, and one ground lies behind them, held to the
   screen and clipped to the room. Its tone follows the scroll: as a
   section's top goes from 75% to 33% down the screen, the ground passes
   from the tone of the section above to its own (smoothstep), both
   ways, and nothing moves while the page is still. The faint light in
   the top-left corner and the grain of the dark ground fade with the
   dark. The section going out dims and settles back a little while the
   one coming in takes its place; only a section's `[data-tone-body]`
   does, so a section can keep what is inside it untouched.

   Built for the SEO & GEO page on 2026-11-16 (user: "o resultado mais
   requintado e premium possível"; references through Inspo: Audo and
   Chloé's veils) and taken to the side-by-side page on 2026-11-17. The
   same idea as the about page's water.

   A section names its tone with `data-tone`: "dark" (#0b0b0b, the
   side-by-side ground), "ink" (#000) or "light" (#fff). The section
   after the room (Let's work together, under <main>) is taken as ink,
   so the last turn ends in it rather than against it; the section above
   it keeps its strength while it can still be read.
   ================================================================== */

const GREY: Record<string, number> = { dark: 11, ink: 0, light: 255 };
const TURN_FROM = 0.75;
const TURN_SPAN = 0.42;
const smooth = (x: number) => x * x * (3 - 2 * x);

export function ToneRoom({ children, className }: { children: ReactNode; className?: string }) {
  const room = useRef<HTMLDivElement>(null);
  const ground = useRef<HTMLDivElement>(null);
  const dusk = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    const r = room.current;
    const g = ground.current;
    if (!r || !g) return;
    const stops = Array.from(r.querySelectorAll<HTMLElement>(":scope > [data-tone]")).map((el) => ({
      el,
      grey: GREY[el.dataset.tone ?? "light"] ?? 255,
      body: el.querySelector<HTMLElement>("[data-tone-body]"),
      last: "",
    }));
    const sections = stops.length;
    const after = r.nextElementSibling ?? r.closest("main")?.nextElementSibling;
    if (after instanceof HTMLElement) stops.push({ el: after, grey: 0, body: null, last: "" });
    if (!sections) return;

    let lastGrey = -1;
    let queued = 0;
    const update = () => {
      queued = 0;
      const vh = window.innerHeight || 1;
      let grey = stops[0]!.grey;
      let own = grey;
      for (let k = 1; k < stops.length; k++) {
        const top = stops[k]!.el.getBoundingClientRect().top;
        const p = Math.min(Math.max((vh * TURN_FROM - top) / (vh * TURN_SPAN), 0), 1);
        grey += (stops[k]!.grey - grey) * smooth(p);
        if (k < sections) own = grey;
      }
      const key = Math.round(grey * 4);
      if (key !== lastGrey) {
        lastGrey = key;
        const c = Math.round(grey);
        g.style.backgroundColor = `rgb(${c} ${c} ${c})`;
        if (dusk.current) dusk.current.style.opacity = (1 - grey / 255).toFixed(3);
      }
      for (const stop of stops) {
        if (!stop.body) continue;
        // How much the ground is this section's own: 1 on its tone, 0 at
        // the far end. Below 1 it dims and settles back.
        const v = smooth(1 - Math.min(Math.abs(own - stop.grey) / 244, 1));
        const opacity = v > 0.999 ? "" : (0.42 + 0.58 * v).toFixed(3);
        const scale = reduce || v > 0.999 ? "" : `scale(${(0.97 + 0.03 * v).toFixed(4)})`;
        const next = opacity + "|" + scale;
        if (next === stop.last) continue;
        stop.last = next;
        stop.body.style.opacity = opacity;
        stop.body.style.transform = scale;
        stop.body.style.transformOrigin = scale ? "50% 40%" : "";
      }
    };
    const queue = () => {
      if (!queued) queued = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    // The page settling (fonts, photographs) moves the sections without a scroll.
    const settle = new ResizeObserver(queue);
    settle.observe(document.body);
    return () => {
      cancelAnimationFrame(queued);
      settle.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [reduce]);

  return (
    <div ref={room} className={`tv-room ${className ?? ""}`}>
      <div ref={ground} aria-hidden="true" className="tv-ground">
        <div ref={dusk} className="tv-dusk">
          <div className="tv-grain" />
        </div>
      </div>
      {children}
    </div>
  );
}
