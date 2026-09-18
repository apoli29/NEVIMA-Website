"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import { useReducedMotion } from "motion/react";

/* ==================================================================
   Goo trail

   A drop of something thick dragged across the foot of the page. It is
   not drawn as a trail: it is a short chain of round beads, each one
   chasing the one ahead of it and none of them quite keeping up, and
   the whole chain is blurred into a single layer whose alpha is then
   cut back to a hard edge. Beads that are near enough become one body
   with a neck between them; beads that fall behind pinch off and are
   swallowed again by the next one to arrive. Nothing draws the neck —
   it is what is left over when a blur is thresholded, and it is the
   same trick the sections use to divide one rectangle into several
   (see split-reveal.tsx).

   What makes it read as gel rather than as a cursor is the lag. Each
   bead takes only a third of its distance to the one in front per
   frame, so a quick flick strings the chain out into a thin thread and
   stopping lets it pool back into a single drop. The beads also taper
   from head to tail, which is what gives the thread a direction.

   Colour survives the cut. Only the alpha row of the matrix is steep,
   so the blur is left to mix the beads' own shading across the body and
   the shape comes back sharp around it: a lit top left and a heavier
   underside, which is what a drop of anything looks like.

   Mouse only, and only while the pointer is over its host. A finger has
   no hover to leave anything behind, and there is no sense running a
   blur over a footer nobody is pointing at.
   ================================================================== */

/** How many beads the chain is made of. */
const NODES = 18;
/** How much of its distance to the bead ahead each one takes per frame. */
const FOLLOW = 0.32;
/** Diameters, head to tail, in pixels. */
const HEAD = 66;
const TAIL = 10;
/** How far the blur reaches. Beads merge while they are within about
    1.35 of it, which at this spacing is most of the chain. */
const GOO = 11;
/** How dark the beads sit against the surface, once cut back. */
const SHOW = 0.22;
/** How long the chain keeps running after the pointer has left. */
const LINGER_MS = 900;

/** Somewhere off any screen, which is where the chain waits. */
const AWAY = -900;

const sizes = Array.from(
  { length: NODES },
  (_, i) => HEAD + (TAIL - HEAD) * (i / (NODES - 1)),
);

export function GooTrail({ host }: { host: RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion() ?? false;
  const layer = useRef<HTMLDivElement>(null);
  // One filter per trail: two of them on a page and an id is global.
  const filter = `nv-goo-trail-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    if (reduce) return;
    const surface = host.current;
    const skin = layer.current;
    if (!surface || !skin) return;
    // A finger has no hover, and a trackpad without a cursor has nothing
    // to trail.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const beads = [...skin.querySelectorAll<HTMLElement>("[data-bead]")];
    const chain = beads.map(() => ({ x: AWAY, y: AWAY }));
    const aim = { x: AWAY, y: AWAY };
    let frame = 0;
    let rest: number | undefined;

    const run = () => {
      let px = aim.x;
      let py = aim.y;
      for (let i = 0; i < chain.length; i++) {
        const bead = chain[i];
        bead.x += (px - bead.x) * FOLLOW;
        bead.y += (py - bead.y) * FOLLOW;
        // The next one chases this one, not the pointer: that is the whole
        // of the lag, and the whole of why it reads as one body being
        // dragged rather than as a row of dots being placed.
        px = bead.x;
        py = bead.y;
        beads[i].style.transform = `translate3d(${bead.x}px, ${bead.y}px, 0)`;
      }
      frame = requestAnimationFrame(run);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = surface.getBoundingClientRect();
      aim.x = event.clientX - box.left;
      aim.y = event.clientY - box.top;
      window.clearTimeout(rest);
      skin.style.opacity = String(SHOW);
      if (frame) return;
      // Gathered where the pointer is before the first frame, or the drop
      // would come swimming in from wherever it was last left.
      for (const bead of chain) {
        bead.x = aim.x;
        bead.y = aim.y;
      }
      frame = requestAnimationFrame(run);
    };

    const onLeave = () => {
      skin.style.opacity = "0";
      // Kept running while it fades, so it is seen draining off the edge
      // rather than being switched off at it.
      rest = window.setTimeout(() => {
        cancelAnimationFrame(frame);
        frame = 0;
      }, LINGER_MS);
    };

    surface.addEventListener("pointermove", onMove);
    surface.addEventListener("pointerleave", onLeave);
    return () => {
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
      window.clearTimeout(rest);
    };
  }, [host, reduce]);

  if (reduce) return null;

  return (
    <div
      ref={layer}
      aria-hidden="true"
      className="goo-trail pointer-events-none absolute inset-0 z-[1]"
      style={{ opacity: 0 }}
    >
      <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id={filter} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={GOO} result="soft" />
          {/* Alpha only. The colour rows are left alone so the beads keep
              their own shading through the blur, and only the shape is
              cut back to an edge. */}
          <feColorMatrix
            in="soft"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"
          />
        </filter>
      </svg>

      <div className="absolute inset-0" style={{ filter: `url(#${filter})` }}>
        {sizes.map((size, i) => (
          <span
            key={i}
            data-bead=""
            className="goo-bead absolute top-0 left-0 block rounded-full"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              transform: `translate3d(${AWAY}px, ${AWAY}px, 0)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
