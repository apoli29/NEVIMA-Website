/** Set once the site has woken up in the browser (see return-keeper.tsx).
    A page drawn after that came by the router, not from the server, so
    it can decide for itself without anything having been painted first:
    the home page skips its opening there, and only there. */
export const booted = { done: false };
