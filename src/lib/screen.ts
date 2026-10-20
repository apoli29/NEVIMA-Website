/** The height of the screen the page is seen through, in pixels, as
    `--screen-h` on the root, which globals.css turns into `--screen`.

    `100svh` is meant to be that height with the browser's bars showing,
    but a browser built on another's engine (Chrome on an iPhone) can give
    the height of the whole window behind its bars instead: the second
    screen, held at 100svh, ran on under the bottom toolbar and its index
    was cut off there, and the opening, which stands on the visible window,
    grew by that much as it handed the page back, so the water was cut and
    redrawn and its drops jumped (user, 2026-10-20). The window's own
    height is read instead. On a touch screen the least height seen at
    that width is kept, which is the height with the bars out: as they
    tuck away on a scroll the screen stays the size it was, and nothing
    held a screen tall is resized under a finger. With a field being typed
    in, the keyboard's height is not the screen's. Set in the head, before
    the first paint (see layout.tsx). */
export const SCREEN_SCRIPT = `(function(){var d=document.documentElement,c=matchMedia("(pointer: coarse)"),w=0,h=0;function f(){var e=document.activeElement,W=innerWidth,H=innerHeight;if(c.matches&&W===w&&(H>=h||(e&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName))))return;w=W;h=H;d.style.setProperty("--screen-h",H+"px")}f();addEventListener("resize",f)})()`;
