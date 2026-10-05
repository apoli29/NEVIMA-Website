/* ==================================================================
   The glass the call-to-action drops are made of (see .cta-drop).

   Each drop's glass is a layer painted with three soft round spots. This
   filter melts them together (a blur), cuts the result at about half
   strength into one hard-edged piece (the alpha matrix), the way the
   value drops on the about page join, and then lights that piece: a body,
   a rim just inside its edge where the glass turns away, and, for the
   black glass, a soft shadow thrown down and to the right. The rim is the
   piece less a blurred copy of itself, so it is always exactly as thick
   whatever the size of the drop.

   Rendered once in the root layout, out of sight; every drop points at
   it by id.
   ================================================================== */

function Glass({
  id,
  body,
  rim,
  shadow,
}: {
  id: string;
  body: string;
  rim: string;
  shadow: boolean;
}) {
  return (
    <filter
      id={id}
      x="-15%"
      y="-40%"
      width="130%"
      height="190%"
      colorInterpolationFilters="sRGB"
    >
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="melt" />
      <feColorMatrix
        in="melt"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 24 -9"
        result="cut"
      />
      {/* A hair of softening, so the cut edge is not stepped. */}
      <feGaussianBlur in="cut" stdDeviation="0.5" result="piece" />
      <feGaussianBlur in="piece" stdDeviation="5" result="soft" />
      <feComposite in="piece" in2="soft" operator="out" result="edge" />
      <feFlood floodColor={rim} />
      <feComposite in2="edge" operator="in" result="rim" />
      <feFlood floodColor={body} />
      <feComposite in2="piece" operator="in" result="body" />
      {shadow && (
        <>
          <feOffset in="piece" dx="7" dy="10" />
          <feGaussianBlur stdDeviation="9" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.45" />
          </feComponentTransfer>
          <feComposite in2="piece" operator="out" result="shadow" />
        </>
      )}
      <feMerge>
        {shadow && <feMergeNode in="shadow" />}
        <feMergeNode in="body" />
        <feMergeNode in="rim" />
      </feMerge>
    </filter>
  );
}

export function CtaGlassFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <Glass id="cta-glass" body="#0b0b0b" rim="#5a5a5a" shadow />
        <Glass id="cta-glass-light" body="#ffffff" rim="#c4c4c4" shadow={false} />
      </defs>
    </svg>
  );
}
