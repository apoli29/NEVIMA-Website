"use client";

import { useId } from "react";
import type { T } from "./sbs-shared";
import { pilarSans } from "./sbs-pilar";

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
  before: () => React.ReactElement;
  after: () => React.ReactElement;
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

/** What it has: the land and the sky, and the T that stands on them. */
function TerralAfter() {
  return (
    <g>
      <rect {...sh(0)} x="8" y="10" width="84" height="16" rx="8" />
      <rect {...sh(1)} x="42" y="26" width="16" height="64" rx="8" />
      <rect {...sh(2)} x="8" y="74" width="26" height="16" rx="8" />
    </g>
  );
}

/* ================================================================== */

/** Only Pilar is shown (user, 2026-11-18): the studio did not want
    businesses invented beyond the one the site already runs on. The
    other two stay drawn, out of use, so putting either one back is a
    line in this list and nothing else. */
export const BRANDS: Brand[] = [
  {
    id: "pilar",
    name: "Pilar",
    trade: (t) => t("Insurance broker", "Mediação de seguros"),
    before: PilarBefore,
    after: PilarAfter,
  },
];

/** Kept, not thrown away: the two the page carried for a day. */
export const SPARE_BRANDS: Brand[] = [
  {
    id: "aurora",
    name: "Aurora",
    trade: (t) => t("Aesthetic clinic", "Clínica de estética"),
    before: AuroraBefore,
    after: AuroraAfter,
  },
  {
    id: "terral",
    name: "Terral",
    trade: (t) => t("Estate agent", "Mediação imobiliária"),
    before: TerralBefore,
    after: TerralAfter,
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
