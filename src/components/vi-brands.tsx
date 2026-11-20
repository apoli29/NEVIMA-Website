"use client";

import { useId } from "react";
import { Inter_Tight } from "next/font/google";
import type { T } from "./sbs-shared";
import { pilarSans } from "./sbs-pilar";

/** limen's own face: a tight neo-grotesk, regular weight, as its
    identity was drawn (2026-11-20). */
const limenSans = Inter_Tight({ subsets: ["latin"], weight: ["300", "400"], variable: "--f-limen-sans", display: "swap" });

/* ==================================================================
   Three invented businesses, each with the mark it had and the mark
   it ends up with

   The user asked for Pilar (the invented insurance broker the
   side-by-side page already runs on) plus two more, each with its own
   name, trade and pair of marks (2026-11-18). The two new ones are the
   two trades this studio is aimed at: a small clinic and an
   independent estate agent.

   Every mark is drawn here, in the site's own black and white, inside
   one square of a hundred units, so the pair can be laid side by side,
   swapped, or taken apart and built again without a single image file
   and without a line of type that is not ours.

   What makes a "before" look like a before is never a joke at its
   expense - it is the four things that actually date a mark: a drawn
   picture of the trade instead of a sign for it, an outline inside an
   outline, a flourish, and a frame around the lot. The "after" of each
   one answers with a single geometric figure the same trade can carry
   at any size.

   Pilar's new mark is the one the side-by-side page already uses
   (sbs-pilar.tsx); it is drawn again here only so that the shapes can
   be addressed one by one while the mark is built.

   Every shape carries .vi-sh and an index in --n, which is what lets
   the card in "Not sure?" take a mark apart and put the next one
   together, shape by shape.
   ================================================================== */

export type Brand = {
  id: string;
  /** The name is never translated; the trade beside it is. */
  name: string;
  trade: (t: T) => string;
  /** The subline under the wordmark, as it would be registered. */
  legal: (t: T) => string;
  before: () => React.ReactElement;
  after: () => React.ReactElement;
  /** Where the mark's own edges fall, for the construction plate:
      verticals, horizontals, and the lines its angles run along. All
      in the same square of a hundred the marks are drawn in. */
  guides: { x: number[]; y: number[]; diag: [number, number, number, number][] };
  /** The mark and the name together, as the business signed before and
      as it signs now. A brand without them is shown by its symbols. */
  oldLogo?: (t: T) => React.ReactElement;
  newLogo?: (t: T) => React.ReactElement;
};

const sh = (n: number) => ({ className: "vi-sh", style: { ["--n" as string]: n } });

/* ---- 1. Pilar, an insurance broker ------------------------------- */

/** What it had: the badge the template website carries (side-by-side.tsx,
    CLogo) - a blue disc graded top to bottom, an orange ring round it and
    an umbrella in white - drawn again here in the hundred-unit square so
    its shapes can be taken apart one by one (user, 2026-11-19: the mark
    shown as the old one is the one the template website already uses). */
