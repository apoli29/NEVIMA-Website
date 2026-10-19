/** Set once the site has woken up in the browser (see return-keeper.tsx).
    A page drawn after that came by the router, not from the server, so
    it can decide for itself without anything having been painted first:
    the home page skips its opening there, and only there. */
export const booted = { done: false };

/** The class that holds the page still while the home page's opening plays
    (globals.css). Set before the first paint by OPENING_SCRIPT, in the head,
    on a fresh load of the home page; kept right after that by home.tsx,
    which takes it off once the page is handed back (or when the opening is
    skipped) and puts it on for an opening reached by the router. A class on
    the root, not `html:has([data-opening])`: that selector had the browser
    recalculate the style of the whole page each time anything was added to
    it, long after the opening was over. */
export const OPENING_CLASS = "nv-opening";

export const OPENING_SCRIPT = `if(/^\\/(pt\\/?)?$/.test(location.pathname))document.documentElement.classList.add("${OPENING_CLASS}")`;
