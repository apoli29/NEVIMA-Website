"use client";

import { createContext, useContext, useRef, type ReactNode, type RefObject } from "react";

/* ==================================================================
   The water belongs to the screen (user, 2026-11-12)

   Mission and vision sit on plain white, the values on the water, the
   questions on plain white again. The change between them is not a new
   section coming up with another ground: the ground belongs to the
   screen, and the whole screen turns from white to water as the values
   come up, and back to white as the questions do (the timing is in
   about-values.tsx).

   So the water's canvas is not the values' own: it is one screen high,
   held to the screen for as long as the three sections pass, under all
   three (which have no ground of their own), and the values draw on it.
   ================================================================== */

const RoomCanvas = createContext<RefObject<HTMLCanvasElement | null> | null>(null);

/** The screen's water canvas, for the values to draw on. */
export const useRoomCanvas = () => useContext(RoomCanvas);

export function AboutRoom({ children }: { children: ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  return (
    <RoomCanvas.Provider value={canvas}>
      <div className="relative">
        {/* Painted first, so the sections (positioned, later) lie over it;
            one screen high and taking no room of its own. */}
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="pointer-events-none sticky top-0 -mb-[100lvh] block h-lvh w-full"
        />
        {children}
      </div>
    </RoomCanvas.Provider>
  );
}