function PilarBefore() {
  const id = useId().replace(/:/g, "");
  return (
    <g transform="scale(2.0833)">
      <defs>
        <linearGradient id={`vi-badge-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b9be0" />
          <stop offset="1" stopColor="#173f86" />
        </linearGradient>
      </defs>
      <circle {...sh(0)} cx="24" cy="24" r="22" fill={`url(#vi-badge-${id})`} stroke="#f39200" strokeWidth="2" />
      <path
        {...sh(1)}
        d="M10 25a14 12 0 0 1 28 0c-2.3-1.8-4.7-1.8-7 0-2.3-1.8-4.7-1.8-7 0-2.3-1.8-4.7-1.8-7 0-2.3-1.8-4.7-1.8-7 0z"
        fill="#fff"
      />
      <path {...sh(2)} d="M24 25v10c0 2.6 3.6 2.6 3.6 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/** What it has: the pillar and the opening beside it (sbs-pilar.tsx). */
function PilarAfter() {
  return (
    <g>
      <rect {...sh(0)} width="30" height="100" rx="8" />
      <path
        {...sh(1)}
        fillRule="evenodd"
        d="M44 0H76A24 24 0 0 1 100 24V42A24 24 0 0 1 76 66H44A6 6 0 0 1 38 60V6A6 6 0 0 1 44 0Z M59 23H79V43H59Z"
      />
    </g>
  );
}

/* ---- 2. Aurora, a small clinic ----------------------------------- */

/** What it had: a hand-drawn swash around a leaf, in a thin oval. */
function AuroraBefore() {
  return (
    <g>
      <ellipse {...sh(0)} cx="50" cy="50" rx="46" ry="34" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse {...sh(1)} cx="50" cy="50" rx="41" ry="29" fill="none" stroke="currentColor" strokeWidth="1" />
      <path
        {...sh(2)}
        d="M50 24 C68 34 70 56 50 72 C30 56 32 34 50 24 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path {...sh(3)} d="M50 28 V72" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        {...sh(4)}
        d="M18 76 C34 88 66 88 82 76"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

/** What it has: the first light over a line - one arc, one rule, one
    square cut out of the arc so the A reads inside it. */
function AuroraAfter() {
  return (
    <g>
      <path {...sh(0)} d="M6 62 A44 44 0 0 1 94 62 H78 A28 28 0 0 0 22 62 Z" />
      <rect {...sh(1)} x="6" y="76" width="88" height="10" rx="5" />
      <rect {...sh(2)} x="43" y="30" width="14" height="14" rx="3" />
    </g>
  );
}

/* ---- 3. Terral, an estate agent ---------------------------------- */

/** What it had: a drawn house, a chimney, a key and a ring around it. */
function TerralBefore() {
  return (
    <g>
      <circle {...sh(0)} cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
      <path {...sh(1)} d="M20 52 L50 26 L80 52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path {...sh(2)} d="M28 52 V78 H72 V52" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect {...sh(3)} x="64" y="28" width="8" height="14" />
      <rect {...sh(4)} x="44" y="60" width="12" height="18" fill="none" stroke="currentColor" strokeWidth="2" />
    </g>
  );
}

/** What it has: two masses, and the void between them.

    Drawn from the user's reference (2026-11-19) at four fifths: the
    gable built out of solid masses rather than an outline, the thin
    vertical void between them in place of any drawn line, the apex off
    to the left so one mass is wide and the other narrow, every angle
    at 45 degrees, and the whole thing sitting on the grid's bottom
    module.

    The fifth that is ours: the bottom corners turn at 6, a step off
    Pilar's 8, so the two marks are the same family while the apex
    stays sharp - that edge is the reference's own character.

    A bar of land ran under it until the user had it taken off
    (2026-11-20). What is left is the two masses and the void, which is
    the whole of the reference and nothing else. The mark was set out
    to stand on that bar, so with it gone it was drawn again at the
    size that fills the square, which is the size Pilar fills: side by
    side the two now carry the same weight.

    The void between the masses is eight hundredths wide, which is what
    keeps it above a pixel when the mark is set at sixteen - the size
    it has to survive. */
function TerralAfter() {
  return (
    <g>
      {/* the wide mass, up the left slope to the apex */}
      <path {...sh(0)} d="M14 40 L46 8 L46 92 H20 A6 6 0 0 1 14 86 Z" />
      {/* the narrow one, down the right slope */}
      <path {...sh(1)} d="M54 16 L86 48 V86 A6 6 0 0 1 80 92 H54 Z" />
    </g>
  );
}

/* ---- 4. limen, real estate and interiors ------------------------- */

/** What it had: a drawn roof over a four-paned window, a swash under
    them and a double ring round the lot - the picture of the trade, the
    outline in an outline, the flourish and the frame. */
function LimenBefore() {
  return (
    <g>
      <circle {...sh(0)} cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle {...sh(1)} cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
      <path {...sh(2)} d="M24 50 L50 28 L76 50" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <path {...sh(3)} d="M40 48 H60 V68 H40 Z M50 48 V68 M40 58 H60" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path {...sh(4)} d="M22 78 C40 88 62 88 80 72" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

/** What it has: a threshold drawn in plan - limen is Latin for it.

    Drawn from the user's reference (2026-11-20, a numeral built of one
    even stroke with square ends, set at the height of the name) at
    about three quarters: the monoline, the square ends, the glyph that
    is also a letter (the two walls read as an L).

    The quarter that is ours: two walls in L that lock into a room with
    two ways through, a door drawn in each as an architect draws one -
    the leaf, and the arc it swings - in a line a quarter the walls'
    weight, and a point of light in the middle. The user asked for it a
    little less minimal and more sophisticated than the walls alone;
    the two weights of line are what give it that. */
function LimenAfter() {
  return (
    <g fill="none" stroke="currentColor">
      <path {...sh(0)} d="M5.5 0V94.5H60M40 5.5H94.5V100" strokeWidth="11" strokeLinejoin="miter" />
      <path {...sh(1)} d="M11 5.5A29 29 0 0 0 40 34.5V11M89 94.5A29 29 0 0 0 60 65.5V89" strokeWidth="2.6" />
      <path {...sh(2)} d="M50 43.6L56.4 50L50 56.4L43.6 50Z" fill="currentColor" stroke="none" />
    </g>
  );
}

/* ================================================================== */

/** Terral, kept whole and out of use: limen took its card on
    2026-11-20 (user). */
const TERRAL: Brand = {
  id: "terral",
  name: "Terral",
  trade: (t) => t("Estate agent", "Mediação imobiliária"),
  legal: (t) => t("Terral Properties, Lda.", "Terral Imobiliária, Lda."),
  before: TerralBefore,
  after: TerralAfter,
  oldLogo: (t) => <TerralOldLogo t={t} />,
  newLogo: (t) => <TerralNewLogo t={t} />,
  /* The walls, the apex and the baseline, and the two lines the
     slopes run along, carried past the mark. */
  guides: {
    x: [14, 46, 54, 86],
    y: [8, 40, 92],
    diag: [
      [0, 54, 54, 0],
      [38, 0, 100, 62],
    ],
  },
};

export const BRANDS: Brand[] = [
  {
    id: "pilar",
    name: "Pilar",
    trade: (t) => t("Insurance broker", "Mediação de seguros"),
    legal: (t) => t("Pilar Insurance, Lda.", "Pilar Seguros, Lda."),
    before: PilarBefore,
    after: PilarAfter,
    oldLogo: (t) => <PilarOldLogo t={t} />,
    newLogo: (t) => <PilarNewLogo t={t} />,
    /* The pillar's own edges, and the square's diagonals, which is how
       a mark on a grid is actually set out. */
    guides: {
      x: [0, 30, 38, 44, 76, 100],
      y: [0, 24, 42, 66, 100],
      diag: [
        [0, 0, 100, 100],
        [100, 0, 0, 100],
      ],
    },
  },
  {
    id: "limen",
    name: "limen",
    trade: (t) => t("Real estate & interiors", "Imobiliário e interiores"),
    legal: (t) => t("limen Real Estate & Interiors, Lda.", "limen Imobiliário & Interiores, Lda."),
    before: LimenBefore,
    after: LimenAfter,
    oldLogo: (t) => <LimenOldLogo t={t} />,
    newLogo: (t) => <LimenNewLogo t={t} />,
    /* The walls' edges, where the doors hinge and where their leaves
       end, and the diagonal the two openings sit on. */
    guides: {
      x: [0, 11, 40, 60, 89, 100],
      y: [0, 11, 34.5, 65.5, 89, 100],
      diag: [
        [0, 0, 100, 100],
        [100, 0, 0, 100],
      ],
    },
  },
];

/** Kept, not thrown away. Terral was on the page from 2026-11-19 to
    2026-11-20; Aurora was drawn and never shown. */
export const SPARE_BRANDS: Brand[] = [
  TERRAL,
  {
    id: "aurora",
    name: "Aurora",
    trade: (t) => t("Aesthetic clinic", "Clínica de estética"),
    legal: (t) => t("Aurora Clinic, Lda.", "Clínica Aurora, Lda."),
    before: AuroraBefore,
    after: AuroraAfter,
    guides: {
      x: [6, 22, 50, 78, 94],
      y: [30, 44, 62, 76, 86],
      diag: [
        [0, 0, 100, 100],
        [100, 0, 0, 100],
      ],
    },
  },
];

/** One mark, drawn at whatever size the box gives it. */
export function Mark({ brand, side }: { brand: Brand; side: "before" | "after" }) {
  const Draw = side === "before" ? brand.before : brand.after;
  return (
    <svg className="vi-mark-svg" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <Draw />
    </svg>
  );
}

/* ---- Pilar's two identities, whole ------------------------------- */

/** The logo the template website carries, as it carries it: the badge,
    "Pilar" in a slanted serif with the descriptor in orange capitals
    beside it, and the company's full name under them. On the white of
    that website's header. */
export function PilarOldLogo({ t }: { t: T }) {
  return (
    <span className="vi-logo vi-logo-old">
      <span className="vi-logo-mark">
        <Mark brand={BRANDS[0]!} side="before" />
      </span>
      <span className="vi-logo-words">
        <span className="vi-logo-old-name">
          <b>Pilar</b>
          <i>{t("INSURANCE", "SEGUROS")}</i>
        </span>
        <small>{t("Insurance Brokerage, Lda.", "Mediação de Seguros, Lda.")}</small>
      </span>
    </span>
  );
}

/** The signature our website carries (sbs-pilar.tsx, PilarLogo): the
    symbol and the name in Pilar's own face, in white on its Noite. */
export function PilarNewLogo({ t }: { t: T }) {
  return (
    <span className={`vi-logo vi-logo-new ${pilarSans.variable}`}>
      <span className="vi-logo-mark">
        <Mark brand={BRANDS[0]!} side="after" />
      </span>
      <span className="vi-logo-new-name">{t("Pilar Insurance", "Pilar Seguros")}</span>
    </span>
  );
}

/* ---- Terral's two signatures ------------------------------------- */

/** How it signed before: a serif name with a bevel under it, a word of
    the trade tracked out beside it in a second colour, and the legal
    line in grey - the three habits that date a signature. Its colours
    are the business's own, not ours, as Pilar's old blue is.

    It stands the mark over the name rather than beside it (user,
    2026-11-20: the name goes where the bar of land used to be), which
    is also the only way a gable and a word sit together without one of
    them going small. */
export function TerralOldLogo({ t }: { t: T }) {
  return (
    <span className="vi-logo vi-logo-stack vi-logo-told">
      <span className="vi-logo-mark">
        <Mark brand={TERRAL} side="before" />
      </span>
      <span className="vi-logo-words">
        <span className="vi-logo-told-name">
          <b>Terral</b>
          <i>{t("PROPERTIES", "IMOBILI\u00c1RIA")}</i>
        </span>
        <small>{t("Property Brokerage, Lda.", "Media\u00e7\u00e3o Imobili\u00e1ria, Lda.")}</small>
      </span>
    </span>
  );
}

/** How it signs now: the mark, and the name under it in the face the
    website is set in, because the two were drawn together. White, so
    it carries on any ground the business puts it on. */
export function TerralNewLogo({ t }: { t: T }) {
  return (
    <span className="vi-logo vi-logo-stack vi-logo-tnew">
      <span className="vi-logo-mark">
        <Mark brand={TERRAL} side="after" />
      </span>
      <span className="vi-logo-tnew-name">{t("Terral", "Terral")}</span>
    </span>
  );
}

/* ---- limen's two signatures -------------------------------------- */

/** How it signed before: the ringed picture, the name in a slanted
    serif with a bevel, the trade tracked out beside it in a second
    colour and the legal line in grey. Its colours are the business's
    own, as Pilar's old blue is. */
export function LimenOldLogo({ t }: { t: T }) {
  return (
    <span className="vi-logo vi-logo-lold">
      <span className="vi-logo-mark">
        <Mark brand={BRANDS[1]!} side="before" />
      </span>
      <span className="vi-logo-words">
        <span className="vi-logo-lold-name">
          <b>Limen</b>
          <i>{t("INTERIORS", "INTERIORES")}</i>
        </span>
        <small>{t("Real Estate & Decoration, Lda.", "Imobiliária & Decoração, Lda.")}</small>
      </span>
    </span>
  );
}

/** How it signs now, as its identity was drawn: the threshold at the
    height of the name, the name in lower case, the ® over its end and
    the trade in two short lines beside it, on the base line. In its
    Linen, on its Basalt. */
export function LimenNewLogo({ t }: { t: T }) {
  return (
    <span className={`vi-logo vi-logo-lnew ${limenSans.variable}`}>
      <span className="vi-logo-mark">
        <Mark brand={BRANDS[1]!} side="after" />
      </span>
      <span className="vi-logo-new-name vi-logo-lnew-name">
        <span className="vi-logo-lnew-word">
          limen<sup>&#174;</sup>
        </span>
        <span className="vi-logo-lnew-trade">
          {t("Real Estate", "Imobiliário")}
          <br />
          {t("& Interiors", "& Interiores")}
        </span>
      </span>
    </span>
  );
}
