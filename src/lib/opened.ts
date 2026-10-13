/** The cookie that says the home page's opening has been played in this
    browser session (see return-spot.ts and app/page.tsx). */
export const OPENED_COOKIE = "nevima-opened";

/** Set once the site has woken up in the browser (see return-keeper.tsx).
    A page drawn after that came by the router, not from the server, so
    it can decide for itself without anything having been painted first. */
export const booted = { done: false };
