/* ==================================================================
   Where to come back to

   The portfolio is a room of its own, with no bar and no foot: the only
   way out is its "Exit portfolio", which takes the visitor back exactly
   where they were before they came in (user, 2026-10-12): the same page,
   scrolled to the same place, and on the home page without the opening
   played again.

   The spot is noted as a link to the portfolio is followed (see
   return-keeper.tsx), and kept for the tab only. Leaving, the portfolio
   leaves a note for the page it goes back to, which that page reads as it
   is drawn and then forgets. A note older than a few seconds is ignored,
   so it can never surface on some later visit.
   ================================================================== */

const SPOT_KEY = "nevima:return";
const RESTORE_KEY = "nevima:restore";
/** How long a note to restore a page is good for, in ms. */
const RESTORE_TTL = 8000;

import { goTo } from "@/components/page-wipe";

export const PORTFOLIO_PATH = "/portfolio";

export type Spot = {
  /** The page, path and query. */
  path: string;
  /** How far down it was scrolled, in CSS pixels. */
  y: number;
  /** The tab's history length as the portfolio was opened: one more on
      leaving means the portfolio is the very next entry, and going back
      is the same as going there. */
  depth: number;
};

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/** Notes the page as it stands, on the way into the portfolio. */
export function keepSpot() {
  write(SPOT_KEY, {
    path: window.location.pathname + window.location.search,
    y: Math.round(window.scrollY),
    depth: window.history.length,
  } satisfies Spot);
}

/** Leaves the portfolio for where the visitor was, or for the home page
    if they came straight to it. */
export function leavePortfolio() {
  const spot = read<Spot>(SPOT_KEY);
  if (!spot || spot.path.startsWith(PORTFOLIO_PATH)) {
    goTo("/");
    return;
  }
  write(RESTORE_KEY, { path: spot.path, y: spot.y, at: Date.now() });
  // Back, when the portfolio is the entry straight after the spot, so the
  // browser's own back button and this one agree; otherwise there again.
  // Either way through the router, so the page wipe carries over.
  if (window.history.length === spot.depth + 1) window.history.back();
  else goTo(spot.path);
}

type Restore = { path: string; y: number; at: number };

function pending(path: string): Restore | null {
  const note = read<Restore>(RESTORE_KEY);
  if (!note || note.path.split("?")[0] !== path || Date.now() - note.at > RESTORE_TTL) return null;
  return note;
}

/** Whether this page is being come back to from the portfolio (read, not
    used up: the home page asks it to skip its opening). */
export function isReturning(path: string) {
  return pending(path) !== null;
}

/** The place to put this page back at, used up as it is read. */
export function takeReturn(path: string): number | null {
  const note = pending(path);
  if (!note) return null;
  try {
    sessionStorage.removeItem(RESTORE_KEY);
  } catch {}
  return note.y;
}

/* The home page's opening is played once, as the visit begins (user,
   2026-10-12): coming back to the home page later, from the bar, the foot
   or the browser's back button, goes straight to the page. Kept for the
   tab, like the spot. */
const OPENED_KEY = "nevima:opened";

export function markOpened() {
  try {
    sessionStorage.setItem(OPENED_KEY, "1");
  } catch {}
}

export function hasOpened() {
  try {
    return sessionStorage.getItem(OPENED_KEY) === "1";
  } catch {
    return false;
  }
}
