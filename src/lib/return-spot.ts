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
/** How long going back may take before the portfolio goes there itself. */
const BACK_GRACE = 900;
/** How long the router may take after that before the page is loaded. */
const HARD_GRACE = 1600;

import { goTo } from "@/components/page-wipe";
import { basePath, langOf, localize } from "./i18n";

export const PORTFOLIO_PATH = "/portfolio";

/** Whether a path is the portfolio, in either language. */
export const isPortfolio = (path: string) => basePath(path) === PORTFOLIO_PATH;

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
  if (!spot || isPortfolio(spot.path.split("?")[0])) {
    const home = localize("/", langOf(window.location.pathname));
    goTo(home);
    insist(home, BACK_GRACE);
    return;
  }
  write(RESTORE_KEY, { path: spot.path, y: spot.y, at: Date.now() });
  // Back, when the portfolio is the entry straight after the spot, so the
  // browser's own back button and this one agree; otherwise there again.
  if (window.history.length !== spot.depth + 1) {
    goTo(spot.path);
    insist(spot.path, BACK_GRACE);
    return;
  }
  window.history.back();
  // Going back can take the address back without the page (the router
  // ignores an entry it did not make, such as one a "#top" link left):
  // what is checked is the page on screen, not the address.
  window.setTimeout(() => {
    if (!stillHere()) return;
    goTo(spot.path);
    insist(spot.path, HARD_GRACE);
  }, BACK_GRACE);
}

/** Whether the portfolio is still the page on screen. */
const stillHere = () => document.querySelector(".fo-room") !== null;

/** The last resort: if the router has not taken the visitor out after
    `wait` ms, the page is loaded outright, so no one is ever left in
    the room with its photos gone. */
function insist(path: string, wait: number) {
  window.setTimeout(() => {
    if (stillHere()) window.location.assign(path);
  }, wait + HARD_GRACE);
}

type Restore = { path: string; y: number; at: number };

function pending(path: string): Restore | null {
  const note = read<Restore>(RESTORE_KEY);
  if (!note || note.path.split("?")[0] !== path || Date.now() - note.at > RESTORE_TTL) return null;
  return note;
}

/** Whether this page is being put back by "Exit portfolio" just now. */
export function returningTo(path: string) {
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

/* The home page's opening plays whenever the site is loaded afresh (a
   first visit, a reload, a new tab, a typed address) and not when the
   visitor comes back to the home page from inside the site (the bar's or
   the foot's Home, the back button, "Exit portfolio"), user 2026-10-13.
   What is noted here is that it has been played in this tab, so a page
   the router brings can skip it (see home.tsx). */
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

/* ==================================================================
   Changing language

   The foot's switch opens the same page in the other language (user,
   2026-10-18). The visitor is kept where they were rather than sent to
   the top: the page is put back as far from its foot as it was, since
   the switch is in the foot and the two languages' pages are not quite
   the same height. Noted as the link is followed, read by the keeper
   once the page is there (return-keeper.tsx).
   ================================================================== */

const LANG_KEY = "nevima:lang-spot";

type LangSpot = { path: string; fromEnd: number; at: number };

export function keepLangSpot(path: string) {
  write(LANG_KEY, {
    path,
    fromEnd: Math.round(document.documentElement.scrollHeight - window.scrollY),
    at: Date.now(),
  } satisfies LangSpot);
}

/** How far from the foot to put this page back, used up as it is read. */
export function takeLangSpot(path: string): number | null {
  const note = read<LangSpot>(LANG_KEY);
  if (!note || note.path !== path || Date.now() - note.at > RESTORE_TTL) return null;
  try {
    sessionStorage.removeItem(LANG_KEY);
  } catch {}
  return note.fromEnd;
}
