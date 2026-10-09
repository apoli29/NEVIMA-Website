/* ==================================================================
   Quality

   The water on this site is drawn by shaders that cost a great deal per
   pixel: every pixel reads the slab five times, runs eight waves of
   swell and walks the drops four times over. A desktop GPU takes that
   without noticing; a phone pays for it in heat and in frames, and a
   phone is also where the page is read most.

   So a touch device is drawn cheaper: fewer pixels, springs set further
   apart, fewer catch-up steps. Nothing is turned off, and nothing moves
   differently — the ripples still run at the same speed across the
   screen (see how COUPLE is scaled where this is used). A pointer is
   what tells the two apart, because a touch device is also the one that
   cannot use the hand-led part of the effect anyway.
   ================================================================== */

export function isCoarse() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}
